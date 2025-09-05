// AgriSenseDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Smartphone, Monitor, Tablet, MessageCircle // Added MessageCircle import
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
      <div className={`group relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-[1.02] ${device.isActive
        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-lg shadow-emerald-100/50'
        : 'bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-gray-200 shadow-md opacity-75'
        }`}>
        {/* Status indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${device.isActive ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'
          }`} />

        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 ${device.isActive
                ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                : 'bg-gray-100 text-gray-500'
                }`}>
                {getDeviceIcon(category)}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-medium tracking-wide uppercase ${device.isActive ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                  {category.slice(0, -1)}
                </span>
                <div className={`flex items-center space-x-1 md:space-x-2 mt-1 ${device.isActive ? 'text-emerald-700' : 'text-gray-600'
                  }`}>
                  {device.isActive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span className="text-xs font-semibold">
                    {device.isActive ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <button
                onClick={() => onToggleStatus(category, device.id)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${device.isActive
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                title={device.isActive ? 'Turn off device' : 'Turn on device'}
              >
                {device.isActive ? <Power className="w-3 h-3 md:w-4 md:h-4" /> : <PowerOff className="w-3 h-3 md:w-4 md:h-4" />}
              </button>
              <button
                onClick={() => onRemove(category, device.id)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 hover:scale-110"
                title="Remove device"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* Device name selector */}
          <div className="mb-3 md:mb-4">
            <select
              value={device.name}
              onChange={(e) => onUpdateName(category, device.id, e.target.value)}
              className={`w-full text-xs md:text-sm font-semibold bg-transparent border-none outline-none cursor-pointer p-2 rounded-lg transition-colors ${device.isActive
                ? 'text-gray-800 hover:bg-emerald-50'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {deviceTemplates[category].map(template => (
                <option key={template} value={template}>{template}</option>
              ))}
            </select>
          </div>

          {/* Status info */}
          <div className={`text-xs space-y-1 ${device.isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="font-semibold">{device.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Updated:</span>
              <span className="font-mono text-xs">{new Date(device.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Signal indicator */}
          <div className="mt-3 md:mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Signal className={`w-3 h-3 md:w-4 md:h-4 ${device.isActive ? 'text-emerald-500' : 'text-gray-400'}`} />
              <span className="text-xs text-gray-600">Signal</span>
            </div>
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${device.isActive && i < 3 ? 'bg-emerald-400' : 'bg-gray-300'
                    }`}
                  style={{ height: `${4 + i * 2}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/40 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {farmerData?.farmerName || 'User'}! 🌾
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Your farm in {getDisplayLocation()} is performing well.
            </p>
            {locationInfo && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Navigation className="w-4 h-4 mr-1" />
                <span className="truncate">GPS: {locationInfo.latitude?.toFixed(4)}, {locationInfo.longitude?.toFixed(4)}</span>
              </div>
            )}
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500">Current Season</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {farmerData?.season || 'N/A'} {farmerData?.year || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Farm Area"
          value={farmerData?.areaHectare || 'N/A'}
          unit="hectares"
          icon={<Leaf className="w-4 h-4 md:w-6 md:h-6 text-white" />}
          color="green"
        />
        <StatCard
          title="Expected Yield"
          value={farmerData?.yieldQuintal || 'N/A'}
          unit="quintals"
          icon={<TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />}
          trend={8.5}
          color="blue"
        />
        <StatCard
          title="Soil pH"
          value={farmerData?.ph || 'N/A'}
          icon={<TestTube className="w-4 h-4 md:w-6 md:h-6 text-white" />}
          color="purple"
        />
        <StatCard
          title="Current Temp"
          value={farmerData?.temperature ? `${farmerData.temperature}°C` : 'N/A'}
          icon={<Thermometer className="w-4 h-4 md:w-6 md:h-6 text-white" />}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Recommended Crops</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.cropRecommendations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="crop" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              <Bar dataKey="suitability" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Weather Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData.weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="rainfall" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {/* Chat Icon Below Weather Trends */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-blue-600 rounded-full p-3 shadow-lg hover:bg-blue-700 transition"
              onClick={() => setShowChat(true)}
              title="Open Chat"
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCropAnalysis = () => (
    <div className="space-y-6 md:space-y-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Crop Analysis & Recommendations</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Crop Suitability Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dashboardData.cropRecommendations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis dataKey="crop" type="category" width={isMobile ? 60 : 80} tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              <Bar dataKey="suitability" name="Suitability (%)" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="expectedYield" name="Yield (quintals)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Yield Trends (Quintals)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dashboardData.yieldComparison}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="year" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="predicted" stroke="#10b981" fillOpacity={1} fill="url(#colorPredicted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Crop Area Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ crop, area }) => isMobile ? `${area}ha` : `${crop}: ${area}ha`}
                outerRadius={isMobile ? 80 : 100}
                fill="#8884d8"
                dataKey="area"
              >
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-3 md:space-y-4">
            {cropDistribution.map((crop, index) => (
              <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-white/50 rounded-xl md:rounded-2xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-2 md:mr-3" style={{ backgroundColor: crop.color }}></div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">{crop.crop}</span>
                </div>
                <span className="text-gray-600 text-sm md:text-base">{crop.area} hectares</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSoilHealth = () => (
    <div className="space-y-6 md:space-y-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Soil Health Analysis</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Soil Nutrients (kg/ha)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={soilNutrients}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="nutrient" tick={{ fontSize: isMobile ? 8 : 10 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              <Bar dataKey="value" name="Current" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimal" name="Optimal" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Overall Soil Health</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={soilHealthRadar}>
              <PolarGrid stroke="#e0e4e7" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <PolarRadiusAxis tick={{ fontSize: isMobile ? 8 : 10 }} />
              <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-6 md:space-y-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Weather Forecast & History</h2>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Annual Weather Patterns</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={dashboardData.weatherData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight' }} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                border: 'none',
                fontSize: isMobile ? '12px' : '14px'
              }}
            />
            <Bar yAxisId="right" dataKey="rainfall" barSize={isMobile ? 15 : 20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={isMobile ? 2 : 3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 md:space-y-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Advanced Analytics</h2>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/40 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Profitability Analysis</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis type="number" dataKey="suitability" name="Suitability" unit="%" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis type="number" dataKey="profitability" name="Profitability" unit="%" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                border: 'none',
                fontSize: isMobile ? '12px' : '14px'
              }}
            />
            <Scatter name="Crops" data={dashboardData.cropRecommendations} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Enhanced Settings render function with full responsive design
  const renderSettings = () => {
    const categoryConfig = {
      sensors: {
        title: 'IoT Sensors',
        icon: '📡',
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-600',
        description: 'Smart sensors for monitoring soil, weather, and crop conditions'
      },
      cameras: {
        title: 'Surveillance Cameras',
        icon: '📹',
        color: 'green',
        gradient: 'from-green-500 to-emerald-600',
        description: 'Security and monitoring cameras for farm surveillance'
      },
      drones: {
        title: 'Agricultural Drones',
        icon: '🚁',
        color: 'purple',
        gradient: 'from-purple-500 to-indigo-600',
        description: 'Autonomous drones for aerial monitoring and crop analysis'
      }
    };

    return (
      <div className="space-y-6 md:space-y-10">
        {/* Header section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Farm Assets Management</h2>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
            Monitor and manage your farm's smart devices, sensors, and equipment all in one place.
          </p>
        </div>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {Object.entries(assets).map(([category, devices]) => {
            const config = categoryConfig[category];
            const activeCount = devices.filter(device => device.isActive).length;
            const totalCount = devices.length;
            const percentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

            return (
              <div key={category} className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-white/60 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative p-4 md:p-8">
                  {/* Icon and title */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="text-2xl md:text-4xl">{config.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm md:text-lg">{config.title}</h3>
                        <p className="text-gray-500 text-xs md:text-sm mt-1 hidden sm:block">{config.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Total Devices</span>
                      <span className="text-xl md:text-2xl font-bold text-gray-800">{totalCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Active Devices</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl md:text-2xl font-bold text-emerald-600">{activeCount}</span>
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${activeCount > 0 ? 'bg-emerald-400' : 'bg-gray-300'} animate-pulse`} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-gray-600">Uptime</span>
                        <span className="font-semibold text-gray-700">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Device Management Sections */}
        {Object.entries(assets).map(([category, devices]) => {
          const config = categoryConfig[category];
          return (
            <div key={category} className="bg-white/50 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/40 shadow-lg overflow-hidden">
              {/* Section header */}
              <div className={`bg-gradient-to-r ${config.gradient} p-4 md:p-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="text-2xl md:text-3xl">{config.icon}</div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">{config.title}</h3>
                      <p className="text-white/80 text-sm md:text-base hidden sm:block">{config.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addDevice(category)}
                    className="flex items-center justify-center px-4 md:px-6 py-2 md:py-3 bg-white/20 backdrop-blur-md text-white rounded-xl md:rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105 text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="hidden sm:inline">Add {config.title.split(' ')[0]}</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>

              {/* Device grid */}
              <div className="p-4 md:p-8">
                {devices.length === 0 ? (
                  <div className="text-center py-12 md:py-16">
                    <div className="text-4xl md:text-6xl mb-4">{config.icon}</div>
                    <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No {config.title} Added</h4>
                    <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base">Get started by adding your first {category.slice(0, -1)} to monitor your farm.</p>
                    <button
                      onClick={() => addDevice(category)}
                      className={`inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r ${config.gradient} text-white rounded-xl md:rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm md:text-base`}
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Add {config.title.split(' ')[0]}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                    {devices.map(device => (
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
            </div>
          );
        })}

        {/* Save section */}
        <div className="flex justify-center pt-4 md:pt-8">
          <button
            onClick={saveAssets}
            className="group flex items-center px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl md:rounded-3xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Save className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-base md:text-lg font-semibold">Save All Changes</span>
          </button>
        </div>
      </div>
    );
  };

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
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default AgriSenseDashboard;
