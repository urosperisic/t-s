// frontend/client/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Prevent multiple simultaneous refresh attempts
  const refreshInProgress = useRef(false);
  const refreshTimeoutRef = useRef(null);
  const tokenExpiryRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

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
      disconnectWebSocket();
      window.location.href = '/login';
      return false;
    } finally {
      refreshInProgress.current = false;
    }
  }, [scheduleTokenRefresh]);

  // WebSocket connection logic
  const connectWebSocket = useCallback(() => {
    if (!user) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/online-users/`;
    
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'online_users') {
        setOnlineUsers(data.users);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      
      // Attempt to reconnect after 3 seconds if user is still logged in
      if (user) {
        console.log('Attempting to reconnect in 3 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };
  }, [user]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setOnlineUsers([]);
  }, []);

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
    
    // Disconnect WebSocket
    disconnectWebSocket();
    
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

  // Connect WebSocket when user logs in
  useEffect(() => {
    if (user) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user, connectWebSocket, disconnectWebSocket]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAdmin: user?.role === 'admin',
    onlineUsers,
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