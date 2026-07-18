import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Session restore failed:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('token', token);
      
      // Load complete user profile details
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
      setLoading(false);
      return profileResponse.data;
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Please verify credentials.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authAPI.register(formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Load profile
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
      setLoading(false);
      return profileResponse.data;
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Registration failed. Check details.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfileLocal = (updatedData) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      login,
      register,
      logout,
      updateProfileLocal,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
