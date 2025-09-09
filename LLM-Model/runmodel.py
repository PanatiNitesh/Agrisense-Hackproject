from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from pymongo import MongoClient
from datetime import datetime
from openai import OpenAI
import os
import dotenv
import json
import io
import tensorflow as tf
from PIL import Image

# -------------------------
# Config
# -------------------------
dotenv.load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLL = os.getenv("MONGO_COLL")
HF_TOKEN = os.getenv("HF_TOKEN")

# Model paths
CROP_MODEL_PATH = "Model-crop-rec/crop_model.joblib"
CROP_IMPUTER_PATH = "Model-crop-rec/crop_imputer.joblib"
YIELD_MODEL_PATH = "Model-yeild-rec/yield_model_from_csv.joblib"
DISEASE_MODEL_PATH = "Model-plant/plant_disease_model.h5" # <-- NEW

# --- NEW: Disease Class Names ---
## IMPORTANT: Update with your actual class names in the correct order ##
DISEASE_CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

# Feature sets
CROP_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
YIELD_FEATURES = ['Year', 'rainfall_mm', 'pesticides_tonnes', 'avg_temp', 'Area', 'Item']
AI_MODEL_NAME = "openai/gpt-oss-120b:cerebras"

# -------------------------
# Load models & imputer
# -------------------------
print("Loading machine learning models...")
clf = joblib.load(CROP_MODEL_PATH)
imp = joblib.load(CROP_IMPUTER_PATH)
yield_model = joblib.load(YIELD_MODEL_PATH)
print("Crop, Imputer, and Yield models loaded successfully.")

# --- NEW: Load Disease Detection Model ---
disease_model = None
try:
    if os.path.exists(DISEASE_MODEL_PATH):
        disease_model = tf.keras.models.load_model(DISEASE_MODEL_PATH)
        print("Plant disease detection model loaded successfully.")
    else:
        print(f"Warning: Disease model not found at {DISEASE_MODEL_PATH}")
except Exception as e:
    print(f"Error loading disease model: {e}")


# Database connection
client = MongoClient(MONGO_URI)
coll = client[MONGO_DB][MONGO_COLL]

# -------------------------
# LLM Client (for gpt-oss-120b text generation)
# -------------------------
llm_client = None
if HF_TOKEN:
    try:
        llm_client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=HF_TOKEN,
            default_headers={"Accept-Encoding": "identity"}
        )
        print("LLM client for text generation initialized.")
    except Exception as e:
        print(f"Warning: LLM client init failed: {e}")
        llm_client = None

# -------------------------
# NEW: Image Preprocessing Helper
# -------------------------
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Reads image bytes, resizes to 128x128, normalizes, and prepares for the model."""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB") # Ensure 3 channels
    img = img.resize((128, 128))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = img_array / 255.0  # Normalize to [0, 1]
    img_batch = np.expand_dims(img_array, axis=0) # Add batch dimension
    return img_batch

# -------------------------
# Core Logic Functions
# -------------------------
def get_crop_recommendation_logic(farmer_doc: dict):
    # This function remains the same
    if any(pd.isna(farmer_doc.get(k)) for k in CROP_FEATURES):
        raise ValueError("Missing required fields for crop recommendation.")
    feat = {k: float(farmer_doc[k]) for k in CROP_FEATURES}
    actual_crop = str(farmer_doc.get("crop", "")).strip().lower()
    df_in = pd.DataFrame([feat], columns=CROP_FEATURES)
    df_in_imp = pd.DataFrame(imp.transform(df_in), columns=CROP_FEATURES)
    probs = clf.predict_proba(df_in_imp)[0]
    prob_map = dict(zip(clf.classes_, probs))
    crop_df = pd.DataFrame(list(coll.find()))
    centroids = crop_df.groupby("crop")[CROP_FEATURES].mean()
    centroid_matrix = centroids.values
    dists = np.linalg.norm(centroid_matrix - df_in_imp.values.reshape(1, -1), axis=1)
    sims = 1.0 / (1.0 + dists)
    sim_map = dict(zip(centroids.index, sims))
    all_scores = {}
    for crop in clf.classes_:
        p = prob_map.get(crop, 0.0)
        s = sim_map.get(crop, 0.0)
        all_scores[crop.lower()] = { "crop": crop, "probability": float(p), "centroid_similarity": float(s), "final_score": float(0.5 * p + 0.5 * s) }
    advice_for_existing_crop = None
    if actual_crop and actual_crop in all_scores and llm_client:
        advice_for_existing_crop = get_cultivation_advice(llm_client, all_scores[actual_crop]['crop'], feat)
    sorted_scores = sorted(all_scores.values(), key=lambda x: x['final_score'], reverse=True)
    new_recommendations = [s for s in sorted_scores if s['crop'].lower() != actual_crop][:3]
    advice_for_new_crop = None
    if new_recommendations and llm_client:
        advice_for_new_crop = get_cultivation_advice(llm_client, new_recommendations[0]['crop'], feat)
    return {
        "features_used": feat,
        "new_crop_recommendations": new_recommendations,
        "advice_for_top_new_crop": advice_for_new_crop,
        "advice_for_existing_crop": advice_for_existing_crop
    }

def get_yield_prediction_logic(farmer_doc: dict):
    # This function remains the same
    yield_input = {
        'Year': farmer_doc.get('year', datetime.now().year),
        'rainfall_mm': farmer_doc.get('rainfall'),
        'pesticides_tonnes': farmer_doc.get('pesticides_tonnes', 0.0),
        'avg_temp': farmer_doc.get('temperature'),
        'Area': farmer_doc.get('state', 'Unknown'),
        'Item': farmer_doc.get('crop')
    }
    missing_fields = [k for k in YIELD_FEATURES if yield_input.get(k) is None]
    if missing_fields:
        raise ValueError(f"Missing required fields for yield prediction: {missing_fields}")
    yield_input_data = pd.DataFrame([yield_input], columns=YIELD_FEATURES)
    predicted_yield_hg_ha = yield_model.predict(yield_input_data)[0]
    predicted_yield_quintal_ha = float(round(predicted_yield_hg_ha / 10, 2))
    return {
        "predicted_yield_quintal_per_hectare": predicted_yield_quintal_ha,
        "features_used": yield_input
    }

# -------------------------
# LLM Helper Functions
# -------------------------

def get_cultivation_advice(client, crop_name, features):
    if not client: return "LLM client not available for advice generation."
    prompt = f"Provide concise cultivation advice for '{crop_name}' given these conditions: N={features['N']:.2f}, P={features['P']:.2f}, K={features['K']:.2f}, pH={features['ph']:.2f}, Temp={features['temperature']:.2f}C, Humidity={features['humidity']:.2f}%, Rainfall={features['rainfall']:.2f}mm. Suggest land prep, sowing, fertilization, irrigation in bullets."
    try:
        completion = client.chat.completions.create(model=AI_MODEL_NAME, messages=[{"role": "user", "content": prompt}], temperature=0.7, max_tokens=512)
        return completion.choices[0].message.content.strip()
    except Exception as e: return f"Could not generate advice: {e}"

def generate_yield_advice(client, farmer_data, prediction):
    if not client: return "LLM client not available for advice generation."
    prompt = f"An expert agronomist providing 2-3 key bullet points to improve crop yield. Farmer's crop: '{farmer_data.get('crop')}' in an area of {farmer_data.get('areaHectare')} ha. Our model predicts a yield of {prediction:.2f} quintals per hectare. Focus on practical steps."
    try:
        completion = client.chat.completions.create(model=AI_MODEL_NAME, messages=[{"role": "user", "content": prompt}], temperature=0.7, max_tokens=512)
        return completion.choices[0].message.content.strip()
    except Exception as e: return f"Could not generate yield advice: {e}"

def get_intent_from_llm(client, query: str):
    if not client: return {"intent": "UNKNOWN", "error": "LLM client not available."}
    prompt = f"""Analyze the user's query and classify it into one of the intents: 'CROP_RECOMMENDATION', 'YIELD_PREDICTION', or 'GREETING'. Respond ONLY with a JSON object like {{"intent": "YOUR_CLASSIFICATION"}}. User query: "{query}" """
    try:
        completion = client.chat.completions.create(model=AI_MODEL_NAME, messages=[{"role": "user", "content": prompt}], temperature=0.1, max_tokens=50)
        result_text = completion.choices[0].message.content.strip()
        return json.loads(result_text)
    except Exception as e:
        print(f"LLM intent classification failed: {e}")
        return {"intent": "UNKNOWN"}

# -------------------------
# FastAPI App & Pydantic Models
# -------------------------
app = FastAPI(title="Farmer AI Services API")

class FarmerRequest(BaseModel):
    farmerId: str

class VoiceQueryRequest(BaseModel):
    farmerId: str
    query: str

# -------------------------
# API Endpoints
# -------------------------

@app.get("/")
def read_root():
    return {"status": "API is running", "timestamp": datetime.now().isoformat()}

@app.post("/m1/crop-recommendation")
def recommend_crop(req: FarmerRequest):
    farmer_doc = coll.find_one({"farmerId": req.farmerId})
    if not farmer_doc:
        raise HTTPException(status_code=404, detail="Farmer not found")
    try:
        result = get_crop_recommendation_logic(farmer_doc)
        return { "farmerId": req.farmerId, **result, "recommended_at": datetime.utcnow().isoformat() }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/m1/yield")
def predict_yield(req: FarmerRequest):
    farmer_doc = coll.find_one({"farmerId": req.farmerId})
    if not farmer_doc:
        raise HTTPException(status_code=404, detail="Farmer not found")
    try:
        result = get_yield_prediction_logic(farmer_doc)
        advice = generate_yield_advice(llm_client, farmer_doc, result["predicted_yield_quintal_per_hectare"])
        return { "farmerId": req.farmerId, **result, "yield_advice": advice, "predicted_at": datetime.utcnow().isoformat() }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yield prediction failed: {e}")

@app.post("/m1/voice-query")
def handle_voice_query(req: VoiceQueryRequest):
    farmer_doc = coll.find_one({"farmerId": req.farmerId})
    if not farmer_doc:
        raise HTTPException(status_code=404, detail="Farmer not found")
    intent_data = get_intent_from_llm(llm_client, req.query)
    intent = intent_data.get("intent")
    response_text = "I'm sorry, I couldn't process that request."
    if intent == "CROP_RECOMMENDATION":
        try:
            result = get_crop_recommendation_logic(farmer_doc)
            top_crop = result['new_crop_recommendations'][0]['crop'] if result['new_crop_recommendations'] else 'a suitable crop'
            response_text = f"Based on your farm's data, I recommend planting {top_crop}. {result['advice_for_top_new_crop']}"
        except Exception as e:
            response_text = f"I tried to get a crop recommendation, but an error occurred: {e}"
    elif intent == "YIELD_PREDICTION":
        try:
            result = get_yield_prediction_logic(farmer_doc)
            yield_val = result['predicted_yield_quintal_per_hectare']
            advice = generate_yield_advice(llm_client, farmer_doc, yield_val)
            response_text = f"The predicted yield for your {farmer_doc.get('crop', 'crop')} is {yield_val} quintals per hectare. Here is some advice to improve it: {advice}"
        except Exception as e:
            response_text = f"I tried to predict the yield, but an error occurred: {e}"
    elif intent == "GREETING":
        response_text = "Hello! How can I assist you with your farm today? You can ask for a crop recommendation or a yield prediction."
    else: # UNKNOWN
        response_text = "I'm sorry, I didn't understand that. Please ask for a crop recommendation or a yield prediction."
    return {"response_text": response_text}

# -------------------------
# NEW: Plant Disease Endpoint
# -------------------------
@app.post("/m2/plant-disease")
async def detect_plant_disease(file: UploadFile = File(...)):
    """Endpoint for plant disease detection from an image."""
    if not disease_model:
        raise HTTPException(status_code=503, detail="Disease detection service is unavailable.")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        # Read and process the image
        image_bytes = await file.read()
        processed_image = preprocess_image(image_bytes)

        # Make prediction
        predictions = disease_model.predict(processed_image)
        
        # Process result
        predicted_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_index])
        predicted_class = DISEASE_CLASS_NAMES[predicted_index]

        return {
            "predicted_class": predicted_class,
            "confidence": f"{confidence:.2%}", # Format as percentage string
            "details": {
                "raw_predictions": predictions[0].tolist(),
                "class_names": DISEASE_CLASS_NAMES
            }
        }
    except Exception as e:
        print(f"Error during disease prediction: {e}")
        raise HTTPException(status_code=500, detail="Failed to process the image.")