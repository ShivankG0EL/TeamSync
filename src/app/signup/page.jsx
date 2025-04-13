'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { FiMail, FiUser, FiAlertCircle } from 'react-icons/fi';

export default function SignupPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold text-center mb-2">Check Your Email</h2>
          <p className="text-center mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>.
            Please check your inbox and follow the instructions to complete your signup.
          </p>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
            If you don't see the email, check your spam folder.
          </p>
          <Link href="/login">
            <button
              className={`w-full py-2 px-4 rounded-md ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded flex items-center bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`pl-10 w-full p-2 rounded-md ${
                  darkMode 
                    ? "bg-gray-700 text-white border border-gray-600" 
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 w-full p-2 rounded-md ${
                  darkMode 
                    ? "bg-gray-700 text-white border border-gray-600" 
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Sending Verification...' : 'Sign Up'}
          </button>
          
          <div className="mt-6 text-center">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
