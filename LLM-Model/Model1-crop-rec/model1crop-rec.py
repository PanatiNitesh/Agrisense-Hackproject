from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import joblib
from pymongo import MongoClient
from datetime import datetime
from openai import OpenAI
import os
import dotenv
# -------------------------
# Config
# -------------------------
dotenv.load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLL = os.getenv("MONGO_COLL")

MODEL_PATH = "crop_model.joblib"
IMPUTER_PATH = "crop_imputer.joblib"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

HF_TOKEN = os.getenv("HF_TOKEN")

# -------------------------
# Load model & imputer
# -------------------------
clf = joblib.load(MODEL_PATH)
imp = joblib.load(IMPUTER_PATH)

# Precompute centroids
client = MongoClient(MONGO_URI)
coll = client[MONGO_DB][MONGO_COLL]

crop_df = pd.DataFrame(list(coll.find()))
centroids = crop_df[FEATURES].copy()
centroids["label"] = crop_df["crop"].values
centroids = centroids.groupby("label")[FEATURES].mean()
centroid_labels = centroids.index.to_list()
centroid_matrix = centroids.values

def centroid_similarity_vector(feature_vec):
    dists = np.linalg.norm(centroid_matrix - feature_vec.reshape(1, -1), axis=1)
    sims = 1.0 / (1.0 + dists)
    norm = (sims - sims.min()) / (sims.max() - sims.min()) if sims.max() != sims.min() else np.ones_like(sims)
    return dict(zip(centroid_labels, norm))

# -------------------------
# LLM Client
# -------------------------
llm_client = None
if HF_TOKEN:
    try:
        llm_client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=HF_TOKEN)
    except Exception as e:
        print(f"Warning: LLM client init failed: {e}")
        llm_client = None

def get_cultivation_advice(client, crop_name, features):
    if not client:
        return None
    prompt = f"""
    Provide concise cultivation advice for '{crop_name}'.
    Environmental & soil conditions:
    - N: {features['N']:.2f}
    - P: {features['P']:.2f}
    - K: {features['K']:.2f}
    - pH: {features['ph']:.2f}
    - Temp: {features['temperature']:.2f}°C
    - Humidity: {features['humidity']:.2f}%
    - Rainfall: {features['rainfall']:.2f}mm

    Suggest land prep, sowing, fertilization, irrigation in bullets.
    """
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=512,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Could not generate advice: {e}"

# -------------------------
# Scoring & Recommendations
# -------------------------
def get_all_crop_scores(feat_dict):
    df_in = pd.DataFrame([feat_dict], columns=FEATURES)
    df_in = pd.DataFrame(imp.transform(df_in), columns=FEATURES)
    
    probs = clf.predict_proba(df_in)[0]
    prob_map = dict(zip(clf.classes_, probs))
    sim_map = centroid_similarity_vector(df_in.values.flatten())
    
    all_scores = {}
    for crop in clf.classes_:
        crop_lower = crop.lower()
        p = prob_map.get(crop, 0.0)
        s = sim_map.get(crop, 0.0)
        all_scores[crop_lower] = {
            "crop": crop,
            "probability": float(p),
            "centroid_similarity": float(s),
            "final_score": float(0.5 * p + 0.5 * s)
        }
    return all_scores

# -------------------------
# FastAPI App
# -------------------------
app = FastAPI(title="Farmer Crop Recommendation API")

class FarmerRequest(BaseModel):
    farmerId: str

@app.post("/m1/recommendation")
def recommend_crop(req: FarmerRequest):
    farmer_doc = coll.find_one({"farmerId": req.farmerId})
    if not farmer_doc:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    if any(pd.isna(farmer_doc.get(k)) for k in FEATURES):
        return {"farmerId": req.farmerId, "msg": "Missing required fields."}

    feat = {k: float(farmer_doc[k]) for k in FEATURES}
    actual_crop = str(farmer_doc.get("crop", "")).strip().lower()

    all_scores = get_all_crop_scores(feat)

    # Existing crop analysis
    existing_crop_analysis = None
    advice_for_existing_crop = None
    if actual_crop and actual_crop in all_scores:
        score_details = all_scores[actual_crop]
        other_scores = [s['final_score'] for k, s in all_scores.items() if k != actual_crop]
        max_score_other = max(other_scores) if other_scores else 1.0
        suitability_pct = (score_details['final_score'] / max_score_other * 100) if max_score_other > 0 else 100
        existing_crop_analysis = {
            "crop": score_details['crop'],
            "suitability_score_pct": float(round(suitability_pct, 2)),
            "details": score_details
        }
        if llm_client:
            advice_for_existing_crop = get_cultivation_advice(llm_client, score_details['crop'], feat)

    # New recommendations
    sorted_scores = sorted(all_scores.values(), key=lambda x: x['final_score'], reverse=True)
    new_recommendations = [s for s in sorted_scores if s['crop'].lower() != actual_crop][:3]
    top_new_score = new_recommendations[0]['final_score'] if new_recommendations else 1.0
    for rec in new_recommendations:
        rec['confidence_pct'] = float(round(100.0 * rec['final_score'] / top_new_score, 2)) if top_new_score > 0 else 0.0

    advice_for_new_crop = None
    if llm_client and new_recommendations:
        advice_for_new_crop = get_cultivation_advice(llm_client, new_recommendations[0]['crop'], feat)

    return {
        "farmerId": req.farmerId,
        "features_used": feat,
        "existing_crop_analysis": existing_crop_analysis,
        "advice_for_existing_crop": advice_for_existing_crop,
        "new_crop_recommendations": new_recommendations,
        "advice_for_top_new_crop": advice_for_new_crop,
        "recommended_at": datetime.utcnow().isoformat()
    }
