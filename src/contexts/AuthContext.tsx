import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Initial auth check - Token exists:', !!token);
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure the user object has the token
        setUser({
          ...parsedUser,
          accessToken: token
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // Clear any inconsistent state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing tokens first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('Attempting login with:', email);
      const response = await api.post('/api/v1/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token) {
        console.error('No token received from server');
        throw new Error('Authentication failed - no token received');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage:', token);
      
      // Store user data with token
      const userData = {
        ...user,
        accessToken: token
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user in state
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Also update the useEffect to check for token
  useEffect(() => {
    // Check if token and user are stored in localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Initial token check:', storedToken ? 'Token exists' : 'No token');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          accessToken: storedToken
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove user from local state even if API call fails
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};