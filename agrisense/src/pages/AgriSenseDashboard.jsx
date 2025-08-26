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
  RefreshCw, LogOut, Map, Navigation, CheckCircle
} from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="ml-4 text-lg font-semibold text-red-700">
            An unexpected error occurred: {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AgriSenseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [manualLocation, setManualLocation] = useState({ city: '', state: '' });
  const [locationInfo, setLocationInfo] = useState(null);

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
          
          // Get location details
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
        // Load cached location info
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

      // Get coordinates for manual location
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
    fetchDashboardData(false); // use stored location if available
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'crops', label: 'Crop Analysis', icon: <Leaf className="w-5 h-5" /> },
    { id: 'weather', label: 'Weather', icon: <Sun className="w-5 h-5" /> },
    { id: 'soil', label: 'Soil Health', icon: <TestTube className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg font-semibold text-gray-700">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="ml-4 text-lg font-semibold text-red-700">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
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

  const StatCard = ({ title, value, unit, icon, trend, color = 'blue' }) => (
    <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-r from-${color}-500 to-${color}-600`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title} {unit && `(${unit})`}</p>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-3xl p-8 border border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {farmerData?.farmerName || 'User'}! 🌾
            </h1>
            <p className="text-gray-600 text-lg">
              Your farm in {getDisplayLocation()} is performing well.
            </p>
            {locationInfo && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Navigation className="w-4 h-4 mr-1" />
                <span>GPS: {locationInfo.latitude?.toFixed(4)}, {locationInfo.longitude?.toFixed(4)}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Season</p>
            <p className="text-2xl font-bold text-gray-800">
              {farmerData?.season || 'N/A'} {farmerData?.year || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Farm Area" 
          value={farmerData?.areaHectare || 'N/A'} 
          unit="hectares" 
          icon={<Leaf className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatCard 
          title="Expected Yield" 
          value={farmerData?.yieldQuintal || 'N/A'} 
          unit="quintals" 
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          trend={8.5}
          color="blue"
        />
        <StatCard 
          title="Soil pH" 
          value={farmerData?.ph || 'N/A'} 
          icon={<TestTube className="w-6 h-6 text-white" />}
          color="purple"
        />
        <StatCard 
          title="Current Temp" 
          value={farmerData?.temperature ? `${farmerData.temperature}°C` : 'N/A'} 
          icon={<Thermometer className="w-6 h-6 text-white" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Recommended Crops</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.cropRecommendations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="suitability" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Weather Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} />
              <Line type="monotone" dataKey="rainfall" stroke="#06b6d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderCropAnalysis = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Crop Analysis & Recommendations</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Crop Suitability Analysis</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dashboardData.cropRecommendations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="crop" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="suitability" name="Suitability (%)" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="expectedYield" name="Yield (quintals)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Yield Trends (Quintals)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dashboardData.yieldComparison}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }} 
              />
              <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="predicted" stroke="#10b981" fillOpacity={1} fill="url(#colorPredicted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Crop Area Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ crop, area }) => `${crop}: ${area}ha`}
                outerRadius={100}
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
          <div className="flex flex-col justify-center space-y-4">
            {cropDistribution.map((crop, index) => (
              <div key={index} className="flex items-center justify-between p-4 backdrop-blur-md bg-white/30 rounded-2xl">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: crop.color }}></div>
                  <span className="font-medium text-gray-700">{crop.crop}</span>
                </div>
                <span className="text-gray-600">{crop.area} hectares</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSoilHealth = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Soil Health Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Soil Nutrients (kg/ha)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={soilNutrients}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="nutrient" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="value" name="Current" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimal" name="Optimal" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Overall Soil Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={soilHealthRadar}>
              <PolarGrid stroke="#e0e4e7" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Weather Forecast & History</h2>
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Annual Weather Patterns</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={dashboardData.weatherData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight' }} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
            <Bar yAxisId="right" dataKey="rainfall" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
      <div className="backdrop-blur-md bg-white/40 rounded-3xl p-6 border border-white/30 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Profitability Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis type="number" dataKey="suitability" name="Suitability" unit="%" tick={{ fontSize: 12 }} />
            <YAxis type="number" dataKey="profitability" name="Profitability" unit="%" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
            <Scatter name="Crops" data={dashboardData.cropRecommendations} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Farmer Profile</h2>
        <button
          onClick={isProfileEditing ? handleProfileSave : () => setIsProfileEditing(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
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

      {/* Current Location Display */}
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
                    {locationInfo.latitude?.toFixed(6)}, {locationInfo.longitude?.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-700">Full Address:</span>
                </div>
                <p className="text-sm text-gray-600 ml-7 bg-gray-50 p-2 rounded">
                  {locationInfo.fullAddress}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleRefreshLocation}
              disabled={isRefreshing}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg disabled:opacity-50"
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
              className="w-full px-4 py-3 backdrop-blur-md border rounded-xl bg-white/50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={manualLocation.state}
              onChange={(e) => setManualLocation(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-4 py-3 backdrop-blur-md border rounded-xl bg-white/50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter state"
            />
          </div>
        </div>
        <button
          onClick={handleManualLocationSave}
          disabled={!manualLocation.city || !manualLocation.state}
          className="mt-6 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          <Map className="w-4 h-4 mr-2" />
          Save Location
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
        className={`w-full px-4 py-3 backdrop-blur-md border rounded-xl transition-all duration-300 ${
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
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex" style={{ backgroundColor: '#F0F4FA' }}>
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg text-white z-50 ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}>
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 inline mr-2" />}
            {notification.message}
          </div>
        )}
        
        <aside className={`bg-white/30 backdrop-blur-md border-r border-white/40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
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
                  onClick={handleRefreshLocation} 
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                    <button className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-600" /> Settings
                    </button>
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
      </div>
    </ErrorBoundary>
  );
};

export default AgriSenseDashboard;