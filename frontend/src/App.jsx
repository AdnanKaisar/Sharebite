import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition';
import ParallaxBackground from './components/ParallaxBackground';

// Page Imports
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import About from './pages/About';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FoodListing from './pages/FoodListing';
import FoodDetails from './pages/FoodDetails';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Contact from './pages/Contact';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const location = useLocation();

  // Helper to wrap components with page transition
  const withTransition = (element) => (
    <PageTransition>{element}</PageTransition>
  );

  return (
    <AuthProvider>
      <NotificationProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          {/* Scroll progress indicator at the top */}
          <ScrollProgress />

          {/* Global 3D Parallax Background */}
          <ParallaxBackground />

          {/* Global Navbar */}
          <Navbar />

          {/* Main Page Area */}
          <main className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={withTransition(<Landing />)} />
                <Route path="/login" element={withTransition(<Login />)} />
                <Route path="/admin-login" element={withTransition(<AdminLogin />)} />
                <Route path="/register" element={withTransition(<Register />)} />
                <Route path="/about" element={withTransition(<About />)} />
                <Route path="/listings" element={withTransition(<FoodListing />)} />
                <Route path="/analytics" element={withTransition(<Analytics />)} />
                <Route path="/contact" element={withTransition(<Contact />)} />

                {/* Secured Dynamic Detail and Dashboard routes */}
                <Route
                  path="/donation/:id"
                  element={withTransition(
                    <ProtectedRoute>
                      <FoodDetails />
                    </ProtectedRoute>
                  )}
                />
                
                <Route
                  path="/donor-dashboard"
                  element={withTransition(
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  )}
                />
                
                <Route
                  path="/ngo-dashboard"
                  element={withTransition(
                    <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                      <NGODashboard />
                    </ProtectedRoute>
                  )}
                />
                
                <Route
                  path="/volunteer-dashboard"
                  element={withTransition(
                    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  )}
                />
                
                <Route
                  path="/admin-dashboard"
                  element={withTransition(
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/profile"
                  element={withTransition(
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  )}
                />

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
