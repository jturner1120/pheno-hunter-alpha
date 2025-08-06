import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  saveAuthSession, 
  getAuthSession, 
  clearAuthSession, 
  isAuthenticated as checkAuth,
  DEMO_CREDENTIALS 
} from '../utils/localStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth session on mount
    const session = getAuthSession();
    if (session && session.isAuthenticated) {
      setUser(session.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Mock authentication - check against demo credentials
      if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
        const userData = {
          id: 'demo_user_1',
          username: username,
          email: 'demo@phenohunter.com',
          name: 'Demo User'
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        saveAuthSession(userData);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      // Mock signup - for demo, just create a user with provided info
      const userData = {
        id: 'user_' + Date.now(),
        username: username,
        email: email,
        name: username
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      saveAuthSession(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthSession();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
