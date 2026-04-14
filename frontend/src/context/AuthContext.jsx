import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiBaseURL, setAccessToken } from '../axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = useCallback(async () => {
    setLoading(true);
    try {
      const storedRefresh = localStorage.getItem('refreshToken');
      const res = await apiBaseURL.post('/auth/refresh', storedRefresh ? { refreshToken: storedRefresh } : {});
      if (res.data.success && res.data.accessToken) {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } catch (error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent wiping state due to duplicate background refreshing if we're currently processing a Google callback token
    if (window.location.search.includes('token=')) {
      setLoading(false);
      return;
    }
    checkLoginStatus();
  }, [checkLoginStatus]);

  const login = async (token) => {
    if (token) {
      setAccessToken(token);
      try {
        const res = await apiBaseURL.get('/auth/status');
        setUser(res.data.user);
      } catch (e) {
        await checkLoginStatus();
      }
    }
  };

  const logout = async () => {
    try {
      await apiBaseURL.post('/auth/logout');
    } catch (e) { }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
