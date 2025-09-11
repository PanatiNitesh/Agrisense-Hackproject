import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ScatterChart, Scatter, Legend
} from 'recharts';
import {
  Sprout, CloudRain, Thermometer, Droplets, TestTube,
  TrendingUp, Calendar, MapPin, Settings, Bell, User, Home,
  BarChart3, Leaf, Sun, Menu, X, Plus, Edit, Save, AlertTriangle, Loader,
  RefreshCw, LogOut, Map, Navigation, CheckCircle, Trash2, Power, PowerOff, Bot,
  Mic, Send, ArrowLeft, Wind, BarChart2 as BarChart2Icon, Volume2, VolumeX, BrainCircuit,
  DollarSign, BookOpen, GraduationCap, Languages, Router, Camera, Upload, ScanLine,ArrowDownCircle
} from 'lucide-react';

// --- Configuration ---
const API_URL = 'https://agrisense-hackproject.onrender.com';

// --- Language Data ---
const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' }
];

// --- Translation Data ---
const translations = {
  en: {
    // Dashboard sections
    overview: 'Overview',
    crops: 'Crop Analysis',
    soil: 'Soil Health', 
    weather: 'Weather',
    analytics: 'Analytics',
    assets: 'Assets',
    finance: 'Finance & Education',
    profile: 'Profile',
    
    // Overview section
    welcomeBack: 'Welcome back',
    farmStatus: 'Here is your farm\'s live status in',
    primaryCrop: 'Primary Crop',
    farmArea: 'Farm Area',
    currentTemp: 'Current Temp',
    currentHumidity: 'Current Humidity',
    activeDevices: 'active devices',
    yieldComparison: 'Yield Comparison (Quintal/Hectare)',
    topCropRecommendations: 'Top 5 Crop Recommendations',
    yieldPrediction: 'Yield Prediction',
    recommendCrop: 'Recommend Crop',
    
    // Finance section
    financeTitle: 'Farmer Finance & Education',
    financeSubtitle: 'Learn about farming practices, financial planning, and get expert advice',
    askQuestion: 'Ask a farming question...',
    send: 'Send',
    
    // Common terms
    loading: 'Loading...',
    noData: 'No data available to display',
    active: 'Active',
    inactive: 'Inactive',
    lastUpdated: 'Last updated',
    
    // Actions
    addDevice: 'Add Device',
    addAsset: 'Add Asset',
    refresh: 'Refresh',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete'
  },
  
  hi: {
    // Dashboard sections
    overview: 'सिंहावलोकन',
    crops: 'फसल विश्लेषण',
    soil: 'मिट्टी की सेहत',
    weather: 'मौसम',
    analytics: 'विश्लेषण',
    assets: 'संपत्ति',
    finance: 'वित्त और शिक्षा',
    profile: 'प्रोफ़ाइल',
    
    // Overview section
    welcomeBack: 'आपका स्वागत है',
    farmStatus: 'में आपके खेत की स्थिति यहाँ है',
    primaryCrop: 'मुख्य फसल',
    farmArea: 'खेत का क्षेत्रफल',
    currentTemp: 'वर्तमान तापमान',
    currentHumidity: 'वर्तमान आर्द्रता',
    activeDevices: 'सक्रिय उपकरण',
    yieldComparison: 'उपज तुलना (क्विंटल/हेक्टेयर)',
    topCropRecommendations: 'शीर्ष 5 फसल सिफारिशें',
    yieldPrediction: 'उपज पूर्वानुमान',
    recommendCrop: 'फसल सुझाएं',
    
    // Finance section
    financeTitle: 'खेती वित्त और शिक्षा',
    financeSubtitle: 'खेती की प्रथाओं, वित्तीय योजना के बारे में जानें और विशेषज्ञ सलाह प्राप्त करें',
    askQuestion: 'खेती संबंधी प्रश्न पूछें...',
    send: 'भेजें',
    
    // Common terms
    loading: 'लोड हो रहा है...',
    noData: 'प्रदर्शित करने के लिए कोई डेटा उपलब्ध नहीं',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    lastUpdated: 'अंतिम बार अपडेट किया गया',
    
    // Actions
    addDevice: 'उपकरण जोड़ें',
    addAsset: 'संपत्ति जोड़ें',
    refresh: 'रीफ्रेश करें',
    save: 'सेव करें',
    edit: 'संपादित करें',
    delete: 'हटाएं'
  },
  
  kn: {
    // Dashboard sections
    overview: 'ಅವಲೋಕನ',
    crops: 'ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ',
    soil: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
    weather: 'ಹವಾಮಾನ',
    analytics: 'ವಿಶ್ಲೇಷಣೆ',
    assets: 'ಆಸ್ತಿಗಳು',
    finance: 'ಹಣಕಾಸು ಮತ್ತು ಶಿಕ್ಷಣ',
    profile: 'ಪ್ರೊಫೈಲ್',
    
    // Overview section
    welcomeBack: 'ಮರಳಿ ಬಂದಿರುವುದಕ್ಕೆ ಸ್ವಾಗತ',
    farmStatus: 'ನಲ್ಲಿ ನಿಮ್ಮ ತೋಟದ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ ಇಲ್ಲಿದೆ',
    primaryCrop: 'ಮುಖ್ಯ ಬೆಳೆ',
    farmArea: 'ತೋಟದ ವಿಸ್ತೀರ್ಣ',
    currentTemp: 'ಪ್ರಸ್ತುತ ತಾಪಮಾನ',
    currentHumidity: 'ಪ್ರಸ್ತುತ ಆರ್ದ್ರತೆ',
    activeDevices: 'ಸಕ್ರಿಯ ಸಾಧನಗಳು',
    yieldComparison: 'ಇಳುವರಿ ಹೋಲಿಕೆ (ಕ್ವಿಂಟಾಲ್/ಹೆಕ್ಟೇರ್)',
    topCropRecommendations: 'ಟಾಪ್ 5 ಬೆಳೆ ಶಿಫಾರಸುಗಳು',
    yieldPrediction: 'ಇಳುವರಿ ಮುನ್ಸೂಚನೆ',
    recommendCrop: 'ಬೆಳೆ ಶಿಫಾರಸು',
    
    // Finance section
    financeTitle: 'ಕೃಷಿ ಹಣಕಾಸು ಮತ್ತು ಶಿಕ್ಷಣ',
    financeSubtitle: 'ಕೃಷಿ ಪದ್ಧತಿಗಳು, ಹಣಕಾಸು ಯೋಜನೆ ಬಗ್ಗೆ ಕಲಿಯಿರಿ ಮತ್ತು ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ',
    askQuestion: 'ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    send: 'ಕಳುಹಿಸಿ',
    
    // Common terms
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noData: 'ಪ್ರದರ್ಶಿಸಲು ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ',
    active: 'ಸಕ್ರಿಯ',
    inactive: 'ನಿಷ್ಕ್ರಿಯ',
    lastUpdated: 'ಕೊನೆಯದಾಗಿ ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ',
    
    // Actions
    addDevice: 'ಸಾಧನ ಸೇರಿಸಿ',
    addAsset: 'ಆಸ್ತಿ ಸೇರಿಸಿ',
    refresh: 'ರಿಫ್ರೆಶ್ ಮಾಡಿ',
    save: 'ಸೇವ್ ಮಾಡಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    delete: 'ಅಳಿಸಿ'
  }
};

// --- API Service ---
const apiService = {
  fetchDashboardData: async (token) => {
    const response = await fetch(`${API_URL}/farmer/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch farmer data. Your session may be invalid.');
    return response.json();
  },

  fetchSoilHealthData: async (token) => {
    const response = await fetch(`${API_URL}/farmer/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch soil health data.');
    const data = await response.json();
    return data.farmerData; 
  },

  fetchCropPrices: async (token, filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/farmer/crop-prices?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Error fetching crop prices:', error.message, error);
      return { error: error.message };
    }
  },

  sendChatMessage: async (text, token) => {
    try {
      const response = await fetch(`${API_URL}/farmer/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Server responded with status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error calling backend chat service: ${error.message}`);
      const friendlyMessage = error.message.includes('Hugging Face API token')
        ? "The AI service is not configured. Please add your Hugging Face API token in the main dashboard."
        : "Sorry, I'm having trouble connecting to the AI. Please try again later.";
      return { response: friendlyMessage };
    }
  },

  fetchFinanceAdvice: async (token, language = 'en') => {
    try {
      const response = await fetch(`${API_URL}/farmer/finance-advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ language }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch finance advice.');
      }
      return response.json();
    } catch (error) {
      console.error(`Error calling finance advice service: ${error.message}`);
      return [
        { error: true, title: "Service Unavailable", summary: "Could not fetch financial advice at the moment. Please try again later.", category: "Error", imageUrl: 'https://source.unsplash.com/800x600/?error' }
      ];
    }
  },

  predictYield: async (token) => {
    const response = await fetch(`${API_URL}/farmer/predict-yield`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to get yield prediction.');
    }
    return response.json();
  },

  recommendCrop: async (token) => {
      const response = await fetch(`${API_URL}/farmer/recommend-crop`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get crop recommendation.');
      }
      return response.json();
  },

  detectPlantDisease: async (token, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/farmer/detect-disease`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to detect disease.');
    }
    return response.json();
  },

  // New endpoints
  fetchAssets: async (token, farmerId) => {
    const response = await fetch(`${API_URL}/farmer/assets/${farmerId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  saveAssets: async (token, farmerId, assetData) => {
    const response = await fetch(`${API_URL}/farmer/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ farmerId, ...assetData }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to save assets');
    }
    return response.json();
  },

  fetchAssetsStats: async (token, farmerId) => {
    const response = await fetch(`${API_URL}/farmer/assets/${farmerId}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch assets stats');
    return response.json();
  }
}

// --- MERGED: Plant Disease Detection Modal Component ---
const PlantDiseaseModal = ({ isOpen, onClose }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    cleanupCamera();
    resetState();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraOn(true); // This will trigger the useEffect to attach the stream
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access was denied. Please allow camera permissions in your browser settings.");
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    if (isCameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Auto-play was prevented", error);
          setError("Could not play camera stream. Please interact with the page and try again.");
        });
      }
    }
  }, [isCameraOn]);
  
  const resetState = () => {
    setImageSrc(null);
    setImageFile(null);
    setDetectionResult(null);
    setError(null);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageSrc(dataUrl);
      
      canvas.toBlob(blob => {
        if (blob) {
            setImageFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        }
      }, 'image/jpeg');

      cleanupCamera();
      setIsCameraOn(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      resetState();
      cleanupCamera();
      setIsCameraOn(false);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectDisease = async () => {
    if (!imageFile) {
      setError("Please capture or upload an image first.");
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDetectionResult(null);

    try {
      const result = await apiService.detectPlantDisease(token, imageFile);
      setDetectionResult(result);
    } catch (err) {
      setError(err.message || "An unknown error occurred during detection.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      cleanupCamera();
      resetState();
      setIsCameraOn(false);
      onClose();
  };

  useEffect(() => {
    // Cleanup camera when the modal is closed
    return () => {
      cleanupCamera();
    };
  }, []);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><ScanLine className="w-6 h-6 mr-2 text-green-600"/>Plant Disease Detection</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="w-full aspect-video bg-gray-200 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                 {imageSrc && !isCameraOn && <img src={imageSrc} alt="Plant Preview" className="w-full h-full object-contain" />}
                 {isCameraOn && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>}
                 {!imageSrc && !isCameraOn && (
                    <div className="text-center text-gray-500">
                        <Camera size={48} className="mx-auto mb-2"/>
                        <p>Start camera or upload an image</p>
                    </div>
                 )}
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm text-center mb-4">{error}</div>}

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Camera size={20}/> {isCameraOn ? "Restart Camera" : "Start Camera"}
                </button>
                {isCameraOn && (
                    <button onClick={handleCapture} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                       <div className="w-5 h-5 rounded-full bg-white border-2 border-green-600"></div> Capture Image
                    </button>
                )}
                {!isCameraOn && (
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors">
                       <Upload size={20}/> Upload Image
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {imageFile && (
                <button onClick={handleDetectDisease} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-400">
                    {isLoading ? <Loader className="w-5 h-5 animate-spin"/> : <ScanLine size={20}/>}
                    {isLoading ? 'Analyzing...' : 'Detect Disease'}
                </button>
            )}
            
            {detectionResult && (
                <div className="mt-6 bg-gray-50 p-4 rounded-2xl border">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Detection Result</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                           <span className="font-semibold text-gray-600">Predicted Disease:</span>
                           <span className="font-bold text-lg text-blue-600">{detectionResult.predicted_class}</span>
                        </div>
                         <div className="flex justify-between">
                           <span className="font-semibold text-gray-600">Confidence:</span>
                           <span className="font-medium text-green-700">{(detectionResult.confidence * 100).toFixed(2)}%</span>
                        </div>
                        {detectionResult.description && (
                            <div>
                                <h4 className="font-semibold text-gray-600 mt-3 mb-1">Description:</h4>
                                <p className="text-gray-700">{detectionResult.description}</p>
                            </div>
                        )}
                         {detectionResult.remedies && (
                            <div>
                                <h4 className="font-semibold text-gray-600 mt-3 mb-1">Recommended Remedies:</h4>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {detectionResult.remedies.map((remedy, index) => <li key={index}>{remedy}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

// --- Language Selector Component ---
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-colors text-white"
      >
        <Languages size={16} />
        <span className="text-sm">
          {supportedLanguages.find(lang => lang.code === currentLanguage)?.flag} 
          {supportedLanguages.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[150px] z-[100]">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl ${
                currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span>{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Finance Education Component ---
const CardSkeleton = () => (
  <div className="bg-white/50 rounded-2xl shadow-lg p-4 animate-pulse">
    <div className="w-full h-40 bg-gray-300 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
    <div className="h-6 bg-gray-400 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

const AdviceCard = ({ title, summary, category, imageUrl }) => {
  const getCategoryStyle = (cat) => {
    switch (cat.toLowerCase()) {
      case 'government schemes': return 'bg-blue-100 text-blue-800';
      case 'crop insurance': return 'bg-green-100 text-green-800';
      case 'market prices': return 'bg-yellow-100 text-yellow-800';
      case 'loans & credit': return 'bg-purple-100 text-purple-800';
      case 'investment': return 'bg-indigo-100 text-indigo-800';
      case 'sustainable farming': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/40 rounded-3xl border border-white/30 shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src='https://source.unsplash.com/800x600/?agriculture' }}
      />
      <div className="p-6">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getCategoryStyle(category)}`}>
          {category}
        </span>
        <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};

const FinanceEducation = ({ token, language, t, farmerData }) => {
  const [adviceCards, setAdviceCards] = useState([]);
  const [isAdviceLoading, setIsAdviceLoading] = useState(true);
  const [cropPrices, setCropPrices] = useState([]);
  const [isPricesLoading, setIsPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState(null);
  const [offset, setOffset] = useState(0); // For lazy loading
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [filters, setFilters] = useState({
    state: farmerData?.state || 'Karnataka',
    commodity: '',
    minPrice: '',
    maxPrice: '',
    modalPrice: '',
    limit: '10' // Initial limit for top 10
  });

  const loadCropPrices = async (newOffset = 0, append = false) => {
    setIsPricesLoading(true);
    setPricesError(null);
    try {
      const params = {
        ...filters,
        state: filters.state || farmerData?.state || 'Karnataka',
        offset: newOffset.toString()
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key].trim() === '') {
          delete params[key];
        }
      });
      const response = await apiService.fetchCropPrices(token, params);
      console.log('Crop prices response:', response); // Debug log
      if (response.error) {
        setPricesError(response.error);
        setCropPrices(append ? cropPrices : []);
      } else if (!response.data?.records || !Array.isArray(response.data.records)) {
        setPricesError(t.noPrices || 'No price data available');
        setCropPrices(append ? cropPrices : []);
        setHasMore(false);
      } else {
        setCropPrices(append ? [...cropPrices, ...response.data.records] : response.data.records);
        setHasMore(response.data.records.length === parseInt(filters.limit)); // More data if full batch returned
      }
    } catch (error) {
      setPricesError(t.noPrices || 'Failed to fetch crop prices');
      setCropPrices(append ? cropPrices : []);
      setHasMore(false);
    }
    setIsPricesLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadCropPrices(0, false); // Initial load
      // Load advice
      const loadAdvice = async () => {
        setIsAdviceLoading(true);
        const data = await apiService.fetchFinanceAdvice(token, language);
        if (Array.isArray(data)) {
          setAdviceCards(data);
        } else {
          setAdviceCards([{ error: true, title: "Error", summary: "Received invalid data from the server.", category: "Error", imageUrl: 'https://source.unsplash.com/800x600/?error' }]);
        }
        setIsAdviceLoading(false);
      };
      loadAdvice();
    } else {
      setPricesError(t.authorizationError || 'Please log in to view prices');
      setIsPricesLoading(false);
    }
  }, [token, language, farmerData?.state]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async () => {
    setOffset(0); // Reset offset when applying filters
    await loadCropPrices(0, false); // Reload with new filters
  };

  const handleLoadMore = async () => {
    const newOffset = offset + parseInt(filters.limit);
    setOffset(newOffset);
    await loadCropPrices(newOffset, true); // Append new data
  };

  // Define table headers based on sample data
  const tableHeaders = [
    { key: 'state', label: t.state || 'State' },
    { key: 'district', label: t.district || 'District' },
    { key: 'market', label: t.market || 'Market' },
    { key: 'commodity', label: t.commodity || 'Commodity' },
    { key: 'variety', label: t.variety || 'Variety' },
    { key: 'grade', label: t.grade || 'Grade' },
    { key: 'arrival_date', label: t.arrivalDate || 'Arrival Date' },
    { key: 'min_price', label: t.minPrice || 'Min Price (₹)' },
    { key: 'max_price', label: t.maxPrice || 'Max Price (₹)' },
    { key: 'modal_price', label: t.modalPrice || 'Modal Price (₹)' }
  ];

  return (
    <div className="space-y-12">
      {/* Learning Section */}
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{t.learningTitle}</h3>
            <p className="text-gray-600 mt-1">{t.financeSubtitle}</p>
          </div>
        </div>
        {isAdviceLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : adviceCards.length > 0 && adviceCards[0].error ? (
          <div className="text-center py-16 bg-red-50/50 rounded-2xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-red-700">{adviceCards[0].title}</h4>
            <p className="text-red-600 mt-2">{adviceCards[0].summary}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adviceCards.map((card, index) => (
              <AdviceCard
                key={index}
                title={card.title}
                summary={card.summary}
                category={card.category}
                imageUrl={card.imageUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Market Prices Section */}
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white">
            <DollarSign size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{t.marketPricesTitle}</h3>
            <p className="text-gray-600 mt-1">Real-time crop prices from various markets in India</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
            placeholder={t.state || 'State (e.g., Karnataka)'}
            className="px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="commodity"
            value={filters.commodity}
            onChange={handleFilterChange}
            placeholder={t.commodity || 'Commodity (e.g., Capsicum)'}
            className="px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder={t.minPrice || 'Min Price (₹)'}
            className="px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="modalPrice"
            value={filters.modalPrice}
            onChange={handleFilterChange}
            placeholder={t.modalPrice || 'Modal Price (₹)'}
            className="px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleApplyFilters}
          disabled={isPricesLoading}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50 mb-6"
        >
          {isPricesLoading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {t.loading || 'Loading...'}
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              {t.applyFilters || 'Apply Filters'}
            </>
          )}
        </button>

        {isPricesLoading && cropPrices.length === 0 ? (
          <div className="text-center py-16">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{t.loading || 'Loading...'}</p>
          </div>
        ) : pricesError ? (
          <div className="text-center py-16 bg-red-50/50 rounded-2xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-red-700">{t.error || 'Error'}</h4>
            <p className="text-red-600 mt-2">{pricesError}</p>
          </div>
        ) : cropPrices.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-2xl">
            <p className="text-gray-600">{t.noPrices || 'No price data available'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(header => (
                      <th
                        key={header.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cropPrices.map((price, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.state || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.district || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.market || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.commodity || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.variety || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.grade || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.arrival_date || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.min_price ? `₹${price.min_price}` : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.max_price ? `₹${price.max_price}` : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.modal_price ? `₹${price.modal_price}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isPricesLoading}
                className="mt-6 flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-3xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg disabled:opacity-50 mx-auto"
              >
                {isPricesLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    {t.loading || 'Loading...'}
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="w-5 h-5 mr-2" />
                    {t.loadMore || 'Load More'}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const useSpeech = (onResult, onEnd) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        stopListening();
      };

      recognition.onend = () => {
        onEnd();
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    return () => {
      recognitionRef.current?.stop();
    };
  }, [onResult, onEnd]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text, onEndCallback, isMuted) => {
    if ('speechSynthesis' in window && !isMuted) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = navigator.language || 'en-US';
      utterance.onend = onEndCallback;
      speechSynthesis.speak(utterance);
    } else if (onEndCallback) {
      onEndCallback();
    }
  };

  return { isListening, startListening, stopListening, speak };
};

const ChatLoadingScreen = () => (
  <div className="flex flex-col items-center justify-center text-center h-full text-white">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-500"></div>
    <p className="text-lg mt-4">Loading your farm data...</p>
  </div>
);

const ChatErrorScreen = ({ error }) => (
  <div className="flex flex-col items-center justify-center text-center h-full p-8 text-white">
    <h2 className="text-2xl font-bold mb-4 text-red-400">An Error Occurred</h2>
    <p className="text-gray-300">{error}</p>
    <p className="text-gray-500 mt-4 text-sm">Please ensure you are logged into the main dashboard and try refreshing the page.</p>
  </div>
);

const GreetingScreen = ({ onVoiceSelect, onChatSelect, lang }) => {
    const farmerName = localStorage.getItem('farmerName') || 'Farmer';
    return (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in h-full">
        <h1 className="text-3xl font-bold mb-2 text-white" lang={lang}>Hello, {farmerName}!</h1>
        <p className="text-md text-gray-300 mb-8" lang={lang}>How would you like to get your farm status?</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onVoiceSelect} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-3xl transition-transform transform hover:scale-105 text-white">
            <Mic className="w-5 h-5" />
            <span className="font-semibold">Continue with Voice</span>
          </button>
          <button onClick={onChatSelect} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-3xl transition-transform transform hover:scale-105 text-white">
            <BarChart2Icon className="w-5 h-5" />
            <span className="font-semibold">Continue with Chat</span>
          </button>
        </div>
      </div>
    );
};

const VoiceMode = ({ dashboardData, auth, onBack, onClose, lang, setLang }) => {
  const [isResponding, setIsResponding] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const hasSpokenGreeting = useRef(false);

  const handleSpeechResult = async (transcript) => {
    setDisplayText(`You said: "${transcript}"`);
    setIsResponding(true);
    try {
      const { response } = await apiService.sendChatMessage(transcript, auth.token);
      setDisplayText(response);
      speak(response, () => {
        setIsResponding(false);
        setDisplayText('Tap the icon to speak');
      }, isMuted);
    } catch (error) {
      console.error(error);
      setDisplayText("An unexpected error occurred. Please try again.");
      setIsResponding(false);
    }
  };

  const { isListening, startListening, stopListening, speak } = useSpeech(handleSpeechResult, () => setIsResponding(false));

  useEffect(() => {
    const { farmerData, weatherData } = dashboardData;
    const summary = `**Hello ${farmerData.farmerName}.** The current temperature is ${weatherData[weatherData.length - 1].temperature}°C with ${weatherData[weatherData.length - 1].humidity}% humidity. Your farm looks generally healthy. How can I help you today?`;
    setDisplayText(summary);

    if (!hasSpokenGreeting.current && !isMuted) {
      speak(summary, () => setDisplayText('Tap the icon to speak'), isMuted);
      hasSpokenGreeting.current = true;
    } else if (hasSpokenGreeting.current === false && isMuted) {
      setDisplayText('Tap the icon to speak');
      hasSpokenGreeting.current = true;
    }
  }, [dashboardData, isMuted, speak]);

  const handleMicClick = () => {
    if (!isListening && !isResponding) {
      startListening();
      setDisplayText('Listening...');
      setIsResponding(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && isResponding) {
      speechSynthesis.cancel();
      setDisplayText('Tap the icon to speak');
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in text-white">
       <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <button onClick={onBack} className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/70">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-800/50 text-white border border-gray-600/50 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {supportedLanguages.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <button onClick={toggleMute} className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/70">
              {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
            </button>
            <button onClick={onClose} className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/70">
              <X className="w-5 h-5"/>
            </button>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {(isListening || isResponding) && (
            <>
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
              <div style={{ animationDelay: '150ms' }} className="absolute inset-4 rounded-full bg-green-400 opacity-30 animate-ping"></div>
              <div style={{ animationDelay: '300ms' }} className="absolute inset-8 rounded-full bg-green-400 opacity-40 animate-ping"></div>
            </>
          )}
          <div className={`w-full h-full rounded-full relative overflow-hidden transition-all duration-300 ${isListening || isResponding ? 'scale-105' : 'scale-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-green-300 via-green-500 to-green-700"></div>
          </div>
        </div>
        <div className="text-center pt-10 h-48 overflow-y-auto text-white text-lg font-medium transition-opacity duration-300 px-4">
          <ReactMarkdown>
            {displayText}
          </ReactMarkdown>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center px-8 pb-12 pt-4">
        <button
          onClick={handleMicClick}
          disabled={isResponding}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 focus:ring-green-500/50 ${isListening ? 'bg-red-600 shadow-lg scale-110 animate-pulse' : 'bg-gray-800 shadow-md hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed'}`}
        >
          <Mic className={`w-8 h-8 transition-colors duration-300 ${isListening ? 'text-white' : isResponding ? 'text-gray-600' : 'text-gray-300'}`} />
        </button>
        <p className="mt-4 text-gray-400 text-sm h-5">
          {isResponding ? (isListening ? 'Listening...' : 'Thinking...') : 'Tap the icon to speak'}
        </p>
      </div>
    </div>
  );
};

const ChatMode = ({ dashboardData, auth, onBack, onClose, lang, setLang }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      { id: 1, sender: 'bot', text: `**Hello ${dashboardData.farmerData.farmerName}!** Here's a graphical overview of your farm.` },
      { id: 2, sender: 'bot', type: 'farm-summary-card' },
      { id: 3, sender: 'bot', text: "Let me know if you need more details on anything." }
    ]);
  }, [dashboardData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);

    try {
        const { response } = await apiService.sendChatMessage(input, auth.token);
        const botMessage = { id: Date.now() + 1, sender: 'bot', text: response };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        const errorMessage = { id: Date.now() + 1, sender: 'bot', text: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsBotTyping(false);
    }
  };

  const FarmSummaryCard = () => {
    const { weatherData, cropRecommendations } = dashboardData;
    const latestWeather = weatherData[weatherData.length - 1];

    return (
      <div className="bg-gray-800/50 rounded-3xl p-3 border border-gray-700 space-y-3 text-white">
        <h3 className="font-bold text-md text-green-400">Farm Status Overview</h3>
        <div className="p-2 bg-gray-900/50 rounded-2xl">
          <h4 className="font-semibold mb-2 text-sm">Current Weather</h4>
          <div className="flex justify-around text-center text-sm">
            <div className="flex flex-col items-center"><Sun className="text-yellow-400 mb-1 h-5 w-5"/> {latestWeather.temperature}°C</div>
            <div className="flex flex-col items-center"><Droplets className="text-blue-400 mb-1 h-5 w-5"/> {latestWeather.humidity}%</div>
            <div className="flex flex-col items-center"><Wind className="text-gray-400 mb-1 h-5 w-5"/> {dashboardData.farmerData.rainfall} mm</div>
          </div>
        </div>
        <div className="p-2 bg-gray-900/50 rounded-2xl">
          <h4 className="font-semibold mb-2 text-sm">Top Crop Recommendations</h4>
          <div className="space-y-2">
            {cropRecommendations.slice(0, 3).map(crop => (
              <div key={crop.crop}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{crop.crop}</span>
                  <span className={crop.suitability < 80 ? 'text-yellow-400' : 'text-green-400'}>{crop.suitability}% Suitability</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${crop.suitability < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${crop.suitability}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in text-white">
      <header className="flex items-center justify-between p-3 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 z-10 rounded-t-3xl">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <h2 className="text-lg font-bold ml-3">Chat Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {supportedLanguages.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <X className="w-5 h-5"/>
            </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(message => (
          <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-4 ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
              {message.type === 'farm-summary-card' ? <FarmSummaryCard /> : (
                <ReactMarkdown className="prose prose-invert max-w-none">
                  {message.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="flex items-start">
            <div className="bg-gray-800 rounded-3xl p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 bg-gray-800/50 border-t border-gray-700 flex items-center gap-3 rounded-b-3xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-900/50 text-white placeholder-gray-400 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
        />
        <button type="submit" disabled={isBotTyping || !input.trim()} className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-600 transition-colors">
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
};

const FarmerChat = ({ onClose }) => {
  const [mode, setMode] = useState('greeting');
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState({ token: localStorage.getItem('token') });
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.fetchDashboardData(auth.token);
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [auth.token]);

  if (error) return <ChatErrorScreen error={error} />;
  if (!dashboardData) return <ChatLoadingScreen />;

  const handleVoiceSelect = () => setMode('voice');
  const handleChatSelect = () => setMode('chat');
  const handleBack = () => setMode('greeting');

  return (
    <>
      {mode === 'greeting' && (
        <GreetingScreen onVoiceSelect={handleVoiceSelect} onChatSelect={handleChatSelect} lang={lang} />
      )}
      {mode === 'voice' && (
        <VoiceMode dashboardData={dashboardData} auth={auth} onBack={handleBack} onClose={onClose} lang={lang} setLang={setLang} />
      )}
      {mode === 'chat' && (
        <ChatMode dashboardData={dashboardData} auth={auth} onBack={handleBack} onClose={onClose} lang={lang} setLang={setLang} />
      )}
    </>
  );
};

const SoilHealthSection = ({ token, t }) => {
  const [farmerData, setFarmerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.fetchSoilHealthData(token);
        setFarmerData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="text-center text-red-600 py-8">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
      <p>{error}</p>
    </div>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const soilData = [
    { name: 'Nitrogen', value: farmerData.nitrogen },
    { name: 'Phosphorus', value: farmerData.phosphorus },
    { name: 'Potassium', value: farmerData.potassium },
    { name: 'pH', value: farmerData.ph }
  ];

  const radarData = [
    { subject: 'Nitrogen', A: farmerData.nitrogen, fullMark: 300 },
    { subject: 'Phosphorus', A: farmerData.phosphorus, fullMark: 300 },
    { subject: 'Potassium', A: farmerData.potassium, fullMark: 300 },
    { subject: 'pH', A: farmerData.ph * 30, fullMark: 300 },
    { subject: 'Rainfall', A: farmerData.rainfall / 10, fullMark: 300 },
    { subject: 'Temperature', A: farmerData.temperature * 10, fullMark: 300 },
    { subject: 'Humidity', A: farmerData.humidity * 3, fullMark: 300 }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">{t.soil}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Nutrient Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={soilData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {soilData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Soil Profile Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Value" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Environmental Factors</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[farmerData]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="temperature" fill="#82ca9d" name="Temperature (°C)" />
            <Bar dataKey="humidity" fill="#8884d8" name="Humidity (%)" />
            <Bar dataKey="rainfall" fill="#ffc658" name="Rainfall (mm)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PredictionModal = ({ isOpen, onClose, title, data, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up p-6" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Analyzing data...</p>
          </div>
        ) : data?.error ? (
          <div className="bg-red-50 p-6 rounded-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 mb-2">Error</h3>
            <p className="text-red-600">{data.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Prediction Result</h3>
              <p className="text-4xl font-bold text-blue-600">{data.prediction}</p>
              <p className="text-sm text-gray-500 mt-1">Quintal per Hectare</p>
            </div>
            
            {data.explanation && (
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Explanation</h3>
                <p className="text-gray-600">{data.explanation}</p>
              </div>
            )}
            
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
                <ul className="space-y-3">
                  {data.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Uncaught error:', error);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h1>
        <p className="text-red-600 mb-6">Please refresh the page or try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-red-600 text-white rounded-3xl hover:bg-red-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return children;
};

const AgriSenseDashboard = () => {
  const [farmerData, setFarmerData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    cropRecommendations: [],
    weatherData: [],
    yieldComparison: []
  });
  const [assets, setAssets] = useState({
    sensors: [],
    cameras: [],
    drones: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualLocation, setManualLocation] = useState({ city: '', state: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('preferredLanguage') || 'en');
  const navigate = useNavigate();
  const t = translations[currentLanguage];

  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatOpen]);

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };
  
  const deviceTemplates = {
    sensors: [
      'Soil Moisture Sensor SM-100', 'pH Meter Pro-pH7', 'Temperature Sensor TempMax-200', 'NPK Nutrient Analyzer NA-300', 'Weather Station WS-2000'
    ],
    cameras: [
      'Field Monitor Cam FM-4K', 'Security Camera SC-Pro', 'Thermal Imaging Cam TIC-300', 'Night Vision Camera NVC-200'
    ],
    drones: [
      'DJI Mavic 3 Pro', 'DJI Air 3S', 'DJI Mini 4 Pro', 'Autel Evo Lite+'
    ]
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 
      });
    });
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      const data = await response.json();
      return {
        city: data.city || '',
        state: data.principalSubdivision || '',
        fullAddress: data.localityInfo?.informative?.map(i => i.name).join(', ') || 'Address not found'
      };
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      showNotification('Could not fetch address from GPS.', 'warning');
      return {
        city: farmerData?.district || 'Unknown',
        state: farmerData?.state || 'Location',
        fullAddress: 'Could not determine full address from GPS.'
      };
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchDashboardData(token);
      setFarmerData(data.farmerData);
      setDashboardData({
        cropRecommendations: data.cropRecommendations || [],
        weatherData: data.weatherData || [],
        yieldComparison: data.yieldComparison || [],
      });
      
      // Fetch assets separately
      const assetsData = await apiService.fetchAssets(token, data.farmerData.farmerId);
      setAssets(assetsData || { sensors: [], cameras: [], drones: [] });
      
      localStorage.setItem('farmerName', data.farmerData.farmerName);
      
      setLocationInfo({
          city: data.farmerData.district,
          state: data.farmerData.state,
          latitude: null,
          longitude: null,
          fullAddress: 'Location based on profile.'
      });
      handleRefreshLocation(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
      showNotification('Failed to load dashboard data. Please try again.', 'error');
      if (err.message.includes('invalid')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('farmerName');
    localStorage.removeItem('preferredLanguage');
    navigate('/login');
  };

  const getDisplayLocation = () => {
    if (locationInfo?.city && locationInfo?.state) {
      return `${locationInfo.city}, ${locationInfo.state}`;
    }
    if (farmerData?.district && farmerData?.state) {
        return `${farmerData.district}, ${farmerData.state}`;
    }
    return 'Unknown Location';
  };

  const handleRefreshLocation = async (showSpinner = true) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const geoInfo = await reverseGeocode(latitude, longitude);
      setLocationInfo({ ...geoInfo, latitude, longitude });
      showNotification('Location updated successfully!', 'success');
    } catch (error) {
      console.error('Geolocation error:', error);
      showNotification(error.message || 'Could not get your location.', 'error');
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  };

  const handleManualLocationSave = () => {
    if (manualLocation.city && manualLocation.state) {
      setLocationInfo({
        city: manualLocation.city,
        state: manualLocation.state,
        latitude: null,
        longitude: null,
        fullAddress: 'Location set manually.'
      });
      showNotification('Manual location saved!', 'success');
    } else {
      showNotification('Please enter both city and state.', 'warning');
    }
  };

  const addDevice = (category) => {
    setAssets(prevAssets => {
      const newDevice = {
        id: `device_${Date.now()}`,
        name: deviceTemplates[category][0],
        isActive: true,
        lastUpdated: new Date().toISOString()
      };
      return {
        ...prevAssets,
        [category]: [...prevAssets[category], newDevice]
      };
    });
    showNotification(`${category.slice(0, -1)} added!`, 'success');
  };

  const removeDevice = (category, id) => {
    setAssets(prevAssets => ({
      ...prevAssets,
      [category]: prevAssets[category].filter(device => device.id !== id)
    }));
    showNotification(`${category.slice(0, -1)} removed.`, 'warning');
  };

  const toggleDeviceStatus = (category, id) => {
    setAssets(prevAssets => ({
      ...prevAssets,
      [category]: prevAssets[category].map(device =>
        device.id === id ? { ...device, isActive: !device.isActive, lastUpdated: new Date().toISOString() } : device
      )
    }));
  };

  const updateDeviceName = (category, id, newName) => {
     setAssets(prevAssets => ({
      ...prevAssets,
      [category]: prevAssets[category].map(device =>
        device.id === id ? { ...device, name: newName } : device
      )
    }));
  };

  const saveAssets = async () => {
    showNotification('Saving assets...', 'success');
    const token = localStorage.getItem('token');
    const farmerId = farmerData.farmerId;
    try {
      await apiService.saveAssets(token, farmerId, assets);
      showNotification('All assets saved successfully!', 'success');
    } catch (err) {
      showNotification('Failed to save assets: ' + err.message, 'error');
    }
  };

  const handleProfileSave = async () => {
    console.log('Saving profile:', farmerData);
    showNotification('Saving profile changes...', 'success');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProfileEditing(false);
    showNotification('Profile updated successfully!', 'success');
  };

  const handlePredictYield = async () => {
    const token = localStorage.getItem('token');
    setIsModalOpen(true);
    setModalTitle(t.yieldPrediction);
    setIsModelLoading(true);
    setModalData(null);
    try {
        const data = await apiService.predictYield(token);
        setModalData(data);
    } catch (err) {
        setModalData({ error: err.message });
        showNotification(err.message, 'error');
    } finally {
        setIsModelLoading(false);
    }
  };

  const handleRecommendCrop = async () => {
    const token = localStorage.getItem('token');
    setIsModalOpen(true);
    setModalTitle(t.recommendCrop);
    setIsModelLoading(true);
    setModalData(null);
    try {
        const data = await apiService.recommendCrop(token);
        setModalData(data);
    } catch (err) {
        setModalData({ error: err.message });
        showNotification(err.message, 'error');
    } finally {
        setIsModelLoading(false);
    }
  };
  
  if (loading && !farmerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-700">{t.loading}</p>
      </div>
    );
  }

  if (error && !farmerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <p className="mt-4 text-xl text-red-700">{error}</p>
        <button onClick={fetchData} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          {t.refresh}
        </button>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: t.overview, icon: <Home className="w-5 h-5" /> },
    { id: 'crops', label: t.crops, icon: <Leaf className="w-5 h-5" /> },
    { id: 'soil', label: t.soil, icon: <TestTube className="w-5 h-5" /> },
    { id: 'weather', label: t.weather, icon: <CloudRain className="w-5 h-5" /> },
    { id: 'analytics', label: t.analytics, icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: t.assets, icon: <Settings className="w-5 h-5" /> },
    { id: 'finance', label: t.finance, icon: <DollarSign className="w-5 h-5" /> },
    { id: 'profile', label: t.profile, icon: <User className="w-5 h-5" /> }
  ];

  const NoDataPlaceholder = ({ height = 300 }) => (
    <div style={{ height }} className="flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-2xl">
      <p>{t.noData}</p>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-3xl p-6 border border-white/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="mb-4 md:mb-0 flex-grow">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t.welcomeBack}, {farmerData?.farmerName || 'User'}! 🌾
            </h1>
            <p className="text-gray-600 text-lg">
              {t.farmStatus} {getDisplayLocation()}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />
            <button onClick={handlePredictYield} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white/70 text-blue-700 rounded-xl shadow-sm hover:bg-white transition-transform transform hover:scale-105">
              <TrendingUp className="w-4 h-4" />
              {t.yieldPrediction}
            </button>
            <button onClick={handleRecommendCrop} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white/70 text-green-700 rounded-xl shadow-sm hover:bg-white transition-transform transform hover:scale-105">
              <BrainCircuit className="w-4 h-4" />
              {t.recommendCrop}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-white/40 p-6 rounded-3xl border border-white/30 shadow-xl flex items-center">
          <div className="p-4 bg-green-100 rounded-full"><Leaf className="w-8 h-8 text-green-600"/></div>
          <div className="ml-4">
            <p className="text-gray-600">{t.primaryCrop}</p>
            <p className="text-2xl font-bold text-gray-800">{farmerData?.crop || 'N/A'}</p>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/40 p-6 rounded-3xl border border-white/30 shadow-xl flex items-center">
          <div className="p-4 bg-blue-100 rounded-full"><MapPin className="w-8 h-8 text-blue-600"/></div>
          <div className="ml-4">
            <p className="text-gray-600">{t.farmArea}</p>
            <p className="text-2xl font-bold text-gray-800">{farmerData?.areaHectare || 'N/A'} ha</p>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/40 p-6 rounded-3xl border border-white/30 shadow-xl flex items-center">
          <div className="p-4 bg-yellow-100 rounded-full"><Thermometer className="w-8 h-8 text-yellow-600"/></div>
          <div className="ml-4">
            <p className="text-gray-600">{t.currentTemp}</p>
            <p className="text-2xl font-bold text-gray-800">{dashboardData.weatherData.length > 0 ? dashboardData.weatherData[dashboardData.weatherData.length - 1].temperature : 'N/A'}°C</p>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/40 p-6 rounded-3xl border border-white/30 shadow-xl flex items-center">
          <div className="p-4 bg-purple-100 rounded-full"><Droplets className="w-8 h-8 text-purple-600"/></div>
          <div className="ml-4">
            <p className="text-gray-600">{t.currentHumidity}</p>
            <p className="text-2xl font-bold text-gray-800">{dashboardData.weatherData.length > 0 ? dashboardData.weatherData[dashboardData.weatherData.length - 1].humidity : 'N/A'}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{t.yieldComparison}</h3>
          {dashboardData.yieldComparison && dashboardData.yieldComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.yieldComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7"/>
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1.5rem', border: 'none' }} />
                <Area type="monotone" dataKey="yourYield" name="Your Yield" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                <Area type="monotone" dataKey="districtAvg" name="District Average" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
          ) : <NoDataPlaceholder />}
        </div>
        
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{t.topCropRecommendations}</h3>
          {dashboardData.cropRecommendations && dashboardData.cropRecommendations.length > 0 ? (
            <div className="space-y-4">
                {dashboardData.cropRecommendations.slice(0, 5).map((crop) => (
                <div key={crop.crop}>
                    <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{crop.crop}</span>
                    <span className="text-sm font-semibold text-green-600">{crop.suitability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${crop.suitability}%` }}></div>
                    </div>
                </div>
                ))}
            </div>
          ) : <NoDataPlaceholder />}
        </div>
      </div>
    </div>
  );

  const renderCropAnalysis = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Crop Suitability Analysis</h2>
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        {dashboardData.cropRecommendations && dashboardData.cropRecommendations.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dashboardData.cropRecommendations} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="crop" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1.5rem', border: 'none' }} />
                <Bar dataKey="suitability" name="Suitability" fill="#10b981" radius={[0, 12, 12, 0]} />
            </BarChart>
            </ResponsiveContainer>
        ) : <NoDataPlaceholder height={400} />}
      </div>
    </div>
  );

  const renderSoilHealth = () => {
    const token = localStorage.getItem('token');
    return <SoilHealthSection token={token} t={t} />;
  };

  const renderWeather = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">5-Day Weather History</h2>
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Temperature & Rainfall</h3>
         {dashboardData.weatherData && dashboardData.weatherData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dashboardData.weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight' }} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1.5rem', border: 'none' }} />
                <Bar yAxisId="right" dataKey="rainfall" barSize={20} fill="#3b82f6" radius={[12, 12, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} />
            </ComposedChart>
            </ResponsiveContainer>
        ) : <NoDataPlaceholder height={400}/>}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Profitability vs. Suitability Analysis</h3>
        {dashboardData.cropRecommendations && dashboardData.cropRecommendations.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis
                type="number"
                dataKey="suitability"
                name="Suitability"
                unit="%"
                tick={{ fontSize: 14, fill: '#374151' }}
                label={{ value: 'Suitability (%)', position: 'bottom', offset: 20, fill: '#374151', fontSize: 16 }}
              />
              <YAxis
                type="number"
                dataKey="profitability"
                name="Profitability"
                unit="%"
                tick={{ fontSize: 14, fill: '#374151' }}
                label={{ value: 'Profitability (%)', angle: -90, position: 'left', offset: 20, fill: '#374151', fontSize: 16 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '1.5rem',
                  border: '1px solid #e5e7eb',
                  padding: '12px',
                  fontSize: '14px'
                }}
                formatter={(value, name, props) => [
                  `${value}%`,
                  `${props.payload.crop} ${name}`
                ]}
              />
              <Legend verticalAlign="top" height={36} />
              <Scatter
                name="Crops"
                data={dashboardData.cropRecommendations}
                fill="#10b981"
                shape="circle"
                fillOpacity={0.8}
                stroke="#047857"
                strokeWidth={2}
                r={8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : <NoDataPlaceholder height={400} />}
      </div>
    </div>
  );

  const DeviceCard = ({ device, category, onToggleStatus, onRemove, onUpdateName }) => (
    <div className={`p-4 rounded-3xl border-2 transition-all duration-300 ${
      device.isActive
        ? 'bg-green-50/50 border-green-200 shadow-sm'
        : 'bg-gray-50/50 border-gray-200 shadow-sm opacity-75'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleStatus(category, device.id)}
            className={`p-2 rounded-full transition-colors ${
              device.isActive
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {device.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
          </button>
          <div>
            <select
              value={device.name}
              onChange={(e) => onUpdateName(category, device.id, e.target.value)}
              className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              {deviceTemplates[category].map(template => (
                <option key={template} value={template}>{template}</option>
              ))}
            </select>
            <p className={`text-xs mt-1 ${device.isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {device.isActive ? t.active : t.inactive} • {t.lastUpdated}: {new Date(device.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(category, device.id)}
          className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

// --- MERGED: IMPROVED ASSETS/SETTINGS SECTION ---
const renderSettings = () => {
  // Configuration object for asset categories with a unified green theme
  const categoryConfig = {
    sensors: {
      icon: <Router className="w-6 h-6 text-green-700" />,
      label: 'IoT Sensors',
    },
    cameras: {
      icon: <Camera className="w-6 h-6 text-green-700" />,
      label: 'Surveillance Cameras',
    },
    drones: {
      icon: <Navigation className="w-6 h-6 text-green-700" />,
      label: 'Agricultural Drones',
    }
  };

  // Professional component styles with enhanced design system
  const styles = {
    container: 'min-h-screen bg-slate-50 p-6',
    contentWrapper: 'max-w-7xl mx-auto space-y-8',
    headerSection: 'text-center mb-12',
    mainTitle: 'text-4xl font-bold text-slate-800 tracking-tight mb-4',
    subtitle: 'text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed',
    summaryCard: 'bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-5',
    detailsCard: 'bg-white rounded-lg border border-slate-200 shadow-md p-6',
    button: 'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-3 focus:ring-offset-2 active:transform active:scale-95',
    iconWrapper: 'flex items-center justify-center w-14 h-14 rounded-xl mb-4',
    gridContainer: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <header className={styles.headerSection}>
          <h1 className={styles.mainTitle}>
            Farm Assets Management System
          </h1>
          <p className={styles.subtitle}>
            Monitor, manage, and optimize your agricultural assets with real-time insights and comprehensive control
          </p>
        </header>

        <section aria-labelledby="assets-summary" className="mb-12">
          <h2 id="assets-summary" className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-1 h-8 bg-green-500 rounded-full mr-4"></div>
            Assets Overview
          </h2>
          <div className={styles.gridContainer}>
            {Object.keys(assets).map(category => {
              const config = categoryConfig[category];
              const activeCount = assets[category]?.filter(device => device.isActive).length || 0;
              const totalCount = assets[category]?.length || 0;
              const statusPercentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

              return (
                <article key={`summary-${category}`} className={styles.summaryCard}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${styles.iconWrapper} bg-gradient-to-br from-green-50 to-green-100 border-green-200 border`}>
                      {config.icon}
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-green-700">
                          {activeCount}
                        </span>
                        <span className="text-slate-400 text-base font-medium">
                          /{totalCount}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-green-700 mt-1">
                        {statusPercentage}% Active
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {config.label}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 font-medium">
                      {activeCount} of {totalCount} devices online
                    </p>
                    <div className={`w-3 h-3 rounded-full ${activeCount > 0 ? 'bg-green-400' : 'bg-slate-300'} shadow-sm`} 
                         aria-label={activeCount > 0 ? 'Online' : 'Offline'}></div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${statusPercentage}%` }}
                        aria-label={`${statusPercentage}% devices active`}
                      ></div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {Object.keys(assets).map(category => {
          const config = categoryConfig[category];
          return (
            <section key={`details-${category}`} className={styles.detailsCard} aria-labelledby={`${category}-section`}>
              <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <h3 id={`${category}-section`} className="text-2xl font-bold text-slate-800 flex items-center">
                  <div className={`${styles.iconWrapper} bg-gradient-to-br from-green-50 to-green-100 border-green-200 border w-12 h-12 mr-4`}>
                    {config.icon}
                  </div>
                  {config.label}
                </h3>
                <button
                  onClick={() => addDevice(category)}
                  className={`${styles.button} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`}
                  aria-label={`Add new ${category.slice(0, -1)}`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add {config.label.split(' ').pop().slice(0, -1)}
                </button>
              </header>

              {(assets[category] || []).length === 0 ? (
                <div className="text-center py-16 px-8">
                  <div className={`${styles.iconWrapper} bg-gradient-to-br from-green-50 to-green-100 border-green-200 border w-20 h-20 mx-auto mb-6 opacity-50`}>
                    {config.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-slate-700 mb-2">
                    No {config.label} Added Yet
                  </h4>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                    Start building your farm's digital infrastructure by adding your first {category.slice(0, -1)}.
                  </p>
                  <button
                    onClick={() => addDevice(category)}
                    className={`${styles.button} bg-white text-slate-700 border-slate-300 border hover:bg-slate-50 focus:ring-slate-500/50`}
                    aria-label={`Add new ${category.slice(0, -1)}`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Get Started
                  </button>
                </div>
              ) : (
                <div className={styles.gridContainer}>
                  {assets[category].map(device => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      category={category}
                      onToggleStatus={toggleDeviceStatus}
                      onRemove={removeDevice}
                      onUpdateName={updateDeviceName}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <footer className="flex justify-center pt-8 border-t border-slate-200">
          <button
            onClick={saveAssets}
            className={`${styles.button} px-12 py-4 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 text-base font-bold tracking-wide`}
            aria-label="Save all farm assets configuration"
          >
            <Save className="w-6 h-6 mr-3" />
            Save All Assets Configuration
          </button>
        </footer>
      </div>
    </div>
  );
};

const renderFinance = () => {
  const token = localStorage.getItem('token');
  return <FinanceEducation token={token} language={currentLanguage} t={t} farmerData={farmerData} />;
};

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Farmer Profile</h2>
        <button
          onClick={isProfileEditing ? handleProfileSave : () => setIsProfileEditing(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
        >
          {isProfileEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {isProfileEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            <ProfileInput label="Farmer ID" value={farmerData?.farmerId || ''} disabled />
            <ProfileInput
              label="Full Name"
              name="farmerName"
              value={farmerData?.farmerName || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
            <ProfileInput
              label="Email"
              name="email"
              type="email"
              value={farmerData?.email || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
            <ProfileInput
              label="State"
              name="state"
              value={farmerData?.state || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
            <ProfileInput
              label="District"
              name="district"
              value={farmerData?.district || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Farm & Soil Details</h3>
            <ProfileInput
              label="Primary Crop"
              name="crop"
              value={farmerData?.crop || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
            <ProfileInput
              label="Season"
              name="season"
              value={farmerData?.season || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
            <ProfileInput
              label="Year"
              name="year"
              type="number"
              value={farmerData?.year || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
            <ProfileInput
              label="Area (Hectare)"
              name="areaHectare"
              type="number"
              value={farmerData?.areaHectare || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Current Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-600">{getDisplayLocation()}</span>
            </div>
            {locationInfo && (
              <>
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-700">GPS Coordinates:</span>
                  <span className="ml-2 text-gray-600 text-sm">
                    {locationInfo.latitude?.toFixed(6) || 'N/A'}, {locationInfo.longitude?.toFixed(6) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-700">Full Address:</span>
                </div>
                <p className="text-sm text-gray-600 ml-7 bg-gray-50 p-2 rounded-3xl">
                  {locationInfo.fullAddress || 'Not available'}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleRefreshLocation(true)}
              disabled={isRefreshing}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-3xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.refresh} Location
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Manual Location Input</h3>
        <p className="text-gray-600 mb-4">Enter your location manually if automatic detection fails.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={manualLocation.city}
              onChange={(e) => setManualLocation(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 border border-blue-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={manualLocation.state}
              onChange={(e) => setManualLocation(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 border border-blue-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter state"
            />
          </div>
        </div>
        <button
          onClick={handleManualLocationSave}
          disabled={!manualLocation.city || !manualLocation.state}
          className="mt-6 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          <Map className="w-4 h-4 mr-2" />
          {t.save} Location
        </button>
      </div>
    </div>
  );

  const ProfileInput = ({ label, name, value, onChange, disabled, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(prev => ({ ...prev, [name]: e.target.value }))}
        disabled={disabled}
        className={`w-full px-4 py-3 backdrop-blur-md border rounded-3xl transition-all duration-300 ${
          !disabled
            ? 'bg-white/50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            : 'bg-gray-100/50 border-gray-200 text-gray-700 cursor-not-allowed'
        }`}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'crops': return renderCropAnalysis();
      case 'soil': return renderSoilHealth();
      case 'weather': return renderWeather();
      case 'analytics': return renderAnalytics();
      case 'settings': return renderSettings();
      case 'finance': return renderFinance();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex" style={{ backgroundColor: '#F0F4FA' }}>
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-3xl shadow-lg text-white z-50 animate-fade-in ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}>
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 inline mr-2" />}
            {notification.message}
          </div>
        )}
        
        <aside className={`bg-white/30 backdrop-blur-md border-r border-white/40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} rounded-r-3xl`}>
          <div className="p-4 flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
              <Sprout className="w-8 h-8 text-green-600" />
              {sidebarOpen && <span className="text-2xl font-bold text-gray-800 ml-2">AgriSense</span>}
            </div>
          </div>
          <nav className="mt-8">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-6 py-4 text-left transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-100/50 text-blue-700 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100/50'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <header className="flex items-center justify-between mb-8">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full hover:bg-white/50">
              {sidebarOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="font-medium mr-2">{getDisplayLocation()}</span>
                <button
                  onClick={() => handleRefreshLocation(true)}
                  disabled={isRefreshing}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                  title="Refresh location"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <button className="relative p-2 rounded-full hover:bg-white/50">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
           
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                    {farmerData?.farmerName?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-semibold text-gray-800">{farmerData?.farmerName || 'User'}</p>
                    <p className="text-sm text-gray-500">{farmerData?.role || 'Farmer'}</p>
                  </div>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-3xl shadow-2xl py-2 z-50 border border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {renderContent()}
        </main>
        
        <PredictionModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalTitle}
            data={modalData}
            isLoading={isModelLoading}
        />
        
        <PlantDiseaseModal 
            isOpen={isDiseaseModalOpen}
            onClose={() => setIsDiseaseModalOpen(false)}
        />

        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-center gap-4">
           <button
            onClick={() => setIsDiseaseModalOpen(true)}
            className="bg-green-600 text-white rounded-3xl p-5 shadow-lg border border-white/30 hover:bg-green-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-400/50"
            aria-label="Open Plant Disease Detection"
            title="Plant Disease Detection"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
                <Leaf className="w-6 h-6" />
                <Camera className="w-4 h-4 absolute -bottom-1 -right-1 bg-green-700 rounded-full p-0.5 border-2 border-green-600" />
            </div>
          </button>
           <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 text-white rounded-3xl p-5 shadow-lg border border-white/30 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
            aria-label="Open Chat Assistant"
          >
            <Bot className="w-8 h-8" />
          </button>
        </div>

        {isChatOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
             onClick={() => setIsChatOpen(false)}
          >
            <div
              className="w-11/12 max-w-3xl h-[90vh] max-h-[700px] bg-gray-900 rounded-3xl shadow-2xl flex flex-col relative animate-slide-up overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <FarmerChat onClose={() => setIsChatOpen(false)} />
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

        @keyframes slide-up {
          from { transform: translateY(20px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-bounce { animation: bounce 1.2s infinite ease-in-out; }
        .text-blue-600 { color: #2563eb; }
        .text-green-600 { color: #059669; }
        .text-purple-600 { color: #7c3aed; }
        .text-yellow-600 { color: #ca8a04; }
        
        .prose {
          color: #374151;
          line-height: 1.6;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose strong {
          color: #111827;
          font-weight: 600;
        }
        .prose ul {
          list-style-position: inside;
          padding-left: 0;
        }
         .prose li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default AgriSenseDashboard;