// context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  pendingUserId: localStorage.getItem('pendingUserId'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
      };
    case 'SET_PENDING_USER':
      localStorage.setItem('pendingUserId', action.payload);
      return {
        ...state,
        pendingUserId: action.payload,
      };
    case 'CLEAR_PENDING_USER':
      localStorage.removeItem('pendingUserId');
      return {
        ...state,
        pendingUserId: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.removeItem('pendingUserId'); // Clear pending user on success
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        pendingUserId: null,
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('pendingUserId');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        pendingUserId: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      dispatch({
        type: 'USER_LOADED',
        payload: res.data,
      });
    } catch (err) {
      console.error('Load user error:', err);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      console.log('🔄 Registering user:', formData.email);
      const res = await api.post('/auth/register', formData);
      console.log('✅ Registration response:', res.data);

      // Store pending user ID for OTP verification
      if (res.data.success && res.data.userId) {
        dispatch({ type: 'SET_PENDING_USER', payload: res.data.userId });
      }

      return res.data;
    } catch (err) {
      console.error('❌ Registration error:', err.response?.data || err.message);
      throw err.response?.data || { message: 'Registration failed' };
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    try {
      const pendingUserId = state.pendingUserId || localStorage.getItem('pendingUserId');
      
      if (!pendingUserId) {
        throw { message: 'No pending user ID found. Please register again.' };
      }

      console.log('🔄 Verifying OTP:', { userId: pendingUserId, otp });

      const payload = {
        userId: String(pendingUserId).trim(),
        otp: String(otp).trim(),
      };

      const res = await api.post('/auth/verify-otp', payload);
      console.log('✅ OTP verification response:', res.data);

      if (res.data.success && res.data.token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: res.data.token,
            user: res.data.user
          },
        });
        dispatch({ type: 'CLEAR_PENDING_USER' });
      }

      return res.data;
    } catch (err) {
      console.error('❌ OTP verification error:', err.response?.data || err.message);
      throw err.response?.data || { message: 'OTP verification failed' };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      console.log('🔄 Logging in user:', { email: formData.email });
      const res = await api.post('/auth/login', formData);
      console.log('✅ Login response:', res.data);

      if (res.data.success && res.data.token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: res.data.token,
            user: res.data.user
          },
        });
      }

      return res.data;
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      dispatch({ type: 'LOGIN_FAIL' });
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  // Logout
  const logout = () => {
    console.log('👋 User logged out');
    dispatch({ type: 'LOGOUT' });
  };

  // Test email
  const testEmail = async () => {
    try {
      const res = await api.post('/auth/test-email');
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Email test failed' };
    }
  };

  // Generate test OTP
  const generateTestOTP = async (userId) => {
    try {
      const res = await api.post('/auth/generate-test-otp', { userId });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to generate test OTP' };
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        pendingUserId: state.pendingUserId,
        register,
        verifyOTP,
        login,
        logout,
        loadUser,
        testEmail,
        generateTestOTP,
      }}
    >
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
