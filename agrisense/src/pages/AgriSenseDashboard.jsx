// AgriSenseDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SoilHealthAnalysis from './SoilHealthAnalysis';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import {
  Sprout, CloudRain, Thermometer, Droplets, TestTube,
  TrendingUp, Calendar, MapPin, Settings, Bell, User, Home,
  BarChart3, Leaf, Sun, Menu, X, Plus, Edit, Save, AlertTriangle, Loader,
  RefreshCw, LogOut, Map, Navigation, CheckCircle, Trash2, Power, PowerOff,
  Wifi, WifiOff, Activity, Shield, Eye, EyeOff, Zap, Signal, ChevronDown,
  Smartphone, Monitor, Tablet, MessageCircle, Bot,
  Mic, Send, ArrowLeft, Wind, BarChart2 as BarChart2Icon, Volume2, VolumeX, BrainCircuit
} from 'lucide-react';
import VoiceAssistantUI from './VoiceAssistantUI'; // Import VoiceAssistantUI

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===================================================================================
// SECTION 1: API SERVICE UPDATES
// INFO: Add the new `predictYield` and `recommendCrop` functions to your apiService object.
// ===================================================================================

const API_URL = 'http://localhost:5000';

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

  // ADD THIS: API call for yield prediction
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

  // ADD THIS: API call for crop recommendation
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


// ===================================================================================
// SECTION 2: CHATBOT & PREDICTION COMPONENTS
// INFO: Add all of the following components to your file.
// They are self-contained and handle the UI for the chat and predictions.
// ===================================================================================

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
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
];

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
                <div className="flex justify-between items-center text-xs mb-1">
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


// --- ADD THIS: The Prediction Modal Component ---
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
                      <div key={index} className="flex justify-between items-center text-sm" >
                        <span className="font-medium capitalize text-base">{rec.crop}</span>
                        <span className="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-md">
                          {(rec.final_score * 100).toFixed(1)}% Score
                        </span>
                      </div>
                    ))
                  ) : (<span className="text-gray-500 italic">No recommendations</span>)}
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
                    <div key={featureKey} className="grid grid-cols-2 gap-2 items-center">
                      <strong className="text-gray-600 capitalize">{featureKey.replace(/_/g, ' ')}:</strong>
                      <span>
                        {typeof featureValue === 'number' ? featureValue.toFixed(2) : String(featureValue)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            default:
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

    // Generic fallback renderer
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


// ===================================================================================
// SECTION 3: MAIN DASHBOARD INTEGRATION
// INFO: This is your main dashboard component. Add the new state, handlers, and JSX
// elements as indicated by the comments.
// ===================================================================================

const AgriSenseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [manualLocation, setManualLocation] = useState({ city: '', state: '' });
  const [locationInfo, setLocationInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false); // Added showChat state

  // Updated Asset management state with detailed devices
  const [assets, setAssets] = useState({
    sensors: [],
    cameras: [],
    drones: []
  });

// Soil health is rendered in the main renderSoilHealth function below

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

  // ADD THIS: State for the chat modal
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // ADD THIS: State for the prediction modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && !event.target.closest('aside') && !event.target.closest('[data-sidebar-toggle]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

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
        maximumAge: 60000
      });
    });
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AgriSense/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      const address = data.address;

      const locationData = {
        latitude,
        longitude,
        city: address.city || address.town || address.village || address.suburb || 'Unknown City',
        state: address.state || 'Unknown State',
        district: address.city || address.town || address.village || address.suburb || 'Unknown District',
        country: address.country || 'Unknown Country',
        fullAddress: data.display_name
      };

      return locationData;
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  };

  const geocode = async (city, state) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${city}, ${state}, India`)}&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'AgriSense/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('Location not found');
      }

      const address = data[0].address || {};

      const locationData = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        city: city || address.city || address.town || address.village || 'Unknown City',
        state: state || address.state || 'Unknown State',
        district: city || address.city || address.town || address.village || 'Unknown District',
        country: address.country || 'India',
        fullAddress: data[0].display_name
      };

      return locationData;
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Asset management functions
  const fetchAssets = async () => {
    try {
      const farmerId = localStorage.getItem("farmerId");
      const token = localStorage.getItem("token");
      if (!token || !farmerId) return;

      const res = await fetch(`http://localhost:5000/farmer/assets/${farmerId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.sensors && data.cameras && data.drones) {
          setAssets(data);
        } else {
          setAssets({
            sensors: [],
            cameras: [],
            drones: []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets({
        sensors: [],
        cameras: [],
        drones: []
      });
    }
  };

  const saveAssets = async () => {
    try {
      const farmerId = localStorage.getItem("farmerId");
      const token = localStorage.getItem("token");
      if (!token || !farmerId) return;

      const response = await fetch("http://localhost:5000/farmer/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ farmerId, ...assets })
      });

      if (response.ok) {
        showNotification("Assets saved successfully!", "success");
      } else {
        throw new Error("Failed to save assets");
      }
    } catch (error) {
      showNotification("Error saving assets: " + error.message, "error");
    }
  };

  // Device management functions
  const addDevice = (category) => {
    const availableDevices = deviceTemplates[category].filter(
      template => !assets[category].some(device => device.name === template)
    );

    if (availableDevices.length === 0) {
      showNotification(`All ${category} have been added!`, "warning");
      return;
    }

    const newDevice = {
      id: Date.now(),
      name: availableDevices[0],
      isActive: true,
      lastUpdated: new Date().toISOString()
    };

    setAssets(prev => ({
      ...prev,
      [category]: [...prev[category], newDevice]
    }));
  };

  const removeDevice = (category, deviceId) => {
    setAssets(prev => ({
      ...prev,
      [category]: prev[category].filter(device => device.id !== deviceId)
    }));
  };

  const toggleDeviceStatus = (category, deviceId) => {
    setAssets(prev => ({
      ...prev,
      [category]: prev[category].map(device =>
        device.id === deviceId
          ? { ...device, isActive: !device.isActive, lastUpdated: new Date().toISOString() }
          : device
      )
    }));
  };

  const updateDeviceName = (category, deviceId, newName) => {
    setAssets(prev => ({
      ...prev,
      [category]: prev[category].map(device =>
        device.id === deviceId
          ? { ...device, name: newName, lastUpdated: new Date().toISOString() }
          : device
      )
    }));
  };

  const fetchDashboardData = async (useLocation = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const farmerId = localStorage.getItem('farmerId');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      let url = `http://localhost:5000/farmer/dashboard?farmerId=${farmerId}`;
      let lat = localStorage.getItem('lat');
      let lon = localStorage.getItem('lon');

      if (useLocation) {
        try {
          const position = await getCurrentPosition();
          lat = position.coords.latitude;
          lon = position.coords.longitude;
          localStorage.setItem('lat', lat);
          localStorage.setItem('lon', lon);

          const locationData = await reverseGeocode(lat, lon);
          setLocationInfo(locationData);
          localStorage.setItem('locationInfo', JSON.stringify(locationData));

          url += `&lat=${lat}&lon=${lon}`;
          showNotification(`Location updated: ${locationData.city}, ${locationData.state}`, 'success');
        } catch (geoError) {
          console.error('Geolocation error:', geoError);
          let errorMessage = 'Unable to fetch location';
          if (geoError.code === 1) {
            errorMessage = 'Location access denied. Please allow location access in your browser settings.';
          } else if (geoError.code === 2) {
            errorMessage = 'Location unavailable. Please ensure GPS is enabled.';
          } else if (geoError.code === 3) {
            errorMessage = 'Location request timed out. Please try refreshing.';
          }
          showNotification(errorMessage, 'warning');
        }
      } else if (lat && lon) {
        url += `&lat=${lat}&lon=${lon}`;
        const cachedLocationInfo = localStorage.getItem('locationInfo');
        if (cachedLocationInfo) {
          setLocationInfo(JSON.parse(cachedLocationInfo));
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerId');
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 429) {
          showNotification('Weather data update limited due to API restrictions. Using cached data.', 'warning');
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setFarmerData(data.farmerData);
      setDashboardData({
        cropRecommendations: data.cropRecommendations,
        weatherData: data.weatherData,
        yieldComparison: data.yieldComparison,
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLocation = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await fetchDashboardData(true);
    } catch (err) {
      showNotification('Failed to refresh location. Please try again or enter manually.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualLocationSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let locationData;
      try {
        locationData = await geocode(manualLocation.city, manualLocation.state);
        localStorage.setItem('lat', locationData.latitude);
        localStorage.setItem('lon', locationData.longitude);
      } catch (geoError) {
        showNotification(`Unable to get coordinates for location. Using manual input without GPS. ${geoError.message}`, 'warning');
        locationData = {
          city: manualLocation.city,
          state: manualLocation.state,
          district: manualLocation.city,
          country: 'India',
          fullAddress: `${manualLocation.city}, ${manualLocation.state}, India`,
          latitude: null,
          longitude: null
        };
      }

      setLocationInfo(locationData);
      localStorage.setItem('locationInfo', JSON.stringify(locationData));

      const response = await fetch('http://localhost:5000/farmer/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...farmerData,
          currentCity: manualLocation.city,
          district: manualLocation.city,
          state: manualLocation.state
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerId');
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to update location');
      }

      const updatedData = await response.json();
      setFarmerData(updatedData.farmer);
      showNotification(`Location updated to: ${manualLocation.city}, ${manualLocation.state}`, 'success');
      setManualLocation({ city: '', state: '' });
      await fetchDashboardData(false);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleProfileSave = async () => {
    setIsProfileEditing(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch('http://localhost:5000/farmer/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(farmerData)
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerId');
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to update profile');
      }
      const updatedData = await response.json();
      setFarmerData(updatedData.farmer);
      showNotification('Profile updated successfully', 'success');
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('lat');
    localStorage.removeItem('lon');
    localStorage.removeItem('locationInfo');
    navigate('/login');
    showNotification('Logged out successfully', 'success');
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  useEffect(() => {
    if (activeTab === "settings") {
      fetchAssets();
    }
  }, [activeTab]);

  // ADD THIS: Effect to handle body scroll when chat is open
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

  // ADD THIS: Handlers for the new prediction buttons
  const handlePredictYield = async () => {
    const token = localStorage.getItem('token');
    setIsModalOpen(true);
    setModalTitle('Yield Prediction');
    setIsModelLoading(true);
    setModalData(null);
    try {
        const data = await apiService.predictYield(token);
        setModalData(data);
    } catch (err) {
        setModalData({ error: err.message });
        // showNotification(err.message, 'error'); // Assuming you have a showNotification function
    } finally {
        setIsModelLoading(false);
    }
  };

  const handleRecommendCrop = async () => {
    const token = localStorage.getItem('token');
    setIsModalOpen(true);
    setModalTitle('Crop Recommendation');
    setIsModelLoading(true);
    setModalData(null);
    try {
        const data = await apiService.recommendCrop(token);
        setModalData(data);
    } catch (err) {
        setModalData({ error: err.message });
        // showNotification(err.message, 'error'); // Assuming you have a showNotification function
    } finally {
        setIsModelLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" />, color: 'text-blue-600' },
    { id: 'crops', label: 'Crop Analysis', icon: <Leaf className="w-5 h-5" />, color: 'text-green-600' },
    { id: 'weather', label: 'Weather', icon: <Sun className="w-5 h-5" />, color: 'text-yellow-600' },
    { id: 'soil', label: 'Soil Health', icon: <TestTube className="w-5 h-5" />, color: 'text-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, color: 'text-indigo-600' },
    { id: 'settings', label: 'Farm Assets', icon: <Settings className="w-5 h-5" />, color: 'text-gray-600' },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, color: 'text-pink-600' }
  ];

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="relative mb-6">
            <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-blue-200 mx-auto animate-pulse"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we fetch your farm data...</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-700 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get display location
  const getDisplayLocation = () => {
    if (locationInfo) {
      return `${locationInfo.city}, ${locationInfo.state}`;
    }
    if (farmerData?.currentCity && farmerData?.state) {
      return `${farmerData.currentCity}, ${farmerData.state}`;
    }
    if (farmerData?.district && farmerData?.state) {
      return `${farmerData.district}, ${farmerData.state}`;
    }
    return 'Unknown Location';
  };

  // Derived data for charts once farmerData is available
  const soilNutrients = farmerData ? [
    { nutrient: 'Nitrogen (N)', value: farmerData.N || 0, optimal: 80, unit: 'kg/ha' },
    { nutrient: 'Phosphorus (P)', value: farmerData.P || 0, optimal: 40, unit: 'kg/ha' },
    { nutrient: 'Potassium (K)', value: farmerData.K || 0, optimal: 50, unit: 'kg/ha' }
  ] : [];

  const soilHealthRadar = farmerData ? [
    { subject: 'pH Level', A: ((farmerData.ph || 0) / 14) * 100, fullMark: 100 },
    { subject: 'Nitrogen', A: ((farmerData.N || 0) / 120) * 100, fullMark: 100 },
    { subject: 'Phosphorus', A: ((farmerData.P || 0) / 60) * 100, fullMark: 100 },
  ] : [];

  const cropDistribution = farmerData ? [
    { crop: farmerData.crop || 'Main Crop', area: farmerData.areaHectare || 0, color: '#8884d8' }
  ] : [];

  // Enhanced responsive stat card
  const StatCard = ({ title, value, unit, icon, trend, color = 'blue' }) => (
    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-${color}-500 to-${color}-600 shadow-lg`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-xs md:text-sm px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <TrendingUp className={`w-3 h-3 md:w-4 md:h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-gray-600 text-xs md:text-sm">{title} {unit && `(${unit})`}</p>
      </div>
    </div>
  );

  // Enhanced mobile-friendly device card
  const DeviceCard = ({ device, category, onToggleStatus, onRemove, onUpdateName }) => {
    const getDeviceIcon = (category) => {
      switch (category) {
        case 'sensors': return <Zap className="w-4 h-4 md:w-5 md:h-5" />;
        case 'cameras': return <Eye className="w-4 h-4 md:w-5 md:h-5" />;
        case 'drones': return <Activity className="w-4 h-4 md:w-5 md:h-5" />;
        default: return <Shield className="w-4 h-4 md:w-5 md:h-5" />;
      }
    };

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${device.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {getDeviceIcon(category)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{device.name}</h4>
              <p className="text-xs text-gray-500">ID: {device.id}</p>
            </div>
          </div>
          <button
            onClick={() => onToggleStatus(category, device.id)}
            className={`p-1 rounded-full ${device.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
          >
            {device.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date(device.lastUpdated).toLocaleTimeString()}</span>
          <button
            onClick={() => onRemove(category, device.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* UPDATE THIS GREETING CARD */}
      <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-3xl p-6 border border-white/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {farmerData?.farmerName || 'User'}! 🌾
            </h1>
            <p className="text-gray-600 text-lg">
              Here is your farm's live status.
            </p>
          </div>
          {/* ADD THIS DIV WITH THE TWO BUTTONS */}
          <div className="flex items-center gap-2">
              <button onClick={handlePredictYield} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white/70 text-blue-700 rounded-xl shadow-sm hover:bg-white transition-transform transform hover:scale-105">
                <TrendingUp className="w-4 h-4" />
                Yield Prediction
              </button>
              <button onClick={handleRecommendCrop} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white/70 text-green-700 rounded-xl shadow-sm hover:bg-white transition-transform transform hover:scale-105">
                <BrainCircuit className="w-4 h-4" />
                Recommend Crop
              </button>
          </div>
        </div>
      </div>
      {/* ... (rest of your overview content) */}
    </div>
  );

  const renderCropAnalysis = () => (
    <div className="space-y-6 md:space-y-8 relative z-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Crop Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Crop Recommendations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.cropRecommendations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="suitability" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cropDistribution} dataKey="area" nameKey="crop" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderSoilHealth = () => (
    <SoilHealthAnalysis farmerData={farmerData} />
  );

  const renderWeather = () => (
    <div className="space-y-6 md:space-y-8 relative z-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Weather Forecast</h2>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.weatherData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
            <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 md:space-y-8 relative z-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Farm Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Yield Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.yieldComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="yield" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Soil Nutrients</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={soilNutrients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nutrient" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const categoryConfig = {
    sensors: {
      title: 'Sensors',
      description: 'Monitor environmental conditions',
      icon: <Zap className="w-5 h-5" />,
      color: 'emerald'
    },
    cameras: {
      title: 'Cameras',
      description: 'Visual surveillance and monitoring',
      icon: <Eye className="w-5 h-5" />,
      color: 'blue'
    },
    drones: {
      title: 'Drones',
      description: 'Aerial surveying and mapping',
      icon: <Activity className="w-5 h-5" />,
      color: 'indigo'
    }
  };

  const renderSettings = () => (
    <div className="space-y-8">
      {Object.entries(categoryConfig).map(([key, config]) => {
        const devices = assets[key];
        const activeCount = devices.filter(d => d.isActive).length;
        const totalCount = devices.length;
        const percentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

        return (
          <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-white text-lg backdrop-blur-sm">
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{config.title}</h3>
                    <p className="text-white/90 text-sm">{config.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => addDevice(key)}
                  className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {config.title.split(' ')[0]}
                </button>
              </div>
            </div>
            <div className="p-6">
              {devices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg mb-4 text-2xl mx-auto">
                    <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      {config.icon}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No {config.title} Added</h4>
                  <p className="text-gray-500 mb-6 text-sm">
                    Get started by adding your first {key.slice(0, -1)} to monitor your farm.
                  </p>
                  <button
                    onClick={() => addDevice(key)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {config.title.split(' ')[0]}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {devices.map(device => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      category={key}
                      onToggleStatus={toggleDeviceStatus}
                      onRemove={removeDevice}
                      onUpdateName={updateDeviceName}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Save section */}
      <div className="flex justify-center pt-6">
        <button
          onClick={saveAssets}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 shadow-sm"
        >
          <Save className="w-5 h-5 mr-3" />
          <span className="text-base font-medium">Save All Changes</span>
        </button>
      </div>
    </div>
  );


  const renderProfile = () => (
    <div className="space-y-6 md:space-y-8 relative z-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Farmer Profile</h2>
        <button
          onClick={isProfileEditing ? handleProfileSave : () => setIsProfileEditing(true)}
          className="flex items-center justify-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl md:rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg text-sm md:text-base"
        >
          {isProfileEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {isProfileEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/40 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-6">
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
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
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2">Farm & Soil Details</h3>
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
            <ProfileInput
              label="Expected Yield (Quintals)"
              name="yieldQuintal"
              type="number"
              value={farmerData?.yieldQuintal || ''}
              onChange={setFarmerData}
              disabled={!isProfileEditing}
            />
          </div>
        </div>
      </div>

      {/* Current Location Display */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/40 shadow-lg">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Current Location</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3">
            <div className="flex items-center flex-wrap">
              <MapPin className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
              <span className="font-medium text-gray-700 mr-2">Location:</span>
              <span className="text-gray-600 break-all">{getDisplayLocation()}</span>
            </div>
            {locationInfo && (
              <>
                <div className="flex items-center flex-wrap">
                  <Navigation className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-700 mr-2">GPS Coordinates:</span>
                  <span className="text-gray-600 text-sm break-all">
                    {locationInfo.latitude?.toFixed(6)}, {locationInfo.longitude?.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Full Address:</span>
                </div>
                <p className="text-sm text-gray-600 ml-7 bg-gray-50 p-2 rounded break-words">
                  {locationInfo.fullAddress}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleRefreshLocation}
              disabled={isRefreshing}
              className="flex items-center justify-center w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl md:rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg disabled:opacity-50 text-sm md:text-base"
            >
              {isRefreshing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Location
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Location Input */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/40 shadow-lg">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Manual Location Input</h3>
        <p className="text-gray-600 mb-4 text-sm md:text-base">Enter your location manually if automatic detection fails.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={manualLocation.city}
              onChange={(e) => setManualLocation(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/60 backdrop-blur-md border rounded-lg md:rounded-xl border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={manualLocation.state}
              onChange={(e) => setManualLocation(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/60 backdrop-blur-md border rounded-lg md:rounded-xl border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Enter state"
            />
          </div>
        </div>
        <button
          onClick={handleManualLocationSave}
          disabled={!manualLocation.city || !manualLocation.state}
          className="mt-4 md:mt-6 flex items-center justify-center w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl md:rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50 text-sm md:text-base"
        >
          <Map className="w-4 h-4 mr-2" />
          Save Location
        </button>
      </div>
    </div>
  );

  const ProfileInput = ({ label, name, value, onChange, disabled, type = 'text' }) => (
    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(prev => ({ ...prev, [name]: e.target.value }))}
        disabled={disabled}
        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-white/60 backdrop-blur-md border rounded-lg md:rounded-xl transition-all duration-300 text-sm md:text-base ${!disabled
          ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex" style={{ backgroundColor: '#F0F4FA' }}>
        {/* Enhanced Notifications */}
        {notification && (
          <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 p-4 rounded-xl md:rounded-2xl shadow-xl text-white z-50 transform transition-all duration-300 ${notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
            notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              'bg-gradient-to-r from-yellow-500 to-yellow-600'
            }`}>
            <div className="flex items-center">
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {notification.type === 'error' && <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />}
              <span className="text-sm md:text-base">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Enhanced Mobile-Responsive Sidebar */}
        <aside className={`fixed md:relative z-40 h-full bg-white/80 backdrop-blur-md border-r border-white/40 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
          }`}>
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-white/30">
            <div className={`flex items-center ${!sidebarOpen && 'md:justify-center md:w-full'}`}>
              <Sprout className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="text-lg md:text-2xl font-bold text-gray-800 ml-2">AgriSense</span>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-4 md:mt-8 px-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-3 md:px-6 py-3 md:py-4 mb-1 text-left rounded-xl transition-all duration-200 group ${activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border-r-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-800'
                  } ${(!sidebarOpen && !isMobile) && 'md:justify-center'}`}
              >
                <div className={`${activeTab === item.id ? item.color : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {item.icon}
                </div>
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3 md:ml-4 font-medium text-sm md:text-base">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Enhanced Mobile Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/40 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <button
                data-sidebar-toggle
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-white/60 transition-colors"
              >
                {sidebarOpen && !isMobile ?
                  <X className="w-5 h-5 md:w-6 md:h-6 text-gray-700" /> :
                  <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                }
              </button>

              <div className="flex items-center space-x-2 md:space-x-6">
                {/* Location display */}
                <div className="hidden sm:flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  <span className="font-medium text-xs md:text-sm mr-1 md:mr-2 truncate max-w-32 md:max-w-none">
                    {getDisplayLocation()}
                  </span>
                  <button
                    onClick={handleRefreshLocation}
                    disabled={isRefreshing}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Refresh location"
                  >
                    <RefreshCw className={`w-3 h-3 md:w-5 md:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-white/60 transition-colors">
                  <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center focus:outline-none p-1 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm md:text-base shadow-lg">
                      {farmerData?.farmerName?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-2 md:ml-3 text-left hidden sm:block">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">
                        {farmerData?.farmerName || 'User'}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {farmerData?.role || 'Farmer'}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''
                      }`} />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl py-2 z-50 border border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600 text-sm md:text-base"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile location display */}
            <div className="sm:hidden mt-3 flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="font-medium text-sm truncate">
                {getDisplayLocation()}
              </span>
              <button
                onClick={handleRefreshLocation}
                disabled={isRefreshing}
                className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh location"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {renderContent()}
          </div>

          {/* VoiceAssistantUI Chat Overlay */}
          {showChat && (
            <VoiceAssistantUI onClose={() => setShowChat(false)} />
          )}
          
          {/* ADD THIS: Render the Prediction Modal */}
          <PredictionModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title={modalTitle}
              data={modalData}
              isLoading={isModelLoading}
          />

          {/* ADD THIS: The floating button to open the chat */}
          <div className="fixed bottom-8 right-8 z-40">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-blue-600 text-white rounded-3xl p-5 shadow-lg border border-white/30 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
              aria-label="Open Chat Assistant"
            >
              <Bot className="w-8 h-8" />
            </button>
          </div>

          {/* ADD THIS: The modal container for the chat component */}
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
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default AgriSenseDashboard;