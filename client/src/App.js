import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme';
import { neuColors } from './neumorphic';
import ScrollReveal from './motion/ScrollReveal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { accessFor } from './config/access';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SproutChat from './components/SproutChat';
import RouteGuard from './components/RouteGuard';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/admin/AdminPanel';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

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
import CartPage from './pages/marketplace/CartPage';
import CheckoutPage from './pages/marketplace/CheckoutPage';
import OrderConfirmation from './pages/marketplace/OrderConfirmation';
import OrdersPage from './pages/marketplace/OrdersPage';

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

// Admins have no farms of their own: send them to the all-farmers view instead of an empty "register a farm" page.
const FarmEntry = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Navigate to="/farm/expert" replace /> : <FarmDashboard />;
};

/**
 * Wires a route to its rule in config/access.js by path, so the guard can
 * never drift from the table the Navbar reads.
 */
const Guarded = ({ path, element }) => (
  <Route path={path} element={<RouteGuard access={accessFor(path)}>{element}</RouteGuard>} />
);

function AppContent() {
  const location = useLocation();
  const chromeless = ['/login', '/register'].includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: neuColors.base }}>
      {!chromeless && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: neuColors.base }}>
        <Box key={location.pathname} className="page-transition">
        <Routes>
          {/* Open to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Guest-browsable modules — reading is open, every write still
              checks for a session, both in the page and on the server. */}
          {Guarded({ path: '/market', element: <MarketListings /> })}
          {Guarded({ path: '/social', element: <SocialFeed /> })}
          {Guarded({ path: '/learning', element: <CourseCatalog /> })}
          {Guarded({ path: '/learning/course/:courseId', element: <CoursePage /> })}
          {Guarded({ path: '/learning/courses/:id', element: <CourseCatalog /> })}
          {Guarded({ path: '/marketplace', element: <EquipmentCatalog /> })}
          {Guarded({ path: '/marketplace/cart', element: <CartPage /> })}
          {Guarded({ path: '/marketplace/checkout', element: <CheckoutPage /> })}
          {Guarded({ path: '/marketplace/orders', element: <OrdersPage /> })}
          {Guarded({ path: '/marketplace/orders/:orderId', element: <OrderConfirmation /> })}
          {Guarded({ path: '/government', element: <GovernmentSchemes /> })}
          {Guarded({ path: '/weather', element: <WeatherDashboard /> })}

          {/* Any signed-in account */}
          {Guarded({ path: '/dashboard', element: <Dashboard /> })}
          {Guarded({ path: '/profile', element: <ProfilePage /> })}
          {Guarded({ path: '/support', element: <SupportCenter /> })}
          {Guarded({ path: '/messages', element: <MessagesPage /> })}
          {Guarded({ path: '/notifications', element: <NotificationsPage /> })}
          {Guarded({ path: '/search', element: <SearchPage /> })}

          {/* Role-restricted */}
          {Guarded({ path: '/admin', element: <AdminPanel /> })}
          {Guarded({ path: '/farm/expert', element: <ExpertFarmView /> })}
          {Guarded({ path: '/farm', element: <FarmEntry /> })}
          {Guarded({ path: '/ai-tools', element: <DiseaseDetection /> })}
          {Guarded({ path: '/fintech', element: <FinTechDashboard /> })}

          {/* Unknown paths used to redirect to /dashboard, which bounced
              signed-out visitors to /login — a 404 is the honest answer. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Box>
      </Box>
      {!chromeless && <Footer />}
      <ScrollReveal />
      {!chromeless && <SproutChat />}
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
            <CartProvider>
              <AppContent />
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
