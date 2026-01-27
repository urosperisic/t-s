// frontend/client/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Prevent multiple simultaneous refresh attempts
  const refreshInProgress = useRef(false);
  const refreshTimeoutRef = useRef(null);
  const tokenExpiryRef = useRef(null);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleTokenRefresh = useCallback((expiresInSeconds) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    if (!expiresInSeconds) return;

    // Store when token expires
    tokenExpiryRef.current = Date.now() + (expiresInSeconds * 1000);

    // Refresh 2 minutes before expiry
    const refreshTime = (expiresInSeconds * 1000) - (2 * 60 * 1000);
    
    // Ensure we don't refresh too soon (min 30 seconds)
    const safeRefreshTime = Math.max(refreshTime, 30000);

    // If token expires in less than 2 minutes, refresh immediately
    if (safeRefreshTime <= 30000) {
      console.log('Token expires soon, refreshing immediately...');
      refreshToken();
      return;
    }

    console.log(`Token refresh scheduled in ${Math.floor(safeRefreshTime / 1000)}s`);

    refreshTimeoutRef.current = setTimeout(() => {
      if (!refreshInProgress.current) {
        refreshToken();
      }
    }, safeRefreshTime);
  }, []);

  const refreshToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (refreshInProgress.current) {
      console.log('Refresh already in progress, skipping...');
      return false;
    }

    refreshInProgress.current = true;

    try {
      const response = await authAPI.refreshToken();
      
      // Schedule next refresh if backend provides expiry info
      if (response.access_token_expires_in) {
        scheduleTokenRefresh(response.access_token_expires_in);
      }

      console.log('Token refreshed successfully');
      return true;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, log out
      setUser(null);
      window.location.href = '/login';
      return false;
    } finally {
      refreshInProgress.current = false;
    }
  }, [scheduleTokenRefresh]);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.user);
    
    // Schedule token refresh if backend provides expiry info
    if (response.access_token_expires_in) {
      scheduleTokenRefresh(response.access_token_expires_in);
    }
    
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response;
  };

  const logout = async () => {
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    tokenExpiryRef.current = null;
    refreshInProgress.current = false;
    
    await authAPI.logout();
    setUser(null);
  };

  // Check if token might be expired when user returns to tab
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && user && tokenExpiryRef.current) {
      const now = Date.now();
      
      // If token expired or expires soon (within 1 minute), refresh immediately
      if (tokenExpiryRef.current - now < 60000) {
        console.log('Token expired or expiring soon while tab was inactive, refreshing...');
        refreshToken();
      }
    }
  }, [user, refreshToken]);

  // Handle page visibility changes (user switching tabs/returning to tab)
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleVisibilityChange]);

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}