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
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [passwordSetupSent, setPasswordSetupSent] = useState(false);

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
    setVerificationSent(false);
  };

  const sendVerificationEmail = async () => {
    try {
      console.log('Sending verification email for:', isLogin ? loginEmail : signupEmail);
      
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: isLogin ? loginEmail : signupEmail,
          name: signupName || 'User' 
        })
      });
      
      const data = await res.json();
      console.log('Verification email response:', data);
      
      if (data.success) {
        if (isLogin) {
          setLoginEmailError('Verification email sent! Please check your inbox and click the verification link.');
        } else {
          setEmailError('Verification email sent! Please check your inbox and click the verification link.');
        }
        setVerificationSent(true);
      } else {
        if (isLogin) {
          setLoginEmailError(data.error || 'Failed to send verification email');
        } else {
          setEmailError(data.error || 'Failed to send verification email');
        }
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      const errorMessage = 'Failed to send verification email. Please try again.';
      if (isLogin) {
        setLoginEmailError(errorMessage);
      } else {
        setEmailError(errorMessage);
      }
    }
  };

  const handleEmailContinue = async (e) => {
    e.preventDefault();
    
    if (!signupName || !signupName.trim()) {
      setEmailError('Please enter your name');
      return;
    }
    
    if (!signupEmail || !signupEmail.trim()) {
      setEmailError('Please enter your email');
      return;
    }
    
    setIsVerifyingEmail(true);
    try {
      console.log('Checking email availability:', signupEmail);
      
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
        setEmailError(data.error || 'This email cannot be used');
      } else {
        // Send verification email
        await sendVerificationEmail();
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setEmailError('An error occurred. Please try again.');
    }
    
    setIsVerifyingEmail(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      setEmailError('Passwords do not match');
      return;
    }
    
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
      
      setVerificationSent(true);
      setShowPasswordFields(false);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleLoginEmailContinue = async (e) => {
    e.preventDefault();
    setIsVerifyingLoginEmail(true);
    try {
      const res = await fetch('/api/auth/check-email', {
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
        if (data.notVerified) {
          setLoginEmailError('Email not verified. Do you want to verify your email?');
          setEmailVerified(false);
          setShowLoginPassword(false);
        } else {
          setLoginEmailError(data.error);
          setShowLoginPassword(false);
        }
      } else {
        setLoginEmailError('');
        setShowLoginPassword(true);
        setPasswordAttempts(0);
        setPasswordError('');
      }
    } catch (error) {
      console.error('Email verification error:', error);
    }
    setIsVerifyingLoginEmail(false);
  };

  const handleCloseError = () => {
    setShowError(false);
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
                  <div>
                    <p className="text-red-500 text-sm mt-1">{loginEmailError}</p>
                    {loginEmailError.includes('not verified') && !verificationSent && (
                      <button
                        type="button"
                        onClick={sendVerificationEmail}
                        className="w-full mt-2 bg-green-600 text-white py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Send Verification Email
                      </button>
                    )}
                  </div>
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
                        setPasswordError('');
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
            <form onSubmit={handleEmailContinue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  disabled={verificationSent}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={handleSignupEmailChange}
                  disabled={verificationSent}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${verificationSent ? 'bg-opacity-50' : ''}`}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
                {verificationSent && !emailError && (
                  <p className="text-green-500 text-sm mt-1">
                    Verification email sent! Please check your inbox to verify your email address.
                  </p>
                )}
              </div>
              {!verificationSent ? (
                <button
                  type="submit"
                  disabled={isVerifyingEmail}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isVerifyingEmail ? 'Checking...' : 'Continue'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    setSignupEmail('');
                    setSignupName('');
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register Another Email
                </button>
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