// Root app component — sets up React Router with all page routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DonateFoodPage from './pages/DonateFoodPage.jsx';
import FoodListingsPage from './pages/FoodListingsPage.jsx';
import NGODashboard from './pages/NGODashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import FoodRequestsPage from './pages/FoodRequestsPage.jsx';

// Loading screen while auth hydrates
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm font-medium">Loading FoodBridge 2.0...</p>
      </div>
    </div>
  );
}

// RoleRoute — restricts to a specific role or redirects
function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}


function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/listings" element={<FoodListingsPage />} />
        <Route path="/requests" element={<FoodRequestsPage />} />

        {/* Provider-only routes */}
        <Route
          path="/donate"
          element={
            <RoleRoute role="provider">
              <DonateFoodPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider-dashboard"
          element={
            <RoleRoute role="provider">
              <ProviderDashboard />
            </RoleRoute>
          }
        />

        {/* NGO-only route */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute role="ngo">
              <NGODashboard />
            </RoleRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

