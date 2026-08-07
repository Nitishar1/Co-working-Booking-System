import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session init failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success(`Welcome back, ${user.name}!`);
      return user;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const sendOtp = async (name, email, password) => {
    try {
      const res = await api.post('/auth/send-otp', { name, email, password });
      
      // Auto-authenticate immediately
      if (res.data?.user) {
        const { user, accessToken, refreshToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success('Registration successful! Welcome aboard.');
      } else {
        toast.success('Registration completed.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  };

  const verifyOtpAndRegister = async (email, otpCode) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otpCode });
      const { user, accessToken, refreshToken } = res.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Registration successful! Welcome aboard.');
      return user;
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('accessToken')) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Logout server request failed', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const value = { user, login, sendOtp, verifyOtpAndRegister, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
