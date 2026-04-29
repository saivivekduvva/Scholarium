import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch profile', error);
          // If profile fetch fails, token might be invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('username');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.login({ username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);
      
      try {
        const profileRes = await api.getProfile();
        setUser(profileRes.data);
      } catch (err) {
        console.error("Failed to fetch full profile after login", err);
        setUser({ username });
      }

      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.register({ username, email, password });
      return { success: true, requiresVerification: true };
    } catch (error) {
      console.error('Registration failed', error);
      const errorData = error.response?.data;
      let errorMsg = 'Registration failed';
      if (errorData) {
        if (errorData.username) errorMsg = `Username: ${errorData.username[0]}`;
        else if (errorData.email) errorMsg = `Email: ${errorData.email[0]}`;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
