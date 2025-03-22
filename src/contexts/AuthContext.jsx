// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

// Create auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is present and valid on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            // Token expired
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setLoading(false);
            return;
          }

          // Token is valid, get user profile
          const response = await authAPI.getProfile();
          setUser(response.data.data);
        } catch (err) {
          console.error("Auth error:", err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { token, _id, name, email: userEmail, role } = response.data.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set user data
      setUser({ _id, name, email: userEmail, role });
      
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || 'Invalid credentials');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.register({ name, email, password });
      const { token, _id, name: userName, email: userEmail, role } = response.data.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set user data
      setUser({ _id, name: userName, email: userEmail, role });
      
      return true;
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.updateProfile(userData);
      setUser(response.data.data);
      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.response?.data?.error || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setLoading(true);
      await authAPI.updatePassword({ currentPassword, newPassword });
      return true;
    } catch (err) {
      console.error("Update password error:", err);
      setError(err.response?.data?.error || 'Failed to update password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};