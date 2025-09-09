import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import {
  Sprout, CloudRain, Thermometer, Droplets, TestTube,
  TrendingUp, Calendar, MapPin, Settings, Bell, User, Home,
  BarChart3, Leaf, Sun, Menu, X, Plus, Edit, Save, AlertTriangle, Loader,
  RefreshCw, LogOut, Map, Navigation, CheckCircle, Trash2, Power, PowerOff, Bot,
  Mic, Send, ArrowLeft, Wind, BarChart2 as BarChart2Icon, Volume2, VolumeX, BrainCircuit,
  DollarSign, BookOpen, GraduationCap, Languages
} from 'lucide-react';

// --- Configuration ---
const API_URL = 'http://localhost:5000';

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

  // NEW: Finance Education Advice Service
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
  }
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

// --- REBUILT Finance Education Component ---

// Skeleton Loader for Cards
const CardSkeleton = () => (
  <div className="bg-white/50 rounded-2xl shadow-lg p-4 animate-pulse">
    <div className="w-full h-40 bg-gray-300 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
    <div className="h-6 bg-gray-400 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

// Advice Card Component - UPDATED
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

// Main FinanceEducation Component - UPDATED
const FinanceEducation = ({ token, language, t }) => {
  const [adviceCards, setAdviceCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdvice = async () => {
      setIsLoading(true);
      const data = await apiService.fetchFinanceAdvice(token, language);
      if (Array.isArray(data)) {
        setAdviceCards(data);
      } else {
        setAdviceCards([{ error: true, title: "Error", summary: "Received invalid data from the server.", category: "Error", imageUrl: 'https://source.unsplash.com/800x600/?error' }]);
      }
      setIsLoading(false);
    };

    if (token) {
      loadAdvice();
    }
  }, [token, language]);

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{t.financeTitle}</h3>
            <p className="text-gray-600 mt-1">{t.financeSubtitle}</p>
          </div>
        </div>
        
        {isLoading ? (
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
    </div>
  );
};


// ... (The rest of your frontend code (Speech hook, Chat components, Dashboard, etc.) remains the same)
// --- Speech Recognition and Synthesis Hook ---
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

// --- Chat UI Components ---
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
            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                <X className="w-5 h-5"/>
            </button>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <Bot className="w-7 h-7 p-1.5 bg-green-600 rounded-full self-start flex-shrink-0"/>}
            <div className={`max-w-md rounded-2xl p-3 text-sm ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              {msg.type === 'farm-summary-card' ? <FarmSummaryCard /> : <ReactMarkdown>{msg.text}</ReactMarkdown>}
            </div>
            {msg.sender === 'user' && <User className="w-7 h-7 p-1.5 bg-blue-600 rounded-full self-start flex-shrink-0"/>}
          </div>
        ))}
        {isBotTyping && (
          <div className="flex items-end gap-2 justify-start">
            <Bot className="w-7 h-7 p-1.5 bg-green-600 rounded-full self-start flex-shrink-0"/>
            <div className="max-w-md rounded-2xl p-3 bg-gray-700 rounded-bl-none">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-white rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 rounded-b-3xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-white text-sm"
          />
          <button type="submit" className="p-2.5 bg-green-600 rounded-full hover:bg-green-700 disabled:bg-gray-600" disabled={!input.trim() || isBotTyping}>
            <Send className="w-5 h-5"/>
          </button>
        </div>
      </form>
    </div>
  );
};

const FarmerChat = ({ onClose }) => {
  const [view, setView] = useState('loading'); // loading, greeting, voice, chat, error
  const [dashboardData, setDashboardData] = useState(null);
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState(navigator.language.split('-')[0] || 'en');

  useEffect(() => {
    const initialize = async () => {
      const farmerToken = localStorage.getItem('token');
      const farmerId = localStorage.getItem('farmerId');

      if (!farmerToken || !farmerId) {
        setError("Authentication token not found. Please log in through your dashboard.");
        setView('error');
        return;
      }

      setAuth({ token: farmerToken, farmerId });

      try {
        const data = await apiService.fetchDashboardData(farmerToken);
        setDashboardData(data);
        setView('greeting');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Could not connect to the server.');
        setView('error');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const renderView = () => {
    switch (view) {
      case 'greeting':
        return <GreetingScreen onVoiceSelect={() => setView('voice')} onChatSelect={() => setView('chat')} lang={lang} />;
      case 'voice':
        return <VoiceMode dashboardData={dashboardData} auth={auth} onBack={() => setView('greeting')} onClose={onClose} lang={lang} setLang={setLang} />;
      case 'chat':
        return <ChatMode dashboardData={dashboardData} auth={auth} onBack={() => setView('greeting')} onClose={onClose} lang={lang} setLang={setLang} />;
      case 'error':
        return <ChatErrorScreen error={error} />;
      case 'loading':
      default:
        return <ChatLoadingScreen />;
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 shadow-2xl flex flex-col relative text-white font-sans">
        {renderView()}
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <div className="ml-4 text-lg font-semibold text-red-700">
            <p>Oops! Something went wrong.</p>
            <p className="text-sm text-red-600">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Prediction Modal Component ---
const PredictionModal = ({ isOpen, onClose, title, data, isLoading }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Fetching prediction from AI model...</p>
        </div>
      );
    }
    if (!data) {
      return <div className="text-center py-12 text-gray-500">No data to display.</div>;
    }

    if (data.error) {
        return <div className="text-center py-12 text-red-500 px-6"><strong>Error:</strong> {data.error}</div>;
    }
    
    // Custom renderer for Yield Prediction
    if (title === 'Yield Prediction' && data.predicted_yield_quintal_per_hectare) {
        return (
            <div className="text-center p-6">
                <p className="text-lg text-gray-600">Predicted Yield</p>
                <p className="text-5xl font-bold text-green-600 my-2">
                    {data.predicted_yield_quintal_per_hectare.toFixed(2)}
                </p>
                <p className="text-lg text-gray-600">Quintal / Hectare</p>
            </div>
        )
    }

    // Custom renderer for Crop Recommendation
    if (title === 'Crop Recommendation') {
        const findKey = (obj, searchKey) => {
            const normalizedSearchKey = searchKey.toLowerCase().replace(/ /g, '');
            for (const key in obj) {
                if (key.toLowerCase().replace(/ /g, '') === normalizedSearchKey) {
                    return key;
                }
            }
            return null;
        };
        
        const getTitle = (key) => {
            return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        const renderValue = (key, value, allData) => {
          const normalizedKey = key.toLowerCase().replace(/[_ ]/g, '');

          switch (normalizedKey) {
            case 'newcroprecommendations':
              return (
                <div className="bg-gray-50 p-4 rounded-xl space-y-3 mt-1">
                  {Array.isArray(value) && value.length > 0 ? (
                    value.map((rec, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium capitalize text-base">
                          {rec.crop}
                        </span>
                        <span className="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-md">
                          {(rec.final_score * 100).toFixed(1)}% Score
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No recommendations</span>
                  )}
                </div>
              );

            case 'advicefortopnewcrop':
            case 'adviceforexistingcrop':
              return (
                <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-xl mt-1">
                  <ReactMarkdown>{String(value)}</ReactMarkdown>
                </div>
              );

            case 'featuresused':
              return (
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm mt-1">
                  {Object.entries(value).map(([featureKey, featureValue]) => (
                    <div
                      key={featureKey}
                      className="grid grid-cols-2 gap-2 items-center"
                    >
                      <strong className="text-gray-600 capitalize">
                        {featureKey.replace(/_/g, ' ')}:
                      </strong>
                      <span>
                        {typeof featureValue === 'number'
                          ? featureValue.toFixed(2)
                          : String(featureValue)}
                      </span>
                    </div>
                  ))}
                </div>
              );

            default:
              if (typeof value === 'object' && !Array.isArray(value)) {
                return (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm mt-1">
                    {Object.entries(value).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="font-medium text-gray-700 capitalize">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-900">
                          {typeof v === 'number' ? v.toFixed(2) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-xl mt-1">
                  <ReactMarkdown>{String(value)}</ReactMarkdown>
                </div>
              );
          }
        };

        return (
            <div className="p-6 space-y-6 text-gray-800">
                {Object.entries(data).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                        <div key={key}>
                            <h4 className="font-semibold text-gray-700 text-lg border-b pb-2 mb-2">{getTitle(key)}</h4>
                            {renderValue(key, value, data)}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Generic renderer for other JSON objects
    return (
      <div className="p-6">
        <pre className="bg-gray-100 p-4 rounded-xl text-sm text-gray-800 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        <div className="max-h-[60vh] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const AgriSenseDashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [manualLocation, setManualLocation] = useState({ city: '', state: '' });
  const [locationInfo, setLocationInfo] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Prediction modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  // Asset management state with detailed devices
  const [assets, setAssets] = useState({
    sensors: [],
    cameras: [],
    drones: []
  });

  // State for dynamic data
  const [farmerData, setFarmerData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    cropRecommendations: [],
    weatherData: [],
    yieldComparison: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Get current translations
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

  // Predefined device names for realistic options
  const deviceTemplates = {
    sensors: [
      'Soil Moisture Sensor SM-100',
      'pH Meter Pro-pH7',
      'Temperature Sensor TempMax-200',
      'NPK Nutrient Analyzer NA-300',
      'Weather Station WS-2000',
      'Light Intensity Sensor LIS-150',
      'Humidity Monitor HM-250',
      'CO2 Level Detector CLD-400',
      'Water Flow Sensor WFS-100',
      'Conductivity Meter CM-500'
    ],
    cameras: [
      'Field Monitor Cam FM-4K',
      'Security Camera SC-Pro',
      'Thermal Imaging Cam TIC-300',
      'Night Vision Camera NVC-200',
      'Pan-Tilt Camera PTC-360',
      'Weather Resistant Cam WRC-HD',
      'Motion Detection Cam MDC-AI',
      'Crop Monitor Camera CMC-Ultra',
      'Perimeter Security Cam PSC-Pro',
      'Livestock Monitor LM-Cam'
    ],
    drones: [
      'DJI Mavic 3 Pro',
      'DJI Air 3S',
      'DJI Mini 4 Pro',
      'Autel Evo Lite+',
      'Parrot Anafi AI',
      'DJI Matrice 350 RTK',
      'Skydio 2+ Pro',
      'DJI Agras T40',
      'Yuneec H520E',
      'Autel Dragonfish Pro'
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
        maximumAge: 60000 // 1 minute cache
      });
    });
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using a free reverse geocoding API for demonstration
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
      setAssets(data.assets || { sensors: [], cameras: [], drones: [] });
      
      // Store farmer name for chat component
      localStorage.setItem('farmerName', data.farmerData.farmerName);
      
      // Set initial location from profile, then try to update with GPS
      setLocationInfo({
          city: data.farmerData.district,
          state: data.farmerData.state,
          latitude: null,
          longitude: null,
          fullAddress: 'Location based on profile.'
      });
      handleRefreshLocation(false); // Refresh without showing loading spinner initially
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
        name: deviceTemplates[category][0], // Default to the first template
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
    // Mock API call
    showNotification('Saving assets...', 'success');
    console.log('Saving assets:', assets);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showNotification('All assets saved successfully!', 'success');
  };

  const handleProfileSave = async () => {
    // Mock API call
    console.log('Saving profile:', farmerData);
    showNotification('Saving profile changes...', 'success');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProfileEditing(false);
    showNotification('Profile updated successfully!', 'success');
  };

  // Handlers for prediction buttons
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-700">{t.loading}</p>
      </div>
    );
  }

  if (error) {
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

  const soilHealthRadar = [
    { subject: 'Nitrogen', A: farmerData?.N / 150 * 100 || 0, fullMark: 100 },
    { subject: 'Phosphorus', A: farmerData?.P / 100 * 100 || 0, fullMark: 100 },
    { subject: 'Potassium', A: farmerData?.K / 100 * 100 || 0, fullMark: 100 },
    { subject: 'pH', A: (farmerData?.ph - 4) / 5 * 100 || 0, fullMark: 100 },
    { subject: 'Moisture', A: farmerData?.soilMoisture || 0, fullMark: 100 },
  ];

  const NoDataPlaceholder = ({ height = 300 }) => (
    <div style={{ height }} className="flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-2xl">
      <p>{t.noData}</p>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header with Language Selector */}
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

      {/* Stats Cards */}
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

      {/* Charts */}
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

  const renderSoilHealth = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Soil Nutrient Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">NPK Levels (vs Optimal)</h3>
           {farmerData?.N !== undefined ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                { name: 'Nitrogen', current: farmerData.N, optimal: 120 },
                { name: 'Phosphorus', current: farmerData.P, optimal: 80 },
                { name: 'Potassium', current: farmerData.K, optimal: 90 },
                ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1.5rem', border: 'none' }} />
                <Bar dataKey="current" name="Current" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                <Bar dataKey="optimal" name="Optimal" fill="#06b6d4" radius={[12, 12, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          ) : <NoDataPlaceholder />}
        </div>

        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Overall Soil Health (%)</h3>
          {farmerData?.N !== undefined ? (
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={soilHealthRadar}>
                <PolarGrid stroke="#e0e4e7" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
            </ResponsiveContainer>
            ) : <NoDataPlaceholder />}
        </div>
      </div>
    </div>
  );

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
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                <XAxis type="number" dataKey="suitability" name="Suitability" unit="%" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="profitability" name="Profitability" unit="%" tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1.5rem', border: 'none' }} />
                <Scatter name="Crops" data={dashboardData.cropRecommendations} fill="#10b981" />
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

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Farm Assets Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(assets).map(category => {
          const activeCount = assets[category]?.filter(device => device.isActive).length || 0;
          const totalCount = assets[category]?.length || 0;
          const icons = {
            sensors: '🔧',
            cameras: '📷',
            drones: '🚁'
          };
          const colors = {
            sensors: 'blue',
            cameras: 'green',
            drones: 'purple'
          };

          return (
            <div key={category} className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className={`text-3xl`}>{icons[category]}</div>
                <div className={`text-right`}>
                  <span className={`text-2xl font-bold text-${colors[category]}-600`}>{activeCount}</span>
                  <span className="text-gray-500">/{totalCount}</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 capitalize mb-2">
                {category === 'sensors' ? 'IoT Sensors' :
                 category === 'cameras' ? 'Surveillance Cameras' :
                 'Agricultural Drones'}
              </h3>
              <p className="text-sm text-gray-600">
                {activeCount} {t.activeDevices}
              </p>
            </div>
          );
        })}
      </div>

      {Object.keys(assets).map(category => (
        <div key={category} className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 capitalize">
              {category === 'sensors' ? '🔧 IoT Sensors' :
               category === 'cameras' ? '📷 Surveillance Cameras' :
               '🚁 Agricultural Drones'}
            </h3>
            <button
              onClick={() => addDevice(category)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {category.slice(0, -1)}
            </button>
          </div>

          {(assets[category] || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {category} added yet. Click "Add {category.slice(0, -1)}" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      ))}

      <div className="flex justify-center">
        <button
          onClick={saveAssets}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-3xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {t.save} All Assets
        </button>
      </div>
    </div>
  );

  const renderFinance = () => {
    const token = localStorage.getItem('token');
    return <FinanceEducation token={token} language={currentLanguage} t={t} />;
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
              className="w-full px-4 py-3 backdrop-blur-md border rounded-3xl bg-white/50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={manualLocation.state}
              onChange={(e) => setManualLocation(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-4 py-3 backdrop-blur-md border rounded-3xl bg-white/50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        {/* --- ADDED: Render the Modal --- */}
        <PredictionModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalTitle}
            data={modalData}
            isLoading={isModelLoading}
        />

        <div className="fixed bottom-8 right-8 z-40">
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
        
        /* Simple prose styles for markdown content in modal */
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