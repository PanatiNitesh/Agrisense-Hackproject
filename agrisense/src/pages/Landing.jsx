import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sprout, 
  BarChart3, 
  Users, 
  ChevronRight, 
  Star,
  ArrowRight,
  Leaf,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CropLandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <CloudSun className="w-8 h-8 text-blue-600" />,
      title: "Weather & Soil Analysis",
      description: "Advanced analysis of weather patterns and soil conditions for optimal crop selection"
    },
    {
      icon: <Sprout className="w-8 h-8 text-green-600" />,
      title: "Smart Crop Prediction",
      description: "AI-powered recommendations based on multiple environmental factors"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Easy Farmer Dashboard",
      description: "Simple, intuitive interface designed specifically for farmers"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Data-Driven Insights",
      description: "Real-time analytics and historical data for informed decision making"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Enter Details",
      description: "Input your soil conditions, weather data, and regional information"
    },
    {
      number: "02", 
      title: "AI Processing",
      description: "Our machine learning models analyze your data in real-time"
    },
    {
      number: "03",
      title: "Get Recommendations",
      description: "Receive personalized crop suggestions with yield predictions"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Punjab, India",
      quote: "Increased my wheat yield by 25% using AI recommendations. Game changer for small farmers like me!",
      rating: 5,
      image: "👨‍🌾"
    },
    {
      name: "Priya Sharma",
      location: "Maharashtra, India", 
      quote: "The soil analysis feature helped me switch to more profitable crops. Highly recommended!",
      rating: 5,
      image: "👩‍🌾"
    },
    {
      name: "Arjun Patel",
      location: "Gujarat, India",
      quote: "Simple interface, powerful insights. Perfect tool for modern farming practices.",
      rating: 5,
      image: "👨‍🌾"
    }
  ];

  const stats = [
    { number: "20%", label: "Higher Yield", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "5,000+", label: "Trusted Farmers", icon: <Users className="w-6 h-6" /> },
    { number: "95%", label: "Accuracy Rate", icon: <Shield className="w-6 h-6" /> },
    { number: "50+", label: "Crop Types", icon: <Leaf className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{backgroundColor: '#F0F4FA'}}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="backdrop-blur-md bg-white/30 border-b border-white/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sprout className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-800">AgriSense</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">How It Works</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">Reviews</a>
                
                <Link to="/auth">
                  <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-32 pb-20 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              AI-Powered Crop 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Recommendation</span>
              <br />for Smarter Farming
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              Get personalized crop suggestions based on your soil, weather, and region.
              <br />Transform your farming with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/auth">
                <button className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
              <button className="group backdrop-blur-md bg-white/30 text-gray-800 px-10 py-4 rounded-2xl text-lg font-semibold border border-white/40 hover:bg-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center">
                Try Demo
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="backdrop-blur-md bg-white/40 rounded-3xl p-6 text-center border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-driven platform combines cutting-edge technology with agricultural expertise
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:bg-white/50">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-r from-blue-50/50 to-green-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to revolutionize your farming decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="backdrop-blur-md bg-white/50 rounded-3xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-6xl font-bold text-blue-600/20 mb-4">{step.number}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-600/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Farmer Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real farmers, real results with our AI-powered recommendations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Start Your Journey Toward Smart Farming Today
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of farmers who have transformed their yields with AI-powered crop recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/auth">
                <button className="group bg-white text-blue-600 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:scale-105 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
              <button className="group backdrop-blur-md bg-white/20 text-white px-10 py-4 rounded-2xl text-lg font-bold border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center">
                Contact Sales
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 backdrop-blur-md bg-gray-900/90 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold">AgriSense</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering farmers with AI-driven crop recommendations for sustainable and profitable agriculture.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AgriSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CropLandingPage;