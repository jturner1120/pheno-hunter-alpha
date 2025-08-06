import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { logInfo, logError } from '../utils/logger';

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
    console.log('🔥 Setting up Firebase auth listener...');
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        // User is signed in
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        };
        console.log('🔥 User data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        logInfo('User authenticated', { userId: userData.id });
      } else {
        // User is signed out
        console.log('🔥 User signed out');
        setUser(null);
        setIsAuthenticated(false);
        logInfo('User signed out');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔥 Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
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
