# 🌾 AgriSense - AI-Powered Smart Farming Platform

<p align="center">
  <img src="https://github.com/user-attachments/assets/4dd9ff9d-1c21-4ab2-acc7-b0336b402496" alt="Image" height="700" width="900"  />
</p>


**Empowering farmers with intelligent crop recommendations and data-driven agricultural insights**

AgriSense is a comprehensive smart farming platform that leverages artificial intelligence to provide personalized crop recommendations, yield predictions, weather analysis, and agricultural guidance to farmers. Built for the **OpenAI Open Model Hackathon**, this project combines modern web technologies with machine learning to revolutionize farming decisions.


---

## 📋 Table of Contents
- [Live Preview](https://agrisense-farm.netlify.app/)
- [Demo Video](https://youtu.be/dSVwhZeP4B4)
- [🏗️ Project Architecture](#️-project-architecture)
- [✨ Features](#-features)
- [🚀 Installation Guide](#-installation-guide)
- [📖 Usage](#-usage)
- [⚙️ Configuration](#️-configuration)
- [👥 Contributors](#-contributors)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 🏗️ Project Architecture

AgriSense follows a modern microservices architecture with three main components:

<p align="center">
  <img src="https://github.com/user-attachments/assets/f03197b1-8025-400c-8f12-8caa73293ce3" alt="Image" height="700" width="900"  />
</p>

### Component Breakdown:

- **Frontend (`agrisense/`)**: React.js application with modern UI/UX for farmer interactions
- **Backend (`backend/`)**: Node.js/Express.js API server handling authentication, data management, and external integrations
- **LLM-Model**: Python-based AI service providing crop recommendations, yield predictions, and plant disease detection

---

## ✨ Features

### 🌱 Core Agricultural Features
- **AI-Powered Crop Recommendations** - Get personalized crop suggestions based on soil, weather, and regional data
- **Yield Prediction** - Forecast crop yields using machine learning models
- **Weather & Soil Analysis** - Real-time weather data integration and soil health monitoring
- **Plant Disease Detection** - Upload images to identify plant diseases and get treatment recommendations

### 📊 Smart Dashboard
- **Farmer Dashboard** - Comprehensive overview of farm data, weather, and recommendations
- **Asset Management** - Track and manage farm equipment, sensors, cameras, and drones
- **Interactive Analytics** - Visualize soil health, weather patterns, and yield comparisons
- **Market Price Integration** - Real-time crop price data from Indian agricultural markets

### 🤖 AI Assistant
- **Intelligent Chat Bot** - Get instant answers to farming questions using AI
- **Voice Query Support** - Voice-enabled agricultural assistance
- **Multi-language Support** - Available in English, Hindi, and Kannada
- **Financial Advice** - AI-generated financial tips and government scheme recommendations

### 🔐 User Management
- **Secure Authentication** - JWT-based login system
- **Location Services** - Automatic location detection for personalized recommendations
- **Profile Management** - Comprehensive farmer profile with agricultural data

---

## 🚀 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

### 🛠️ Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PanatiNitesh/Agrisense-Hackproject.git
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

### 🎨 Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd agrisense
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

### 🧠 AI Model Setup

1. **Navigate to LLM-Model directory**
   ```bash
   cd LLM-Model
   pip install -r requirements.txt
   ```

2. **Configure Python environment**
   ```bash
   cp .env.example .env
   # Edit .env with your HuggingFace tokens and model configurations
   ```

---

## 📖 Usage

### Running the Development Environment

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start the Frontend Application**
   ```bash
   cd agrisense
   npm run dev
   # App runs on http://localhost:5173
   ```

3. **Start the AI Model Service**
   ```bash
   cd LLM-Model
   python -m uvicorn app:app --reload --port 8000
   # AI service runs on http://localhost:8000
   ```

### Available Scripts

#### Backend Scripts
```bash
npm run dev          # Start development server
npm start           # Start production server
npm run test        # Run tests
```

#### Frontend Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Using the Application

1. **Registration/Login**: Create a farmer account or log in to existing account
2. **Location Setup**: Allow location access for personalized recommendations
3. **Profile Configuration**: Add your farm details, soil data, and crop preferences
4. **Dashboard Navigation**: Explore weather data, soil health, and crop recommendations
5. **AI Features**: Use the chat assistant, upload plant images for disease detection
6. **Asset Management**: Add and track your farming equipment and sensors

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/agrisense

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# External APIs
WEATHERAPI_COM_KEY=your-weather-api-key
HF_TOKEN=your-huggingface-token
UNSPLASH_ACCESS_KEY=your-unsplash-key
AGMARKNET_API_KEY=your-agmarknet-key

# Services
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173

# Server
PORT=5000
```

#### Frontend (.env.local)
```env
VITE_BACK_URI=http://localhost:5000
```

#### Python AI Service (.env)
```env
HF_TOKEN=your-huggingface-token
OPENAI_API_KEY=your-openai-key
MODEL_CACHE_DIR=./models
```

### External API Keys Required

- **WeatherAPI.com**: For real-time weather data
- **HuggingFace**: For AI model access
- **Unsplash**: For agricultural imagery
- **Agmarknet**: For Indian crop price data
- **OpenAI**: For advanced language model features

---

## 👥 Contributors

We're grateful to the amazing team that made AgriSense possible:

<div align="center">

| # | Avatar | Contributor | Role | GitHub Profile |
|---|--------|------------|------|----------------|
| 1 | <img src="https://avatars.githubusercontent.com/u/149950829?v=4" width="60" height="60" style="border-radius: 50%;"> | **Ravindra** | Full Stack Developer & AI Integration | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ravindraogg) |
| 2 | <img src="https://avatars.githubusercontent.com/u/134051960?v=4" width="60" height="60" style="border-radius: 50%;"> | **Nitesh Panati** | Project Lead & Backend Architecture | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PanatiNitesh) |
| 3 | <img src="https://avatars.githubusercontent.com/u/144938646?v=4" width="60" height="60" style="border-radius: 50%;"> | **Pooja CG** | Frontend Development & UI/UX Design | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Pooja-CG) |

</div>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes and commit**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Areas for Contribution

- 🐛 Bug fixes and improvements
- 🌟 New agricultural features
- 📱 Mobile responsiveness improvements
- 🔧 Performance optimizations
- 📚 Documentation enhancements
- 🌍 Localization and translations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AgriSense Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Special Thanks

- **OpenAI** for organizing the Open Model Hackathon and providing the platform for innovation
- **HuggingFace** for providing access to state-of-the-art language models and AI infrastructure
- **Indian Government's Agmarknet** for agricultural market data
- **Our amazing development team** for their dedication and innovative contributions

### Technologies Used

- **Frontend**: React.js, Tailwind CSS, Vite, Lucide React
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **AI/ML**: Python, FastAPI, HuggingFace Transformers, OpenAI API
- **External APIs**: WeatherAPI, Agmarknet, Unsplash, Nominatim
- **DevOps**: Docker, PM2, Nginx

---

<div align="center">

**⭐ If you found this project helpful, please consider giving it a star!**

**🌾 Happy Farming with AI! 🤖**

---

**Built with ❤️ by the AgriSense Team**

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/PanatiNitesh/Agrisense-Hackproject)
[![OpenAI Hackathon](https://img.shields.io/badge/OpenAI-Hackathon-blue.svg)](https://openai.com)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green.svg)](https://huggingface.co)

</div>
