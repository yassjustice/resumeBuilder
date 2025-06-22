import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Start with loading true to check for existing session
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await verifyToken(token);
      } else {
        // No token found, set loading to false
        dispatch({ type: 'LOGIN_FAILURE', payload: null });
      }
    };
    
    checkAuth();
  }, []);
  const verifyToken = async (token) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authApi.verifyToken(token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: token,
        },
      });
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Invalid or expired token',
      });
    }
  };const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const data = await authApi.login(email, password);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.user, token: data.token },
        });
        
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const data = await authApi.register(userData);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.user, token: data.token },
        });
        
        return { success: true };
      } else {
        throw new Error(data.message || 'Registration failed');      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await authApi.updateProfile(profileData);
      
      if (data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: data.user,
        });
        return { success: true };
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
