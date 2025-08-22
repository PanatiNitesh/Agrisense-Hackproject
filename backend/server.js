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

dotenv.config();

const app = express();
app.use(bodyParser.json());

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

const Mongo = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
// CHANGED: Reading the new API key from .env
const WEATHER_API = process.env.WEATHERAPI_COM_KEY;

// In-memory cache for weather data
const weatherCache = new Map();
const CACHE_DURATION = 2 * 60 * 60 * 1000; // Cache for 2 hours

// Retry mechanism for API calls
const fetchWithRetry = async (url, retries = 3, backoff = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
        const delay = backoff * Math.pow(2, i);
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
};

// MongoDB connection
mongoose.connect(Mongo)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Farmer schema
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
  role: { type: String, enum: ["farmer", "admin"], default: "farmer" }
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', farmerSchema);

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

// LOGIN + WeatherAPI.com update
app.post('/farmer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const farmer = await Farmer.findOne({ email });
    if (!farmer) return res.status(400).json({ error: "Farmer not found" });

    const validPassword = await bcrypt.compare(password, farmer.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    if (farmer.district && farmer.state && WEATHER_API) {
      const cacheKey = `${farmer.district},${farmer.state}`;
      const cachedWeather = weatherCache.get(cacheKey);
      if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
        farmer.temperature = cachedWeather.temperature;
        farmer.humidity = cachedWeather.humidity;
        farmer.rainfall = cachedWeather.rainfall;
      } else {
        try {
          // CHANGED: Switched to WeatherAPI.com URL structure
          const weatherRes = await fetchWithRetry(
            `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${farmer.district},${farmer.state}`
          );
          
          // CHANGED: Updated data extraction for WeatherAPI.com's response format
          const { current } = weatherRes.data;
          farmer.temperature = current.temp_c;
          farmer.humidity = current.humidity;
          farmer.rainfall = current.precip_mm || 0; // Using precipitation in mm
          
          weatherCache.set(cacheKey, {
            temperature: current.temp_c,
            humidity: current.humidity,
            rainfall: current.precip_mm || 0,
            timestamp: Date.now()
          });
          await farmer.save();
        } catch (weatherErr) {
          console.error(`Weather API error for ${cacheKey}:`, weatherErr.message);
          if (weatherErr.response?.status === 429) {
            console.warn('Weather API rate limit exceeded, skipping update');
          }
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

// Dashboard data endpoint
app.get('/farmer/dashboard', authMiddleware(["farmer", "admin"]), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ farmerId: req.farmer.farmerId }).select("-password");
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    const { lat, lon } = req.query;
    if (lat && lon && WEATHER_API) {
      // CHANGED: The 'q' param for lat,lon is a single comma-separated string
      const cacheKey = `lat:${lat},lon:${lon}`;
      const cachedWeather = weatherCache.get(cacheKey);
      
      if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
        farmer.temperature = cachedWeather.temperature;
        farmer.humidity = cachedWeather.humidity;
        farmer.rainfall = cachedWeather.rainfall;
        farmer.currentCity = cachedWeather.currentCity || farmer.currentCity;
      } else {
        try {
          // CHANGED: Switched to WeatherAPI.com URL structure for lat,lon
          const weatherRes = await fetchWithRetry(
            `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${lat},${lon}`
          );
          
          // CHANGED: Updated data extraction for WeatherAPI.com's response format
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
          await farmer.save();
        } catch (weatherErr) {
          console.error(`Weather API error for ${cacheKey}:`, weatherErr.message);
          // Fallback logic remains the same
          if (weatherErr.response?.status === 429) {
             console.warn('Weather API rate limit exceeded, using cached data or default location');
            if (farmer.district && farmer.state) {
              // This fallback still works because it just retrieves from our own cache
              const fallbackCacheKey = `${farmer.district},${farmer.state}`;
              const fallbackWeather = weatherCache.get(fallbackCacheKey);
              if (fallbackWeather && Date.now() - fallbackWeather.timestamp < CACHE_DURATION) {
                farmer.temperature = fallbackWeather.temperature;
                farmer.humidity = fallbackWeather.humidity;
                farmer.rainfall = fallbackWeather.rainfall;
                await farmer.save();
              }
            }
          }
        }
      }
    } else if (farmer.district && farmer.state && WEATHER_API) {
      // Fallback to registered location if no lat/lon provided
      const cacheKey = `${farmer.district},${farmer.state}`;
      const cachedWeather = weatherCache.get(cacheKey);
      if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
        farmer.temperature = cachedWeather.temperature;
        farmer.humidity = cachedWeather.humidity;
        farmer.rainfall = cachedWeather.rainfall;
      } else {
        try {
          // CHANGED: Switched to WeatherAPI.com URL structure
          const weatherRes = await fetchWithRetry(
            `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${farmer.district},${farmer.state}`
          );

          // CHANGED: Updated data extraction for WeatherAPI.com's response format
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
          console.error(`Weather API error for ${cacheKey}:`, weatherErr.message);
          if (weatherErr.response?.status === 429) {
            console.warn('Weather API rate limit exceeded, skipping update');
          }
        }
      }
    }

    // MOCK DATA for charts (replace with real data/logic as needed)
    const cropRecommendations = [
      { crop: 'Wheat', suitability: 92, expectedYield: 45, profitability: 85 },
      { crop: 'Rice', suitability: 78, expectedYield: 38, profitability: 72 },
    ];
    const weatherData = [
      { month: 'Jan', temperature: 15, rainfall: 23 },
      { month: 'Feb', temperature: 18, rainfall: 18 },
    ];
    const yieldComparison = [
      { year: 2022, actual: 45, predicted: 44 },
      { year: 2023, actual: 47, predicted: 46 },
      { year: 2024, predicted: 50 }
    ];

    res.status(200).json({
      farmerData: farmer,
      cropRecommendations,
      weatherData,
      yieldComparison
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});


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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Secure Server with Weather Sync running on http://localhost:${PORT}`);
});