import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Pages
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

// Farm Management
import FarmDashboard from './pages/farm/FarmDashboard';
import ExpertFarmView from './pages/farm/ExpertFarmView';

// Market
import MarketListings from './pages/market/MarketListings';

// Social
import SocialFeed from './pages/social/SocialFeed';

// Learning
import CourseCatalog from './pages/learning/CourseCatalog';
import CoursePage from './pages/learning/CoursePage';

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

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// New Social Media Pages
import MessagesPage from './pages/messages/MessagesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SearchPage from './pages/search/SearchPage';

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  const hideFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNavbar && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            path="/farm/expert"
            element={
              <ProtectedRoute roles={['expert', 'consultant']}>
                <ExpertFarmView />
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute>
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
            path="/learning/course/:courseId"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/courses/:id"
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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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

          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Box>
      {!hideFooter && <Footer />}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
