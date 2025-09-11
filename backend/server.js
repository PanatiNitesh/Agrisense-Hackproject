// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(bodyParser.json());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Security middlewares
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(helmet());

// Rate limiter for incoming requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later."
});
app.use(limiter);

// --- Environment Variables ---
const Mongo = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const WEATHER_API = process.env.WEATHERAPI_COM_KEY;
const HF_TOKEN = process.env.HF_TOKEN; 
const PYTHON_API_URL = process.env.AI_SERVICE_URL;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const OPENAI_COMPATIBLE_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions'; 
const AI_MODEL_NAME = 'openai/gpt-oss-120b:cerebras';

const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY;
const AGMARKNET_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
// In-memory cache for weather and soil data
const weatherCache = new Map();
const soilCache = new Map();
const CACHE_DURATION = 2 * 60 * 60 * 1000;

const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        ...options,
        headers: {
          'User-Agent': 'AgriSense/1.0',
          'Accept': 'application/json'
        }
      });
      console.log('Agmarknet API response:', response.data); // Debug log
      return response;
    } catch (err) {
      console.error('Agmarknet API error:', err.message, err.response?.data);
      if (err.response?.status === 429 && i < retries - 1) {
        const delay = backoff * Math.pow(2, i);
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(err.response?.data?.error || err.message || 'Failed to fetch from Agmarknet API');
    }
  }
};

// Geocoding function to get lat/lon from location
const getCoordinates = async (locationQuery) => {
  try {
    const response = await fetchWithRetry(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`
    );
    const data = response.data;
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return null;
  }
};


// MongoDB connection
mongoose.connect(Mongo)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ... (Mongoose schemas remain the same)
// Device schema for tracking cameras and sensors
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true },
  deviceType: { type: String, enum: ["camera", "sensor"], required: true },
  deviceName: { type: String, required: true },
  location: {
    latitude: Number,
    longitude: Number,
    description: String
  },
  status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
  lastDataReceived: { type: Date, default: Date.now },
  specifications: {
    model: String,
    version: String,
    capabilities: [String]
  },
  installationDate: { type: Date, default: Date.now },
  maintenanceSchedule: Date
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);

// FIXED: Farmer Assets Schema with proper defaults and optional fields
const farmerAssetsSchema = new mongoose.Schema({
  farmerId: { type: String, required: true, unique: true },
  sensors: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    model: { type: String, default: 'Unknown Model' }, // Made optional with default
    isActive: { type: Boolean, default: true },
    addedDate: { type: String, default: () => new Date().toLocaleDateString() }, // Made optional with default
    lastUpdated: { type: Date, default: Date.now }
  }],
  cameras: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    model: { type: String, default: 'Unknown Model' }, // Made optional with default
    isActive: { type: Boolean, default: true },
    addedDate: { type: String, default: () => new Date().toLocaleDateString() }, // Made optional with default
    lastUpdated: { type: Date, default: Date.now }
  }],
  drones: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    model: { type: String, default: 'Unknown Model' }, // Made optional with default
    isActive: { type: Boolean, default: true },
    addedDate: { type: String, default: () => new Date().toLocaleDateString() }, // Made optional with default
    lastUpdated: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'farmerAssets' // Explicitly set collection name
});

const FarmerAssets = mongoose.model('FarmerAssets', farmerAssetsSchema);

// *** REMOVED hfToken from Farmer schema ***
const farmerSchema = new mongoose.Schema({
  farmerId: { type: String, required: true, unique: true },
  farmerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  state: String,
  district: String,
  currentCity: String,
  crop: String,
  season: String,
  year: Number,
  areaHectare: Number,
  yieldQuintal: Number,
  N: Number,
  P: Number,
  K: Number,
  temperature: Number,
  humidity: Number,
  ph: Number,
  rainfall: Number,
  soilTemperature: Number,
  soilMoisture: Number,
  role: { type: String, enum: ["farmer", "admin"], default: "farmer" }
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', farmerSchema);

// Soil data schema for historical tracking
const soilDataSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  deviceId: String,
  ph: Number,
  temperature: Number,
  moisture: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  location: {
    latitude: Number,
    longitude: Number
  },
  timestamp: { type: Date, default: Date.now }
});

const SoilData = mongoose.model('SoilData', soilDataSchema);

// ... (authMiddleware and other helpers remain the same)
// Middleware: verify token
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).send({ error: "Access denied, no token provided" });

    try {
      const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
      req.farmer = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).send({ error: "Forbidden" });
      }
      next();
    } catch (err) {
      res.status(400).send({ error: "Invalid token" });
    }
  };
};

// Function to fetch soil data from external API
const fetchSoilData = async (lat, lon) => {
  try {
    const phResponse = await fetchWithRetry(
      `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&depth=0-5cm&value=mean`
    );
    
    let phValue = 6.5 + Math.random() * 2; // Default if parsing fails

    const phData = phResponse.data;
    const phLayer = phData.properties.layers.find(l => l.code === 'phh2o');
    if (phLayer) {
      const depth = phLayer.depths.find(d => d.label === '0-5cm');
      if (depth && depth.values && depth.values.mean !== undefined) {
        const meanValue = depth.values.mean;
        const unit = phLayer.unit || '';
        phValue = unit.includes('pH*10') ? meanValue / 10 : meanValue;
      }
    }

    // For soil temperature and moisture, we'll create realistic mock data
    const soilTemp = 15 + Math.random() * 15; // 15-30°C
    const soilMoisture = 20 + Math.random() * 50; // 20-70%

    return {
      ph: phValue,
      soilTemperature: soilTemp,
      soilMoisture: soilMoisture,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Soil API error:', error.message);
    // Return mock data if API fails
    return {
      ph: 6.8 + Math.random() * 1.4, // pH 6.8-8.2
      soilTemperature: 18 + Math.random() * 8, // 18-26°C
      soilMoisture: 30 + Math.random() * 30, // 30-60%
      timestamp: new Date()
    };
  }
};

// Helper function to sanitize and validate asset data
const sanitizeAssetData = (assets) => {
  const currentDate = new Date().toLocaleDateString();
  
  const sanitizeArray = (assetArray) => {
    if (!Array.isArray(assetArray)) return [];
    
    return assetArray.map(asset => ({
      id: asset.id || Date.now().toString(),
      name: asset.name || 'Unnamed Asset',
      model: asset.model || 'Unknown Model',
      isActive: asset.isActive !== undefined ? asset.isActive : true,
      addedDate: asset.addedDate || currentDate,
      lastUpdated: new Date()
    }));
  };

  return {
    sensors: sanitizeArray(assets.sensors),
    cameras: sanitizeArray(assets.cameras),
    drones: sanitizeArray(assets.drones)
  };
};

// ... (signup and login endpoints remain the same)
// SIGNUP
app.post('/farmer/signup', async (req, res) => {
  try {
    const {
      farmerName, email, password, role, state, district,
      crop, season, year, areaHectare, yieldQuintal,
      N, P, K, temperature, humidity, ph, rainfall
    } = req.body;

    const existing = await Farmer.findOne({ email });
    if (existing) return res.status(400).json({ error: "Farmer already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const farmerId = "F" + Date.now();

    const farmer = new Farmer({
      farmerId,
      farmerName,
      email,
      password: hashedPassword,
      role: role || "farmer",
      state, district, crop, season, year, areaHectare, yieldQuintal,
      N, P, K, temperature, humidity, ph, rainfall
    });

    await farmer.save();

    // Initialize empty farmer assets
    const farmerAssets = new FarmerAssets({
      farmerId,
      sensors: [],
      cameras: [],
      drones: []
    });
    await farmerAssets.save();

    const token = jwt.sign(
      { farmerId: farmer.farmerId, email: farmer.email, role: farmer.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Farmer registered successfully", token, farmerId });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
});

// LOGIN with weather update
app.post('/farmer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const farmer = await Farmer.findOne({ email });
    if (!farmer) return res.status(400).json({ error: "Farmer not found" });

    const validPassword = await bcrypt.compare(password, farmer.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    // Update weather data
    if (farmer.district && farmer.state && WEATHER_API) {
      const cacheKey = `${farmer.district},${farmer.state}`;
      const cachedWeather = weatherCache.get(cacheKey);

      if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
        farmer.temperature = cachedWeather.temperature;
        farmer.humidity = cachedWeather.humidity;
        farmer.rainfall = cachedWeather.rainfall;
      } else {
        try {
          const weatherRes = await fetchWithRetry(
            `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${farmer.district},${farmer.state}`
          );

          const { current } = weatherRes.data;
          farmer.temperature = current.temp_c;
          farmer.humidity = current.humidity;
          farmer.rainfall = current.precip_mm || 0;

          weatherCache.set(cacheKey, {
            temperature: current.temp_c,
            humidity: current.humidity,
            rainfall: current.precip_mm || 0,
            timestamp: Date.now()
          });

          await farmer.save();
        } catch (weatherErr) {
          console.error('Weather API error:', weatherErr.message);
        }
      }
    }

    const token = jwt.sign(
      { farmerId: farmer.farmerId, email: farmer.email, role: farmer.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token, farmerId: farmer.farmerId });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ... (all other endpoints up to finance-advice remain the same)
// ===============================================
// AI MODEL INTEGRATION ENDPOINTS
// ===============================================
app.get('/farmer/crop-prices', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const {
      state,
      district,
      market,
      commodity,
      variety,
      grade,
      limit = 10,
      offset = 0
    } = req.query;

    // Fetch farmer data to personalize
    const farmer = await Farmer.findOne({ farmerId: req.farmer.farmerId }).select('state');
    let effectiveState = state || farmer?.state || 'Karnataka';

    // Build query params, skip empty filters
    const params = new URLSearchParams({
      'api-key': AGMARKNET_API_KEY,
      format: 'json',
      offset: offset.toString(),
      limit: limit.toString()
    });

    if (effectiveState) params.append('filters[state.keyword]', effectiveState.trim());
    if (district && district.trim()) params.append('filters[district]', district.trim());
    if (market && market.trim()) params.append('filters[market]', market.trim());
    if (commodity && commodity.trim()) params.append('filters[commodity]', commodity.trim());
    if (variety && variety.trim()) params.append('filters[variety]', variety.trim());
    if (grade && line.trim()) params.append('filters[grade]', grade.trim());

    const apiUrl = `${AGMARKNET_BASE_URL}?${params.toString()}`;
    console.log('Requesting Agmarknet API:', apiUrl);

    const response = await fetchWithRetry(apiUrl);

    if (!response.data || !Array.isArray(response.data.records)) {
      throw new Error('Invalid response from Agmarknet API: No records found');
    }

    const enhancedData = {
      records: response.data.records.slice(0, parseInt(limit)),
      totalRecords: response.data.total || response.data.records.length,
      personalized: !!effectiveState && !state,
      farmerState: effectiveState,
      filtersUsed: {
        state: effectiveState || null,
        district: district || null,
        market: market || null,
        commodity: commodity || null,
        variety: variety || null,
        grade: grade || null,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    };

    res.status(200).json({
      message: "Crop prices fetched successfully",
      data: enhancedData
    });
  } catch (err) {
    console.error('Crop prices endpoint error:', err.message, err.response?.data);
    res.status(400).json({
      error: err.message || 'Failed to fetch crop prices'
    });
  }
});

// Get Crop Recommendation from Python API
app.post('/farmer/recommend-crop', authMiddleware(["farmer"]), async (req, res) => {
  if (!PYTHON_API_URL) {
    return res.status(503).json({ error: "AI Model service is not configured on the server." });
  }
  try {
    // The farmerId is taken from the secure JWT token, not the request body
    const farmerId = req.farmer.farmerId; 

    const modelResponse = await axios.post(`${PYTHON_API_URL}/m1/crop-recommendation`, {
      farmerId: farmerId 
    });

    res.status(200).json(modelResponse.data);

  } catch (error) {
    console.error('Crop recommendation error:', error.message);
    // Forward the error from the Python API if available
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.detail || 'Error from model service' });
    }
    res.status(503).json({ error: 'AI Model service is unavailable.' });
  }
});

// Get Yield Prediction from Python API
app.post('/farmer/predict-yield', authMiddleware(["farmer"]), async (req, res) => {
  if (!PYTHON_API_URL) {
    return res.status(503).json({ error: "AI Model service is not configured on the server." });
  }
  try {
    const farmerId = req.farmer.farmerId;

    const modelResponse = await axios.post(`${PYTHON_API_URL}/m1/yield`, {
      farmerId: farmerId
    });

    res.status(200).json(modelResponse.data);

  } catch (error) {
    console.error('Yield prediction error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.detail || 'Error from model service' });
    }
    res.status(503).json({ error: 'AI Model service is unavailable.' });
  }
});

// Handle Voice Query via Python API
app.post('/farmer/voice-query', authMiddleware(["farmer"]), async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query text is required." });
  }
  if (!PYTHON_API_URL) {
    return res.status(503).json({ error: "AI Model service is not configured on the server." });
  }

  try {
    const farmerId = req.farmer.farmerId;
    
    const modelResponse = await axios.post(`${PYTHON_API_URL}/m1/voice-query`, {
      farmerId: farmerId,
      query: query
    });

    res.status(200).json(modelResponse.data);

  } catch (error) {
    console.error('Voice query error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.detail || 'Error from model service' });
    }
    res.status(503).json({ error: 'AI Model service is unavailable.' });
  }
});
// FIXED: Farmer Assets Endpoints with proper error handling

// Get farmer assets
app.get('/farmer/assets/:farmerId', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Check if the requesting farmer owns these assets or is admin
    if (req.farmer.farmerId !== farmerId && req.farmer.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    let assets = await FarmerAssets.findOne({ farmerId });
    
    // If no assets found, create empty assets document
    if (!assets) {
      assets = new FarmerAssets({
        farmerId,
        sensors: [],
        cameras: [],
        drones: []
      });
      await assets.save();
    }

    res.status(200).json({
      sensors: assets.sensors || [],
      cameras: assets.cameras || [],
      drones: assets.drones || []
    });
  } catch (err) {
    console.error('Get assets error:', err);
    res.status(500).json({ error: err.message });
  }
});

// FIXED: Save farmer assets with proper data sanitization
app.post('/farmer/assets', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { farmerId, ...assetData } = req.body;
    
    // Check if the requesting farmer owns these assets or is admin
    if (req.farmer.farmerId !== farmerId && req.farmer.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    // Sanitize and validate the asset data
    const sanitizedAssets = sanitizeAssetData(assetData);

    // Update or create farmer assets
    let assets = await FarmerAssets.findOneAndUpdate(
      { farmerId },
      {
        $set: {
          ...sanitizedAssets,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        runValidators: true 
      }
    );

    res.status(200).json({ 
      message: "Assets saved successfully", 
      assets: {
        sensors: assets.sensors,
        cameras: assets.cameras,
        drones: assets.drones
      }
    });
  } catch (err) {
    console.error('Save assets error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get assets statistics for a farmer
app.get('/farmer/assets/:farmerId/stats', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Check if the requesting farmer owns these assets or is admin
    if (req.farmer.farmerId !== farmerId && req.farmer.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const assets = await FarmerAssets.findOne({ farmerId });
    
    if (!assets) {
      return res.status(200).json({
        totalAssets: 0,
        activeAssets: 0,
        inactiveAssets: 0,
        sensors: { total: 0, active: 0, inactive: 0 },
        cameras: { total: 0, active: 0, inactive: 0 },
        drones: { total: 0, active: 0, inactive: 0 }
      });
    }

    const sensorStats = {
      total: assets.sensors.length,
      active: assets.sensors.filter(s => s.isActive).length,
      inactive: assets.sensors.filter(s => !s.isActive).length
    };

    const cameraStats = {
      total: assets.cameras.length,
      active: assets.cameras.filter(c => c.isActive).length,
      inactive: assets.cameras.filter(c => !c.isActive).length
    };

    const droneStats = {
      total: assets.drones.length,
      active: assets.drones.filter(d => d.isActive).length,
      inactive: assets.drones.filter(d => !d.isActive).length
    };

    const totalAssets = sensorStats.total + cameraStats.total + droneStats.total;
    const activeAssets = sensorStats.active + cameraStats.active + droneStats.active;
    const inactiveAssets = sensorStats.inactive + cameraStats.inactive + droneStats.inactive;

    res.status(200).json({
      totalAssets,
      activeAssets,
      inactiveAssets,
      sensors: sensorStats,
      cameras: cameraStats,
      drones: droneStats
    });
  } catch (err) {
    console.error('Get assets stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all farmer assets
app.get('/admin/assets', authMiddleware(["admin"]), async (req, res) => {
  try {
    const allAssets = await FarmerAssets.find({}).populate('farmerId', 'farmerName email');
    
    const summary = {
      totalFarmersWithAssets: allAssets.length,
      totalSensors: allAssets.reduce((sum, asset) => sum + asset.sensors.length, 0),
      totalCameras: allAssets.reduce((sum, asset) => sum + asset.cameras.length, 0),
      totalDrones: allAssets.reduce((sum, asset) => sum + asset.drones.length, 0),
      activeSensors: allAssets.reduce((sum, asset) => sum + asset.sensors.filter(s => s.isActive).length, 0),
      activeCameras: allAssets.reduce((sum, asset) => sum + asset.cameras.filter(c => c.isActive).length, 0),
      activeDrones: allAssets.reduce((sum, asset) => sum + asset.drones.filter(d => d.isActive).length, 0)
    };

    res.status(200).json({
      assets: allAssets,
      summary
    });
  } catch (err) {
    console.error('Admin get all assets error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard data endpoint with weather and soil data
app.get('/farmer/dashboard', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ farmerId: req.farmer.farmerId }).select("-password");
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    let { lat, lon } = req.query;

    // If no lat/lon provided, try to geocode from available location data
    let queryLat = lat ? parseFloat(lat) : null;
    let queryLon = lon ? parseFloat(lon) : null;

    if (!queryLat || !queryLon) {
      let locationQuery = '';
      if (farmer.currentCity && farmer.state) {
        locationQuery = `${farmer.currentCity}, ${farmer.state}, India`;
      } else if (farmer.district && farmer.state) {
        locationQuery = `${farmer.district}, ${farmer.state}, India`;
      }

      if (locationQuery) {
        const coords = await getCoordinates(locationQuery);
        if (coords) {
          queryLat = coords.lat;
          queryLon = coords.lon;
        }
      }
    }

    // Update weather and soil data if coordinates available
    if (queryLat && queryLon) {
      const cacheKey = `lat:${queryLat},lon:${queryLon}`;
      
      // Weather data update
      if (WEATHER_API) {
        const cachedWeather = weatherCache.get(cacheKey);
        if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
          farmer.temperature = cachedWeather.temperature;
          farmer.humidity = cachedWeather.humidity;
          farmer.rainfall = cachedWeather.rainfall;
          farmer.currentCity = cachedWeather.currentCity;
        } else {
          try {
            const weatherRes = await fetchWithRetry(
              `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${queryLat},${queryLon}`
            );

            const { location, current } = weatherRes.data;
            farmer.temperature = current.temp_c;
            farmer.humidity = current.humidity;
            farmer.rainfall = current.precip_mm || 0;
            farmer.currentCity = location.name;

            weatherCache.set(cacheKey, {
              temperature: current.temp_c,
              humidity: current.humidity,
              rainfall: current.precip_mm || 0,
              currentCity: location.name,
              timestamp: Date.now()
            });
          } catch (weatherErr) {
            console.error('Weather API error:', weatherErr.message);
          }
        }
      }

      // Soil data update
      const soilCacheKey = `soil:${queryLat},${queryLon}`;
      const cachedSoil = soilCache.get(soilCacheKey);
      
      if (cachedSoil && Date.now() - cachedSoil.timestamp < CACHE_DURATION) {
        farmer.ph = cachedSoil.ph;
        farmer.soilTemperature = cachedSoil.soilTemperature;
        farmer.soilMoisture = cachedSoil.soilMoisture;
      } else {
        try {
          const soilData = await fetchSoilData(queryLat, queryLon);
          farmer.ph = soilData.ph;
          farmer.soilTemperature = soilData.soilTemperature;
          farmer.soilMoisture = soilData.soilMoisture;

          soilCache.set(soilCacheKey, {
            ph: soilData.ph,
            soilTemperature: soilData.soilTemperature,
            soilMoisture: soilData.soilMoisture,
            timestamp: Date.now()
          });

          // Save soil data to history
          const soilRecord = new SoilData({
            farmerId: farmer.farmerId,
            ph: soilData.ph,
            temperature: soilData.soilTemperature,
            moisture: soilData.soilMoisture,
            location: { latitude: queryLat, longitude: queryLon }
          });
          await soilRecord.save();
        } catch (soilErr) {
          console.error('Soil data error:', soilErr.message);
        }
      }

      await farmer.save();
    } else if (farmer.district && farmer.state && WEATHER_API) {
      // Fallback to registered location for weather only if no coordinates
      const cacheKey = `${farmer.district},${farmer.state}`;
      const cachedWeather = weatherCache.get(cacheKey);

      if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
        farmer.temperature = cachedWeather.temperature;
        farmer.humidity = cachedWeather.humidity;
        farmer.rainfall = cachedWeather.rainfall;
      } else {
        try {
          const weatherRes = await fetchWithRetry(
            `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${farmer.district},${farmer.state}`
          );

          const { current } = weatherRes.data;
          farmer.temperature = current.temp_c;
          farmer.humidity = current.humidity;
          farmer.rainfall = current.precip_mm || 0;

          weatherCache.set(cacheKey, {
            temperature: current.temp_c,
            humidity: current.humidity,
            rainfall: current.precip_mm || 0,
            timestamp: Date.now()
          });

          await farmer.save();
        } catch (weatherErr) {
          console.error('Weather API error:', weatherErr.message);
        }
      }
    }

    // Get device statistics (legacy devices)
    const deviceStats = await Device.aggregate([
      { $match: { farmerId: farmer.farmerId } },
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } }
        }
      }
    ]);

    const devices = {
      cameras: deviceStats.find(d => d._id === "camera") || { count: 0, active: 0 },
      sensors: deviceStats.find(d => d._id === "sensor") || { count: 0, active: 0 }
    };

    // Enhanced data with real farmer data integration
    const cropRecommendations = [
      { 
        crop: 'Wheat', 
        suitability: Math.min(100, Math.max(0, Math.round(85 + (farmer.ph ? (farmer.ph - 7) * 5 : 0)))), 
        expectedYield: Math.round(40 + (farmer.soilTemperature || 20) * 0.5), 
        profitability: Math.round(80 + (farmer.humidity || 60) * 0.2) 
      },
      { 
        crop: 'Rice', 
        suitability: Math.min(100, Math.max(0, Math.round(75 + (farmer.rainfall || 10) * 0.5))), 
        expectedYield: Math.round(35 + (farmer.soilMoisture || 40) * 0.3), 
        profitability: Math.round(70 + (farmer.N || 20) * 0.8) 
      },
      { 
        crop: 'Corn', 
        suitability: Math.min(100, Math.max(0, Math.round(80 + (farmer.temperature ? (farmer.temperature - 25) * 2 : 0)))), 
        expectedYield: Math.round(38 + (farmer.K || 15) * 0.4), 
        profitability: Math.round(75 + (farmer.P || 10) * 1.2) 
      }
    ];

    // Generate more dynamic-looking weather data for the graph
    const weatherData = [];
    const today = new Date();
    const currentTemp = farmer.temperature || 28;
    const currentRain = farmer.rainfall || 8;
    const currentHumidity = farmer.humidity || 50;

    for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();

        // Make today's data exact, and previous days slightly varied
        const temp = i === 0 ? currentTemp : currentTemp - (Math.random() * 4 - 2); // +/- 2 degrees
        const rain = i === 0 ? currentRain : Math.max(0, currentRain + (Math.random() * 10 - 5));
        const humidity = i === 0 ? currentHumidity : Math.min(100, Math.max(0, currentHumidity + (Math.random() * 10 - 5)));

        weatherData.push({
            month: `${month} ${day}`, // Keep 'month' key for frontend compatibility
            temperature: parseFloat(temp.toFixed(1)),
            rainfall: parseFloat(rain.toFixed(1)),
            humidity: parseFloat(humidity.toFixed(1))
        });
    }

    const soilHealthData = [
      { 
        parameter: 'pH Level', 
        current: Math.round((farmer.ph || 7.2) * 10) / 10, 
        optimal: 7.0, 
        status: farmer.ph ? (farmer.ph >= 6.5 && farmer.ph <= 7.5 ? 'Optimal' : farmer.ph >= 6.0 && farmer.ph <= 8.0 ? 'Good' : 'Poor') : 'Unknown'
      },
      { 
        parameter: 'Soil Temperature', 
        current: Math.round((farmer.soilTemperature || 22) * 10) / 10, 
        optimal: 20, 
        status: farmer.soilTemperature ? (farmer.soilTemperature >= 18 && farmer.soilTemperature <= 24 ? 'Optimal' : 'Moderate') : 'Unknown'
      },
      { 
        parameter: 'Soil Moisture', 
        current: Math.round((farmer.soilMoisture || 45) * 10) / 10, 
        optimal: 50, 
        status: farmer.soilMoisture ? (farmer.soilMoisture >= 40 && farmer.soilMoisture <= 60 ? 'Optimal' : farmer.soilMoisture >= 30 && farmer.soilMoisture <= 70 ? 'Good' : 'Poor') : 'Unknown'
      },
      { 
        parameter: 'Nitrogen', 
        current: farmer.N || 25, 
        optimal: 30, 
        status: farmer.N ? (farmer.N >= 25 ? 'Good' : farmer.N >= 15 ? 'Moderate' : 'Low') : 'Unknown'
      },
      { 
        parameter: 'Phosphorus', 
        current: farmer.P || 15, 
        optimal: 20, 
        status: farmer.P ? (farmer.P >= 18 ? 'Good' : farmer.P >= 12 ? 'Moderate' : 'Low') : 'Unknown'
      },
      { 
        parameter: 'Potassium', 
        current: farmer.K || 20, 
        optimal: 25, 
        status: farmer.K ? (farmer.K >= 22 ? 'Good' : farmer.K >= 15 ? 'Moderate' : 'Low') : 'Unknown'
      }
    ];

    res.status(200).json({
      farmerData: farmer,
      deviceStats: devices,
      cropRecommendations,
      weatherData,
      soilHealthData,
      yieldComparison: [
        { year: 2022, yourYield: 45, districtAvg: 48 },
        { year: 2023, yourYield: 47, districtAvg: 49 },
        { year: 2024, yourYield: farmer.yieldQuintal || 49, districtAvg: 51 }
      ]
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// *** UPDATED: /farmer/chat using OpenAI-compatible chat completions ***
app.post('/farmer/chat', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided." });
    }

    if (!HF_TOKEN) {
      console.error("HF_TOKEN is not configured in the server's .env file.");
      return res.status(500).json({ error: "AI service is not configured on the server." });
    }

    const farmer = await Farmer.findOne({ farmerId: req.farmer.farmerId });
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found." });
    }

    const context = `
      You are an expert agricultural assistant. Based on the following farmer's data, answer the user's question concisely.
      - Name: ${farmer.farmerName}
      - Location: ${farmer.currentCity || farmer.district}, ${farmer.state}
      - Current Crop: ${farmer.crop || 'Not specified'}
      - Soil pH: ${farmer.ph || 'N/A'}
      - Soil Moisture: ${farmer.soilMoisture ? farmer.soilMoisture.toFixed(1) + '%' : 'N/A'}
      - Temperature: ${farmer.temperature ? farmer.temperature.toFixed(1) + '°C' : 'N/A'}
      
      User's question is: "${text}"
    `;

    const hfResponse = await axios.post(
      OPENAI_COMPATIBLE_ENDPOINT,
      {
        model: AI_MODEL_NAME,
        messages: [
          { role: "system", content: "You are a helpful agricultural AI assistant." },
          { role: "user", content: context }
        ],
        temperature: 0.7,
        max_tokens: 512,
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept-Encoding': 'identity',
        },
        timeout: 30000
      }
    );

    const generatedText = hfResponse.data.choices[0].message.content.trim();

    return res.status(200).json({ response: generatedText || "The AI returned an empty response." });

  } catch (error) {
    console.error('Chat endpoint error:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`, error.response.data);
      return res.status(error.response.status || 503).json({ error: error.response.data.error || 'AI service error' });
    } else {
      return res.status(503).json({ error: 'AI service is unavailable. Please try again later.' });
    }
  }
});

// Helper function to fetch an image from Unsplash
const fetchImageForAdvice = async (category) => {
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn("UNSPLASH_ACCESS_KEY not found. Using fallback image.");
        return `https://source.unsplash.com/800x600/?${encodeURIComponent(category)},agriculture`;
    }
    
    const query = encodeURIComponent(`${category} farm finance`);
    const fallbackUrl = `https://source.unsplash.com/800x600/?${query}`;

    try {
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: {
                query: query,
                per_page: 1,
                orientation: 'landscape'
            },
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            return response.data.results[0].urls.small;
        } else {
            console.warn(`No Unsplash image found for query: "${query}". Using fallback.`);
            return fallbackUrl;
        }
    } catch (error) {
        console.error('Unsplash API error:', error.message);
        return fallbackUrl;
    }
};

// UPDATED: AI-Powered Finance Advice Endpoint with Unsplash Integration
app.post('/farmer/finance-advice', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    if (!HF_TOKEN) {
      console.error("HF_TOKEN is not configured.");
      return res.status(500).json({ error: "AI service is not configured." });
    }
    
    const languageMap = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada'
    };
    const languageName = languageMap[language] || 'English';

    const systemPrompt = `You are an expert agricultural finance advisor for Indian farmers. Generate 6 distinct, actionable financial tips. Respond ONLY with a valid JSON array of objects. Each object must have keys: "title", "summary", and "category". The summary should be 1-2 concise sentences. Categories can be: 'Government Schemes', 'Crop Insurance', 'Market Prices', 'Loans & Credit', 'Investment', 'Sustainable Farming'. The response language must be ${languageName}.`;

    const hfResponse = await axios.post(
      OPENAI_COMPATIBLE_ENDPOINT,
      {
        model: AI_MODEL_NAME,
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept-Encoding': 'identity',
        },
        timeout: 45000 
      }
    );
    
    let adviceText = hfResponse.data.choices[0].message.content.trim();
    const startIndex = adviceText.indexOf('[');
    const endIndex = adviceText.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
      console.error('AI response did not contain a valid JSON array structure.', adviceText);
      return res.status(500).json({ error: "AI returned an unexpected format." });
    }
    
    adviceText = adviceText.substring(startIndex, endIndex + 1);

    let adviceJson;
    try {
      adviceJson = JSON.parse(adviceText);
    } catch (parseError) {
      console.error('Failed to parse AI JSON response:', parseError);
      console.error('Raw AI response:', adviceText);
      return res.status(500).json({ error: "AI returned an invalid format. Could not parse advice." });
    }
    
    const adviceWithImages = await Promise.all(
      adviceJson.map(async (advice) => {
          const imageUrl = await fetchImageForAdvice(advice.category);
          return { ...advice, imageUrl };
      })
    );

    return res.status(200).json(adviceWithImages);

  } catch (error) {
    console.error('Finance advice endpoint error:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`, error.response.data);
      return res.status(error.response.status || 503).json({ error: error.response.data.error || 'AI service error' });
    } else {
      return res.status(503).json({ error: 'AI service is unavailable.' });
    }
  }
});


// --- NEW: Plant Disease Detection Proxy Endpoint ---
app.post('/farmer/detect-disease', authMiddleware(["farmer"]), upload.single('image'), async (req, res) => {
    if (!PYTHON_API_URL) {
        return res.status(503).json({ error: "AI Model service is not configured on the server." });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        // NEW: Resize the image to 128x128 using sharp
        const resizedBuffer = await sharp(req.file.buffer)
            .resize(128, 128, {
                fit: 'contain',  // Ensure the image fits within 128x128 without distortion
                background: { r: 0, g: 0, b: 0, alpha: 1 }  // Black background if needed
            })
            .toFormat('jpeg')  // Convert to JPEG for consistency
            .toBuffer();

        const formData = new FormData();
        formData.append('file', resizedBuffer, { filename: 'resized_image.jpg', contentType: 'image/jpeg' });

        const diseaseResponse = await axios.post(
            `${PYTHON_API_URL}/m2/plant-disease`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );

        res.status(200).json(diseaseResponse.data);

    } catch (error) {
        console.error('Plant disease detection error:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`, error.response.data);
            return res.status(error.response.status).json({ error: error.response.data.detail || 'Error from model service' });
        }
        res.status(503).json({ error: 'AI Model service is unavailable.' });
    }
});

// ... (The rest of your endpoints and app.listen remain the same)
// Get all devices for a farmer
app.get('/farmer/devices', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const devices = await Device.find({ farmerId: req.farmer.farmerId });
    const stats = {
      total: devices.length,
      cameras: devices.filter(d => d.deviceType === 'camera').length,
      sensors: devices.filter(d => d.deviceType === 'sensor').length,
      active: devices.filter(d => d.status === 'active').length,
      inactive: devices.filter(d => d.status === 'inactive').length,
      maintenance: devices.filter(d => d.status === 'maintenance').length
    };

    res.status(200).json({
      devices,
      stats
    });
  } catch (err) {
    console.error('Get devices error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new device
app.post('/farmer/devices', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const {
      deviceType,
      deviceName,
      location,
      specifications
    } = req.body;

    if (!deviceType || !deviceName) {
      return res.status(400).json({ error: "Device type and name are required" });
    }

    const deviceId = `${deviceType.toUpperCase()}_${Date.now()}`;

    const device = new Device({
      deviceId,
      farmerId: req.farmer.farmerId,
      deviceType,
      deviceName,
      location,
      specifications,
      status: 'active'
    });

    await device.save();

    res.status(201).json({
      message: "Device added successfully",
      device
    });
  } catch (err) {
    console.error('Add device error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update device
app.put('/farmer/devices/:deviceId', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOneAndUpdate(
      { deviceId, farmerId: req.farmer.farmerId },
      { $set: req.body },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.status(200).json({
      message: "Device updated successfully",
      device
    });
  } catch (err) {
    console.error('Update device error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete device
app.delete('/farmer/devices/:deviceId', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOneAndDelete({
      deviceId,
      farmerId: req.farmer.farmerId
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.status(200).json({
      message: "Device deleted successfully"
    });
  } catch (err) {
    console.error('Delete device error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update device status
app.patch('/farmer/devices/:deviceId/status', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId, farmerId: req.farmer.farmerId },
      { 
        $set: { 
          status,
          lastDataReceived: status === 'active' ? new Date() : undefined 
        }
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.status(200).json({
      message: "Device status updated",
      device
    });
  } catch (err) {
    console.error('Update device status error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get device analytics
app.get('/farmer/devices/analytics', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const devices = await Device.find({ farmerId: req.farmer.farmerId });

    const analytics = {
      totalDevices: devices.length,
      deviceTypeDistribution: {
        cameras: devices.filter(d => d.deviceType === 'camera').length,
        sensors: devices.filter(d => d.deviceType === 'sensor').length
      },
      statusDistribution: {
        active: devices.filter(d => d.status === 'active').length,
        inactive: devices.filter(d => d.status === 'inactive').length,
        maintenance: devices.filter(d => d.status === 'maintenance').length
      },
      installationTimeline: devices.map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        type: device.deviceType,
        installDate: device.installationDate,
        status: device.status
      })),
      maintenanceSchedule: devices
        .filter(d => d.maintenanceSchedule)
        .map(device => ({
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          scheduledDate: device.maintenanceSchedule
        }))
    };

    res.status(200).json(analytics);
  } catch (err) {
    console.error('Device analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Simulate device data reception (for testing)
app.post('/devices/:deviceId/data', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const deviceData = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      { 
        $set: { 
          lastDataReceived: new Date(),
          status: 'active'
        }
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.status(200).json({
      message: "Device data received",
      device: device.deviceId,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Device data reception error:', err);
    res.status(500).json({ error: err.message });
  }
});

// OTHER ENDPOINTS

// Farmer profile (self only)
app.get('/farmer/profile', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ farmerId: req.farmer.farmerId }).select("-password");
    res.status(200).json(farmer);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

// *** REMOVED /farmer/hf-token endpoint ***

// Update farmer data
app.put('/farmer/update', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const updatedFarmer = await Farmer.findOneAndUpdate(
      { farmerId: req.farmer.farmerId },
      { $set: req.body },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Farmer data updated", farmer: updatedFarmer });
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Admin: view all farmers
app.get('/admin/farmers', authMiddleware(["admin"]), async (req, res) => {
  try {
    const farmers = await Farmer.find().select("-password");
    res.status(200).json(farmers);
  } catch (err) {
    console.error('Admin farmers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all devices across all farmers
app.get('/admin/devices', authMiddleware(["admin"]), async (req, res) => {
  try {
    const devices = await Device.find().populate('farmerId', 'farmerName email');
    const stats = {
      total: devices.length,
      cameras: devices.filter(d => d.deviceType === 'camera').length,
      sensors: devices.filter(d => d.deviceType === 'sensor').length,
      active: devices.filter(d => d.status === 'active').length
    };

    res.status(200).json({
      devices,
      stats
    });
  } catch (err) {
    console.error('Admin devices error:', err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Secure Server with Weather & Soil Sync running on http://localhost:${PORT}`);
});