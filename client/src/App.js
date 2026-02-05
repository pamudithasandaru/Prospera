import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

// Farm Management
import FarmDashboard from './pages/farm/FarmDashboard';

// Market
import MarketListings from './pages/market/MarketListings';

// Social
import SocialFeed from './pages/social/SocialFeed';

// Learning
import CourseCatalog from './pages/learning/CourseCatalog';

// AI Tools
import DiseaseDetection from './pages/ai/DiseaseDetection';

// Marketplace
import EquipmentCatalog from './pages/marketplace/EquipmentCatalog';

// Government
import GovernmentSchemes from './pages/government/GovernmentSchemes';

// Weather
import WeatherDashboard from './pages/weather/WeatherDashboard';

// Support
import SupportCenter from './pages/support/SupportCenter';

// FinTech
import FinTechDashboard from './pages/fintech/FinTechDashboard';

function AppContent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Module Routes */}
          <Route
            path="/farm"
            element={
              <ProtectedRoute roles={['farmer']}>
                <FarmDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute roles={['farmer', 'buyer']}>
                <MarketListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social"
            element={
              <ProtectedRoute roles={['farmer', 'buyer', 'expert']}>
                <SocialFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <CourseCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-tools"
            element={
              <ProtectedRoute roles={['farmer', 'expert']}>
                <DiseaseDetection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute roles={['farmer', 'buyer']}>
                <EquipmentCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government"
            element={
              <ProtectedRoute roles={['farmer', 'government', 'admin']}>
                <GovernmentSchemes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute roles={['farmer']}>
                <WeatherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fintech"
            element={
              <ProtectedRoute roles={['farmer']}>
                <FinTechDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
