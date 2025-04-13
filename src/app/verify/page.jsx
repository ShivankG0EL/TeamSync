'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationState, setVerificationState] = useState({
    isLoading: true,
    isSuccess: false,
    error: null,
    email: null
  });
  const [passwordSetupSent, setPasswordSetupSent] = useState(false);
  const [sendingPasswordEmail, setSendingPasswordEmail] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerificationState({
        isLoading: false,
        isSuccess: false,
        error: 'No verification token provided.',
        email: null
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setVerificationState({
            isLoading: false,
            isSuccess: true,
            error: null,
            email: data.email
          });
          
          // Automatically send password setup email
          if (data.email) {
            sendPasswordSetupEmail(data.email);
          }
        } else {
          setVerificationState({
            isLoading: false,
            isSuccess: false,
            error: data.error || 'Email verification failed.',
            email: null
          });
        }
      } catch (error) {
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          error: 'An error occurred during verification.',
          email: null
        });
      }
    };

    verifyEmail();
  }, [token]);

  const sendPasswordSetupEmail = async (email) => {
    if (!email || passwordSetupSent || sendingPasswordEmail) return;
    
    setSendingPasswordEmail(true);
    
    try {
      const response = await fetch('/api/auth/send-password-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setPasswordSetupSent(true);
      }
    } catch (error) {
      console.error('Failed to send password setup email:', error);
    } finally {
      setSendingPasswordEmail(false);
    }
  };

  const handleSendSetupEmail = () => {
    sendPasswordSetupEmail(verificationState.email);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {verificationState.isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-lg">Verifying your email...</p>
          </div>
        ) : verificationState.isSuccess ? (
          <div className="flex flex-col items-center">
            <FiCheckCircle className="text-green-500" size={60} />
            <h2 className="mt-4 text-2xl font-bold">Email Verified!</h2>
            <p className="mt-2 text-center">Your email has been successfully verified.</p>
            
            {passwordSetupSent ? (
              <div className="mt-4 text-center">
                <p className="text-green-500 mb-4">Password setup email has been sent. Please check your inbox.</p>
                <button
                  onClick={() => router.push('/')}
                  className={`w-full py-2 px-4 rounded-md ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendSetupEmail}
                disabled={sendingPasswordEmail}
                className={`mt-6 w-full py-2 px-4 rounded-md ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {sendingPasswordEmail ? 'Sending Email...' : 'Set Up Password'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FiAlertTriangle className="text-red-500" size={60} />
            <h2 className="mt-4 text-2xl font-bold">Verification Failed</h2>
            <p className="mt-2 text-center">{verificationState.error || 'The verification link is invalid or has expired.'}</p>
            <button
              onClick={() => router.push('/')}
              className={`mt-6 w-full py-2 px-4 rounded-md ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
