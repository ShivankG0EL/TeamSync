'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { signIn } from 'next-auth/react';
import { FiCheckCircle, FiAlertTriangle, FiEye, FiEyeOff } from 'react-icons/fi';

export default function SetupPasswordPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const token = params.token;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setError('Invalid token');
          setIsVerifying(false);
          return;
        }

        const response = await fetch(`/api/auth/verify-token?token=${token}&type=verification`);
        const data = await response.json();
        
        if (!response.ok || !data.valid) {
          setError(data.error || 'Invalid or expired token');
          setIsVerifying(false);
          return;
        }

        setEmail(data.email);
        setIsVerified(true);
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying token:', error);
        setError('An error occurred while verifying your token');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        
        // Auto-login after password setup
        setTimeout(async () => {
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });
          
          if (result?.error) {
            console.error('Auto login failed:', result.error);
          } else {
            router.push('/user/calendar');
          }
        }, 1500);
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-lg">Verifying your token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !isVerified) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <FiAlertTriangle className="text-red-500 mx-auto" size={60} />
          <h2 className="mt-4 text-2xl font-bold text-center">Invalid Request</h2>
          <p className="mt-2 text-center">{error || 'This link is invalid or has expired.'}</p>
          <button
            onClick={() => router.push('/')}
            className={`mt-6 w-full py-2 px-4 rounded-md ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <FiCheckCircle className="text-green-500 mx-auto" size={60} />
          <h2 className="mt-4 text-2xl font-bold text-center">Password Set Successfully!</h2>
          <p className="mt-2 text-center">Your password has been set successfully.</p>
          <p className="text-center mt-2 text-blue-500">Logging you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center mb-6">Set Your Password</h2>
        <p className="mb-4 text-center">Setting up password for: <strong>{email}</strong></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 rounded-md ${
                  darkMode 
                    ? "bg-gray-700 text-white border border-gray-600" 
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2 rounded-md ${
                darkMode 
                  ? "bg-gray-700 text-white border border-gray-600" 
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
