# 🌾 Prospera - Comprehensive Agriculture Platform

A full-featured agricultural management and marketplace platform connecting farmers, buyers, experts, and government organizations.

## 🚀 Features

### 1. Farm Management & Land Owner Portal
- Smart Crop Planner with AI recommendations
- Expense & Profit Tracking Dashboard
- Fertilizer & Water Schedule Generator
- Disease Alert System

### 2. Wholesale Market (Local + International)
- Live Commodity Price Tracking
- Verified Buyer System
- Smart Contract Export System

### 3. Agriculture Social Network (AgriLink)
- Knowledge Hub with articles, podcasts, videos
- Community Groups
- Ask Me Anything Sessions with experts
- Success Stories

### 4. Free Learning Portal
- Agriculture courses and certifications
- Career paths guidance
- Skill tests with leaderboards
- Multi-language support (English, Sinhala, Tamil)

### 5. AI Tools Lab
- Crop Disease Identifier
- Yield Prediction Tool
- Fertilizer Optimization Tool
- Market Price Prediction Model

### 6. International Marketplace
- Agricultural equipment and supplies
- 3D & AR view of equipment
- Seller ratings and verification
- Logistics integration

### 7. Government + NGO Collaboration Portal
- Government advisories
- Grant applications
- Subsidy announcements
- Crop insurance claims

### 8. Weather & Climate Portal
- Real-time weather updates
- 10-day agricultural forecast
- Monsoon, drought, and flood warnings
- Best planting date calculator

### 9. Farmers Community Support System
- 24/7 AI chatbot
- Volunteer expert network
- Emergency hotline

### 10. AgriFinTech
- Micro-loans for farmers
- Equipment leasing
- Crop insurance advisor
- Farm credit score system

## 🛠️ Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time features

### Frontend
- React.js
- React Router
- Axios for API calls
- Material-UI / Tailwind CSS

### AI/ML
- TensorFlow.js for disease detection
- Python microservices for predictions

### Additional Services
- Cloudinary for image storage
- Stripe for payments
- OpenWeather API
- Email notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/pamudithasandaru/Prospera.git
   cd Prospera
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
Prospera/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React Context
│   │   ├── utils/          # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   ├── config/             # Configuration files
│   └── index.js
├── models/                 # AI/ML models
├── uploads/                # File uploads
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔐 API Documentation

API documentation will be available at `/api/docs` once the server is running.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please contact the Prospera team.

---

**Built with ❤️ for the farming community**
