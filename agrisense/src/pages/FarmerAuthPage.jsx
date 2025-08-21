import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  Eye, 
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  Wind,
  Thermometer,
  Droplets,
  TestTube2,
  CloudRain,
  Tractor
} from 'lucide-react';

const FarmerAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Expanded formData state to include all schema fields
  const [formData, setFormData] = useState({
    farmerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    crop: '',
    season: '',
    year: '',
    areaHectare: '',
    yieldQuintal: '',
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsVisible(true);
    // Request location when component mounts for signup
    if (!isLogin) {
      requestLocation();
    }
  }, [isLogin]);

  const requestLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        // Simulate reverse geocoding API call
        // In a real implementation, you'd use Google Maps API or similar
        setTimeout(() => {
          const mockStates = ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Gujarat'];
          const mockDistricts = ['Mumbai', 'Ludhiana', 'Lucknow', 'Bangalore', 'Chennai', 'Ahmedabad'];
          
          const randomState = mockStates[Math.floor(Math.random() * mockStates.length)];
          const randomDistrict = mockDistricts[Math.floor(Math.random() * mockDistricts.length)];
          
          setFormData(prev => ({
            ...prev,
            state: randomState,
            district: randomDistrict
          }));
          
          setLocationDetected(true);
          setLocationLoading(false);
        }, 2000);

      } catch (error) {
        console.error("Location access denied:", error);
        setLocationError('Location access denied. Please enter manually.');
        setLocationLoading(false);
      }
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      console.log("Geolocation not supported");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      // Signup validation (only for mandatory fields)
      if (!formData.farmerName.trim()) {
        newErrors.farmerName = 'Farmer name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Login validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const endpoint = isLogin ? '/farmer/login' : '/farmer/signup';
      
      // Construct payload based on login or signup
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            farmerName: formData.farmerName,
            email: formData.email, 
            password: formData.password,
            state: formData.state,
            district: formData.district,
            // Include optional fields, converting numbers where appropriate
            crop: formData.crop || undefined,
            season: formData.season || undefined,
            year: formData.year ? Number(formData.year) : undefined,
            areaHectare: formData.areaHectare ? Number(formData.areaHectare) : undefined,
            yieldQuintal: formData.yieldQuintal ? Number(formData.yieldQuintal) : undefined,
            N: formData.N ? Number(formData.N) : undefined,
            P: formData.P ? Number(formData.P) : undefined,
            K: formData.K ? Number(formData.K) : undefined,
            temperature: formData.temperature ? Number(formData.temperature) : undefined,
            humidity: formData.humidity ? Number(formData.humidity) : undefined,
            ph: formData.ph ? Number(formData.ph) : undefined,
            rainfall: formData.rainfall ? Number(formData.rainfall) : undefined,
          };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
          const errorText = await response.text();
          console.error("Server Error Response:", errorText);
          throw new Error(response.status === 500 ? 'Server error, please try again later.' : 'An unexpected error occurred.');
      }

      const data = await response.json();
      
      if (isLogin) {
        // Store JWT token
        localStorage.setItem('token', data.token);
        localStorage.setItem('farmerId', data.farmerId);
      }
      console.log('Success:', data);
      // Redirect to dashboard or show success message
      // window.location.href = '/dashboard';

    } catch (error) {
      console.error('API Error:', error);
      setErrors({ submit: error.message || 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset all form data when toggling
    setFormData({
        farmerName: '', email: '', password: '', confirmPassword: '',
        state: '', district: '', crop: '', season: '', year: '',
        areaHectare: '', yieldQuintal: '', N: '', P: '', K: '',
        temperature: '', humidity: '', ph: '', rainfall: '',
    });
    setErrors({});
  };

  // Helper component for optional input fields
  const OptionalInput = ({ name, type = 'text', placeholder, icon }) => (
    <div className="relative">
      {icon && React.cloneElement(icon, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" })}
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-3 text-sm backdrop-blur-md bg-white/50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 border-white/40"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4" style={{backgroundColor: '#F0F4FA'}}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      {/* Back to Home Button */}
      <button 
        onClick={() => window.history.back()}
        className={`fixed top-6 left-6 z-50 backdrop-blur-md bg-white/30 text-gray-700 p-3 rounded-2xl border border-white/40 hover:bg-white/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Main Auth Card */}
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-2xl">
                <Sprout className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join AgniSense'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your farming dashboard' : 'Start your smart farming journey'}
            </p>
          </div>

          {/* Location Detection for Signup */}
          {!isLogin && (
            <div className="mb-6 p-4 backdrop-blur-md bg-blue-50/50 rounded-2xl border border-blue-200/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Location Detection</span>
                </div>
                {locationLoading && <Loader className="w-4 h-4 text-blue-600 animate-spin" />}
                {locationDetected && <CheckCircle className="w-4 h-4 text-green-600" />}
                {locationError && <AlertCircle className="w-4 h-4 text-red-600" />}
              </div>
              {locationLoading && (
                <p className="text-xs text-gray-600">Detecting your location for better recommendations...</p>
              )}
              {locationDetected && (
                <p className="text-xs text-green-700">Location detected: {formData.state}, {formData.district}</p>
              )}
              {locationError && (
                <p className="text-xs text-red-700">{locationError}</p>
              )}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Farmer Name - Signup Only */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="farmerName"
                    value={formData.farmerName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className={`w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 ${errors.farmerName ? 'border-red-400' : 'border-white/40'}`}
                  />
                </div>
                {errors.farmerName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.farmerName}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className={`w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 ${errors.email ? 'border-red-400' : 'border-white/40'}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={`w-full pl-12 pr-12 py-4 backdrop-blur-md bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 ${errors.password ? 'border-red-400' : 'border-white/40'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Signup Only */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className={`w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 ${errors.confirmPassword ? 'border-red-400' : 'border-white/40'}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Optional Farm Details - Signup Only */}
            {!isLogin && (
              <div className="p-4 backdrop-blur-md bg-green-50/50 rounded-2xl border border-green-200/50 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 text-center">Optional Farm Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <OptionalInput name="crop" placeholder="Crop (e.g., Wheat)" icon={<Sprout />} />
                  <OptionalInput name="season" placeholder="Season (e.g., Rabi)" icon={<Wind />} />
                  <OptionalInput name="year" type="number" placeholder="Year" icon={<Tractor />} />
                  <OptionalInput name="areaHectare" type="number" placeholder="Area (Hectare)" icon={<MapPin />} />
                  <OptionalInput name="yieldQuintal" type="number" placeholder="Yield (Quintal)" icon={<Tractor />} />
                  <OptionalInput name="N" type="number" placeholder="Nitrogen (N)" icon={<TestTube2 />} />
                  <OptionalInput name="P" type="number" placeholder="Phosphorus (P)" icon={<TestTube2 />} />
                  <OptionalInput name="K" type="number" placeholder="Potassium (K)" icon={<TestTube2 />} />
                  <OptionalInput name="temperature" type="number" placeholder="Temperature (°C)" icon={<Thermometer />} />
                  <OptionalInput name="humidity" type="number" placeholder="Humidity (%)" icon={<Droplets />} />
                  <OptionalInput name="ph" type="number" placeholder="Soil pH" icon={<TestTube2 />} />
                  <OptionalInput name="rainfall" type="number" placeholder="Rainfall (mm)" icon={<CloudRain />} />
                </div>
              </div>
            )}

            {/* API Error Display */}
            {errors.submit && (
              <div className="p-4 backdrop-blur-md bg-red-50/50 rounded-2xl border border-red-200/50">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-700">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </button>
            </p>
          </div>

          {/* Forgot Password - Login Only */}
          {isLogin && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-gray-500 text-sm hover:text-blue-600 transition-colors duration-300"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerAuthPage;
