import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { userAPI } from '../utils/api'; 

export const AuthContext = createContext();

/**
 * AuthProvider Component
 * Manages user authentication state and provides auth methods throughout the app
 * Handles Firebase authentication and syncs user data with backend
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Syncs Firebase user data with backend database
   * Creates or updates user record in backend when auth state changes
   */
  const syncUserWithBackend = async (firebaseUser) => {
    try {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || null
      };
      
      const response = await userAPI.syncUser(userData);
      return response.data;
    } catch (error) {
      // Silent fail - user can still use app even if backend sync fails
      return null;
    }
  };

  /**
   * Listen for Firebase auth state changes
   * Automatically syncs user with backend when authenticated
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUserWithBackend(firebaseUser);
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Handles user login with email and password
   * Returns success status and error message if failed
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sync with backend after successful login
      await syncUserWithBackend(userCredential.user);
      
      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Handles user registration with email, password, and display name
   * Creates Firebase account, updates profile, and syncs with backend
   */
  const register = async (email, password, name) => {
    try {
      setError(null);
      
      // Create user account in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      // Update Firebase profile with display name
      await updateProfile(currentUser, {
        displayName: name,
      });
      
      // Sync new user with backend database
      await syncUserWithBackend(currentUser);
      
      setUser(currentUser);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Handles user logout
   * Signs out from Firebase and clears local state
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setError(null);
  };

  /**
   * Updates user profile information in backend
   * Used for profile settings and user preferences
   */
  const updateUserProfile = async (userData) => {
    try {
      const response = await userAPI.updateProfile(userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Deletes user account from both Firebase and backend
   * Permanently removes all user data
   */
  const deleteAccount = async () => {
    try {
      await userAPI.deleteAccount();
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Context value object containing all auth state and methods
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * Provides easy access to auth state and methods in components
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};