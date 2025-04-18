'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '@/redux/slices/authSlice';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    dispatch(loginStart());

    try {
      const response = await axios.post('/api/auth/signin', {
        email,
        password,
        role
      });

      const data = response.data;
      
      dispatch(loginSuccess({
        user: data.user,
        token: data.token
      }));

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Sign in failed';
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        console.log('Logging out with token:', token.substring(0, 15) + '...');
        
        // Call the signout API endpoint to invalidate the token
        const response = await axios.post('/api/auth/signout', { token });
        console.log('Logout API response:', response.data);
      } else {
        console.warn('No token found for logout');
      }
    } catch (error) {
      console.error('Error during API logout:', error);
    } finally {
      // Always clear Redux state and redirect regardless of API success
      dispatch(logoutAction());
      router.push('/');
      return { success: true };
    }
  };

  return {
    login,
    logout,
    loading,
    error
  };
}
