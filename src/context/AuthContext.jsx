// AuthContext — global authentication state
// Stores the logged-in user and JWT token, exposes login/logout helpers
// Wraps the app so any component can access auth state via useAuth()

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext(null);

// Axios base URL:
// - In dev: defaults to '' (proxied by Vite to localhost:5000)
// - In production: uses VITE_API_BASE_URL (e.g. https://foodbridge-backend.onrender.com)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fb_token') || null);
  const [loading, setLoading] = useState(true);

  // Clear everything on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fb_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Called after a successful login or register response
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('fb_token', jwtToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  };

  // Attach JWT to every outgoing Axios request if we have one
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // On mount: verify the stored token and reload the user from the API
  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data.user);
      } catch {
        // Token expired or invalid — clear it
        logout();
      } finally {
        setLoading(false);
      }
    };
    hydrateUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this instead of useContext(AuthContext) directly
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
