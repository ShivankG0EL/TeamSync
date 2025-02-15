"use client"
import { useState, useEffect } from 'react';
import { FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FiMoon, FiSun } from 'react-icons/fi';
import { signIn } from 'next-auth/react';
import ErrorPopup from './ErrorPopup';
import { useRouter } from 'next/navigation';

export default function AuthPage({ searchParams }) {
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isVerifyingLoginEmail, setIsVerifyingLoginEmail] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginEmailError, setLoginEmailError] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');
    const email = searchParams.get('email');
    
    if (error === 'wrong_provider' && provider && email) {
      setErrorMessage(`This email (${email}) is already registered with ${provider}. Please use ${provider} to login.`);
      setShowError(true);
    }
  }, [searchParams]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!darkMode).toString());
  };

  const clearFormFields = () => {
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupName('');
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleFormToggle = (newIsLogin) => {
    setIsLogin(newIsLogin);
    clearFormFields();
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/user/calendar' });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signIn('github', { callbackUrl: '/user/calendar' });
    } catch (error) {
      console.error('Error signing in with Github:', error);
    }
  };

  const handleSignupEmailChange = async (e) => {
    const email = e.target.value;
    setSignupEmail(email);
    setEmailError('');
  };

  const handleEmailContinue = async (e) => {
    e.preventDefault();
    setIsVerifyingEmail(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail })
      });
      const data = await res.json();
      
      if (data.redirect) {
        setIsVerifyingEmail(false);
        router.push(data.redirect);
        return;
      }
      
      if (!data.success) {
        setEmailError(data.error);
        setShowPasswordFields(false);
      } else {
        setEmailError('');
        setShowPasswordFields(true);
      }
    } catch (error) {
      console.error('Email verification error:', error);
    }
    setIsVerifyingEmail(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName
        })
      });
      const data = await res.json();
      
      if (data.redirect) {
        router.push(data.redirect);
        return;
      }
      
      if (!data.success) {
        setEmailError(data.error);
        return;
      }
      
      // Handle successful registration
      router.push('/user/calendar');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleLoginEmailContinue = async (e) => {
    e.preventDefault();
    setIsVerifyingLoginEmail(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });
      const data = await res.json();
      
      if (data.redirect) {
        setIsVerifyingLoginEmail(false);
        router.push(data.redirect);
        return;
      }
      
      if (!data.success) {
        setLoginEmailError(data.error);
        setShowLoginPassword(false);
      } else {
        setLoginEmailError('');
        setShowLoginPassword(true);
        setPasswordAttempts(0); // Reset attempts when showing password field
        setPasswordError(''); // Clear any previous password errors
      }
    } catch (error) {
      console.error('Email verification error:', error);
    }
    setIsVerifyingLoginEmail(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });
      const data = await res.json();

      if (!data.success) {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setShowLoginPassword(false);
          setLoginEmail('');
          setLoginPassword('');
          setLoginEmailError('Too many failed attempts. Please try again.');
          setPasswordError('');
          return;
        }
        
        setPasswordError(`Invalid password. ${3 - newAttempts} attempts remaining.`);
        setLoginPassword(''); // Clear password field
        return;
      }

      router.push('/user/calendar');
    } catch (error) {
      console.error('Login error:', error);
      setLoginEmailError('An error occurred during login');
    }
  };

  const handleCloseError = () => {
    setShowError(false);
    // Remove query parameters from URL without page reload
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {showError && (
        <ErrorPopup
          message={errorMessage}
          onClose={handleCloseError}
        />
      )}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-2 rounded-full ${
          darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'
        }`}
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      <div className="perspective-1000 w-96 h-[580px]">
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          !isLogin ? 'rotate-y-180' : ''
        }`}>
          {/* Login Form Front */}
          <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-lg p-8 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleGoogleSignIn}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full">
                  <FcGoogle size={20} />
                </div>
                <span>Google</span>
              </button>
              <button 
                onClick={handleGithubSignIn}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <FiGithub size={20} />
                </div>
                <span>GitHub</span>
              </button>
            </div>
            <form onSubmit={showLoginPassword ? handleLoginSubmit : handleLoginEmailContinue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginEmailError('');
                  }}
                  disabled={showLoginPassword}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${showLoginPassword ? 'bg-opacity-50' : ''}`}
                />
                {loginEmailError && (
                  <p className="text-red-500 text-sm mt-1">{loginEmailError}</p>
                )}
              </div>
              {!showLoginPassword ? (
                <button
                  type="submit"
                  disabled={isVerifyingLoginEmail}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isVerifyingLoginEmail ? 'Checking...' : 'Continue'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setPasswordError(''); // Clear password error when typing
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } ${passwordError ? 'border-red-500' : ''}`}
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </form>
            <p className="mt-4 text-center">
              Don't have an account?{' '}
              <button
                onClick={() => handleFormToggle(false)}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Signup Form Back */}
          <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-lg p-8 rotate-y-180 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleGoogleSignIn}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full">
                  <FcGoogle size={20} />
                </div>
                <span>Google</span>
              </button>
              <button 
                onClick={handleGithubSignIn}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <FiGithub size={20} />
                </div>
                <span>GitHub</span>
              </button>
            </div>
            <form onSubmit={showPasswordFields ? handleSignupSubmit : handleEmailContinue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={handleSignupEmailChange}
                  disabled={showPasswordFields}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${showPasswordFields ? 'bg-opacity-50' : ''}`}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
              {!showPasswordFields ? (
                <button
                  type="submit"
                  disabled={isVerifyingEmail}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isVerifyingEmail ? 'Checking...' : 'Continue'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Account
                  </button>
                </>
              )}
            </form>
            <p className="mt-4 text-center">
              Already have an account?{' '}
              <button
                onClick={() => handleFormToggle(true)}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}