import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
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
  Tractor,
  Map,
  Building
} from 'lucide-react';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

const FarmerAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // For user feedback
  
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
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      if (!formData.farmerName.trim()) newErrors.farmerName = 'Farmer name is required';
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
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.district.trim()) newErrors.district = 'District/City is required';

    } else {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
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
    setStatusMessage(isLogin ? 'Signing in...' : 'Creating account...');
    setErrors({});
    
    try {
      const endpoint = isLogin ? '/farmer/login' : '/farmer/signup';
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            farmerName: formData.farmerName,
            email: formData.email, 
            password: formData.password,
            state: formData.state,
            district: formData.district,
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }
      
      // Store token and farmerId
      localStorage.setItem('token', data.token);
      localStorage.setItem('farmerId', data.farmerId);

      setStatusMessage(isLogin ? 'Sign in successful! Redirecting...' : 'Account created! Redirecting...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('API Error:', error);
      setErrors({ submit: error.message || 'Network error. Please try again.' });
      setStatusMessage('');
    } finally {
      // Delay setting isLoading to false to allow redirection message to be seen
      if (!localStorage.getItem('token')) {
        setIsLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
        farmerName: '', email: '', password: '', confirmPassword: '',
        state: '', district: '', crop: '', season: '', year: '',
        areaHectare: '', yieldQuintal: '', N: '', P: '', K: '',
        temperature: '', humidity: '', ph: '', rainfall: '',
    });
    setErrors({});
    setStatusMessage('');
  };

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <button 
        onClick={() => window.history.back()}
        className={`fixed top-6 left-6 z-50 backdrop-blur-md bg-white/30 text-gray-700 p-3 rounded-2xl border border-white/40 hover:bg-white/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-2xl">
                <Sprout className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join AgriSense'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your farming dashboard' : 'Start your smart farming journey'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                {errors.farmerName && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.farmerName}</p>}
              </div>
            )}

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
              {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.email}</p>}
            </div>

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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.password}</p>}
            </div>

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
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.confirmPassword}</p>}
              </div>
            )}
            
            {!isLogin && (
              <>
                <div>
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 appearance-none ${errors.state ? 'border-red-400' : 'border-white/40'} ${formData.state ? 'text-gray-800' : 'text-gray-400'}`}
                    >
                      <option value="" disabled>Select your State</option>
                      {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  {errors.state && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.state}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="District / City"
                      className={`w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all duration-300 ${errors.district ? 'border-red-400' : 'border-white/40'}`}
                    />
                  </div>
                  {errors.district && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.district}</p>}
                </div>
              </>
            )}

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

            {(errors.submit || statusMessage) && (
              <div className={`p-4 backdrop-blur-md rounded-2xl border ${errors.submit ? 'bg-red-50/50 border-red-200/50' : 'bg-green-50/50 border-green-200/50'}`}>
                <div className="flex items-center">
                  {errors.submit ? <AlertCircle className="w-5 h-5 text-red-600 mr-2" /> : <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                  <span className={`text-sm ${errors.submit ? 'text-red-700' : 'text-green-700'}`}>{errors.submit || statusMessage}</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? (
                <><Loader className="w-5 h-5 mr-2 animate-spin" />{statusMessage}</>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={toggleMode} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300">
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="text-center mt-4">
              <button type="button" className="text-gray-500 text-sm hover:text-blue-600 transition-colors duration-300">
                Forgot your password?
              </button>
            </div>
          )}
        </div>

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