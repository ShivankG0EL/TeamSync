'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiGithub, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setLoginError(result.error);
      } else if (result?.ok) {
        router.push('/user/calendar');
      }
    } catch (error) {
      setLoginError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    signIn(provider, { callbackUrl: '/user/calendar' });
  };

  const getErrorMessage = () => {
    if (loginError) return loginError;
    
    if (error === 'wrong_provider') {
      const provider = searchParams.get('provider');
      const userEmail = searchParams.get('email');
      return `You've previously signed in with ${provider}. Please use that method to login.`;
    }
    
    return '';
  };

  const errorMessage = getErrorMessage();

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center mb-6">Log In to TeamSync</h2>
        
        {errorMessage && (
          <div className="mb-4 p-3 rounded flex items-center bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FiAlertCircle className="mr-2" />
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleEmailLogin} className="mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 w-full p-2 rounded-md ${
                  darkMode 
                    ? "bg-gray-700 text-white border border-gray-600" 
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
                required
              />
            </div>
            <div className="mt-1 text-right">
              <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>Or log in with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            className={`flex justify-center items-center p-2 rounded-md ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FcGoogle size={20} className="mr-2" />
            Google
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            className={`flex justify-center items-center p-2 rounded-md ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FiGithub size={20} className="mr-2" />
            GitHub
          </button>
        </div>
        
        <div className="text-center">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
