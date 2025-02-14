"use client"
import { useState, useEffect } from 'react';
import { FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FiMoon, FiSun } from 'react-icons/fi';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

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

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
              <button className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full">
                  <FcGoogle size={20} />
                </div>
                <span>Google</span>
              </button>
              <button className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <FiGithub size={20} />
                </div>
                <span>GitHub</span>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
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
              <button className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full">
                  <FcGoogle size={20} />
                </div>
                <span>Google</span>
              </button>
              <button className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <FiGithub size={20} />
                </div>
                <span>GitHub</span>
              </button>
            </div>
            <form className="space-y-4">
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
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              {signupEmail && (
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
              )}
              {signupPassword && (
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
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
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