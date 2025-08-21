import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { 
  Sprout, CloudRain, Thermometer, Droplets, TestTube,
  TrendingUp, Calendar, MapPin, Settings, Bell, User, Home,
  BarChart3, Leaf, Sun, Menu, X, Plus, Edit, Save, AlertTriangle, Loader, RefreshCw, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // For logout redirect

const AgriSenseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [farmerData, setFarmerData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    cropRecommendations: [],
    weatherData: [],
    yieldComparison: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCity, setCurrentCity] = useState(''); // State for current city
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // State for profile dropdown
  const navigate = useNavigate();

  // Fetch geolocation and dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get geolocation
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/farmer/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: localStorage.getItem('email'), // Assume email is stored on login
            password: '', // Password not needed for dashboard fetch
            latitude,
            longitude
          })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setFarmerData(data.farmerData || {});
        setCurrentCity(data.city || 'Unknown');
        setDashboardData({
          cropRecommendations: data.cropRecommendations,
          weatherData: data.weatherData,
          yieldComparison: data.yieldComparison,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh location
  const handleRefreshLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/farmer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: localStorage.getItem('email'),
          password: '',
          latitude,
          longitude
        })
      });
      if (!response.ok) {
        throw new Error('Failed to refresh location');
      }
      const data = await response.json();
      setCurrentCity(data.city || 'Unknown');
      setFarmerData(data.farmerData || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileSave = async () => {
    setIsProfileEditing(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/farmer/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(farmerData)
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const updatedData = await response.json();
      setFarmerData(updatedData.farmer);
    } catch (err) {
      setError(err.message);
    }
  };

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
      </div>
    );
  }

  // Derived data for charts once farmerData is available
  const soilNutrients = farmerData ? [
    { nutrient: 'Nitrogen (N)', value: farmerData.N, optimal: 80, unit: 'kg/ha' },
    { nutrient: 'Phosphorus (P)', value: farmerData.P, optimal: 40, unit: 'kg/ha' },
    { nutrient: 'Potassium (K)', value: farmerData.K, optimal: 50, unit: 'kg/ha' }
  ] : [];

  const soilHealthRadar = farmerData ? [
    { subject: 'pH Level', A: (farmerData.ph / 14) * 100, fullMark: 100 },
    { subject: 'Nitrogen', A: (farmerData.N / 120) * 100, fullMark: 100 },
    { subject: 'Phosphorus', A: (farmerData.P / 60) * 100, fullMark: 100 },
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {farmerData.farmerName}! 🌾</h1>
            <p className="text-gray-600 text-lg">Your farm in {currentCity} is performing well.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Season</p>
            <p className="text-2xl font-bold text-gray-800">{farmerData.season} {farmerData.year}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Farm Area" 
          value={farmerData.areaHectare} 
          unit="hectares" 
          icon={<Leaf className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatCard 
          title="Expected Yield" 
          value={farmerData.yieldQuintal} 
          unit="quintals" 
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          trend={8.5}
          color="blue"
        />
        <StatCard 
          title="Soil pH" 
          value={farmerData.ph} 
          icon={<TestTube className="w-6 h-6 text-white" />}
          color="purple"
        />
        <StatCard 
          title="Current Temp" 
          value={`${farmerData.temperature}°C`} 
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

  // ... (Other render functions like renderCropAnalysis, renderSoilHealth, etc., remain unchanged)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex" style={{backgroundColor: '#F0F4FA'}}>
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
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">{currentCity}</span>
              <button 
                onClick={handleRefreshLocation}
                className="p-2 rounded-full hover:bg-white/50"
                title="Refresh Location"
              >
                <RefreshCw className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <button className="relative p-2 rounded-full hover:bg-white/50">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center"
              >
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                  {farmerData.farmerName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">{farmerData.farmerName}</p>
                  <p className="text-sm text-gray-500">{farmerData.role || 'Farmer'}</p>
                </div>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/30 z-10">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-100/50 rounded-t-xl"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-100/50 rounded-b-xl"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AgriSenseDashboard;