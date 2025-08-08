import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { logInfo, logError } from '../utils/logger';

const AuthContext = createContext();

// Security configuration
const SECURITY_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours maximum session
  WARNING_BEFORE_LOGOUT: 5 * 60 * 1000, // Warn user 5 minutes before logout
  SESSION_STORAGE_KEY: 'phenohunter_session',
  LAST_ACTIVITY_KEY: 'phenohunter_last_activity'
};

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
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeUntilLogout, setTimeUntilLogout] = useState(0);
  
  // Refs for timers
  const inactivityTimer = useRef(null);
  const sessionTimer = useRef(null);
  const warningTimer = useRef(null);
  const warningCountdown = useRef(null);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
      sessionTimer.current = null;
    }
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
    if (warningCountdown.current) {
      clearInterval(warningCountdown.current);
      warningCountdown.current = null;
    }
  }, []);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    sessionStorage.setItem(SECURITY_CONFIG.LAST_ACTIVITY_KEY, now.toString());
    return now;
  }, []);

  // Check if session has expired
  const isSessionExpired = useCallback(() => {
    const sessionStart = sessionStorage.getItem(SECURITY_CONFIG.SESSION_STORAGE_KEY);
    const lastActivity = sessionStorage.getItem(SECURITY_CONFIG.LAST_ACTIVITY_KEY);
    
    if (!sessionStart || !lastActivity) return false;
    
    const now = Date.now();
    const sessionAge = now - parseInt(sessionStart);
    const timeSinceActivity = now - parseInt(lastActivity);
    
    return sessionAge > SECURITY_CONFIG.MAX_SESSION_DURATION || 
           timeSinceActivity > SECURITY_CONFIG.INACTIVITY_TIMEOUT;
  }, []);

  // Force logout due to security timeout
  const forceLogout = useCallback(async (reason = 'timeout') => {
    logInfo(`User logged out due to ${reason}`);
    clearAllTimers();
    setSessionWarning(false);
    setTimeUntilLogout(0);
    
    // Clear session storage
    sessionStorage.removeItem(SECURITY_CONFIG.SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SECURITY_CONFIG.LAST_ACTIVITY_KEY);
    
    try {
      await signOut(auth);
    } catch (error) {
      logError(error, { operation: 'forceLogout', reason });
    }
  }, [clearAllTimers]);

  // Show logout warning
  const showLogoutWarning = useCallback(() => {
    setSessionWarning(true);
    setTimeUntilLogout(SECURITY_CONFIG.WARNING_BEFORE_LOGOUT / 1000);
    
    // Start countdown
    warningCountdown.current = setInterval(() => {
      setTimeUntilLogout(prev => {
        if (prev <= 1) {
          forceLogout('inactivity_warning_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    logInfo('Session warning displayed to user');
  }, [forceLogout]);

  // Extend session (called when user interacts during warning)
  const extendSession = useCallback(() => {
    setSessionWarning(false);
    setTimeUntilLogout(0);
    clearAllTimers();
    updateLastActivity();
    startSecurityTimers();
    logInfo('User session extended');
  }, [clearAllTimers, updateLastActivity]);

  // Start security timers
  const startSecurityTimers = useCallback(() => {
    clearAllTimers();
    
    // Set inactivity timer
    inactivityTimer.current = setTimeout(() => {
      showLogoutWarning();
    }, SECURITY_CONFIG.INACTIVITY_TIMEOUT - SECURITY_CONFIG.WARNING_BEFORE_LOGOUT);
    
    // Set maximum session timer
    const sessionStart = sessionStorage.getItem(SECURITY_CONFIG.SESSION_STORAGE_KEY);
    if (sessionStart) {
      const sessionAge = Date.now() - parseInt(sessionStart);
      const remainingSessionTime = SECURITY_CONFIG.MAX_SESSION_DURATION - sessionAge;
      
      if (remainingSessionTime > 0) {
        sessionTimer.current = setTimeout(() => {
          forceLogout('max_session_exceeded');
        }, remainingSessionTime);
      } else {
        forceLogout('max_session_exceeded');
        return;
      }
    }
  }, [clearAllTimers, showLogoutWarning, forceLogout]);

  // Handle user activity (mouse move, click, keyboard)
  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    // If there's a warning, extend the session
    if (sessionWarning) {
      extendSession();
      return;
    }
    
    // Update last activity and reset inactivity timer
    updateLastActivity();
    
    // Only restart inactivity timer, not session timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    inactivityTimer.current = setTimeout(() => {
      showLogoutWarning();
    }, SECURITY_CONFIG.INACTIVITY_TIMEOUT - SECURITY_CONFIG.WARNING_BEFORE_LOGOUT);
  }, [isAuthenticated, sessionWarning, extendSession, updateLastActivity, showLogoutWarning]);

  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener...');
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        // Check if session is expired before setting user
        if (isSessionExpired()) {
          console.log('🔥 Session expired, forcing logout');
          forceLogout('session_expired');
          return;
        }
        
        // User is signed in
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        };
        console.log('🔥 User data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Initialize session if not exists
        const now = Date.now();
        if (!sessionStorage.getItem(SECURITY_CONFIG.SESSION_STORAGE_KEY)) {
          sessionStorage.setItem(SECURITY_CONFIG.SESSION_STORAGE_KEY, now.toString());
        }
        updateLastActivity();
        
        // Start security timers
        startSecurityTimers();
        
        logInfo('User authenticated', { userId: userData.id });
      } else {
        // User is signed out
        console.log('🔥 User signed out');
        clearAllTimers();
        setUser(null);
        setIsAuthenticated(false);
        setSessionWarning(false);
        setTimeUntilLogout(0);
        
        // Clear session storage
        sessionStorage.removeItem(SECURITY_CONFIG.SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SECURITY_CONFIG.LAST_ACTIVITY_KEY);
        
        logInfo('User signed out');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      clearAllTimers();
    };
  }, [isSessionExpired, forceLogout, updateLastActivity, startSecurityTimers, clearAllTimers]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Handle browser close/refresh
    const handleBeforeUnload = (e) => {
      // Clear session storage when browser closes
      sessionStorage.removeItem(SECURITY_CONFIG.SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SECURITY_CONFIG.LAST_ACTIVITY_KEY);
    };

    // Handle page visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab
        updateLastActivity();
      } else {
        // User returned to tab - check if session expired
        if (isSessionExpired()) {
          forceLogout('session_expired_on_return');
        } else {
          handleUserActivity();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, handleUserActivity, updateLastActivity, isSessionExpired, forceLogout]);

  const login = async (email, password) => {
    try {
      console.log('🔥 Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Initialize session
      const now = Date.now();
      sessionStorage.setItem(SECURITY_CONFIG.SESSION_STORAGE_KEY, now.toString());
      updateLastActivity();
      
      console.log('🔥 Login successful:', firebaseUser.uid);
      logInfo('User logged in successfully', { userId: firebaseUser.uid });
      return { success: true };
    } catch (error) {
      console.error('🔥 Login error:', error.code, error.message);
      logError(error, { operation: 'login', email });
      let errorMessage = 'Login failed';
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email, password, name) => {
    try {
      console.log('🔥 Attempting signup for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Initialize session
      const now = Date.now();
      sessionStorage.setItem(SECURITY_CONFIG.SESSION_STORAGE_KEY, now.toString());
      updateLastActivity();
      
      console.log('🔥 Signup successful:', firebaseUser.uid);
      logInfo('User signed up successfully', { userId: firebaseUser.uid });
      return { success: true };
    } catch (error) {
      console.error('🔥 Signup error:', error.code, error.message);
      logError(error, { operation: 'signup', email });
      let errorMessage = 'Signup failed';
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      clearAllTimers();
      setSessionWarning(false);
      setTimeUntilLogout(0);
      
      // Clear session storage
      sessionStorage.removeItem(SECURITY_CONFIG.SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SECURITY_CONFIG.LAST_ACTIVITY_KEY);
      
      await signOut(auth);
      logInfo('User logged out');
    } catch (error) {
      logError(error, { operation: 'logout' });
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    sessionWarning,
    timeUntilLogout,
    login,
    signup,
    logout,
    extendSession,
    // Security info for debugging/monitoring
    securityConfig: SECURITY_CONFIG
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
