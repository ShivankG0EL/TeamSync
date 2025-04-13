'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const token = params.token;
  
  const [verificationState, setVerificationState] = useState({
    isLoading: true,
    isSuccess: false,
    error: null,
    email: null
  });

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
        console.log('Verifying email with token...');
        
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setVerificationState({
            isLoading: false,
            isSuccess: true,
            error: null,
            email: data.email
          });
          
          // Automatically redirect to password setup with the email
          console.log('Redirecting to password setup...');
          setTimeout(() => {
            router.push(`/setup-password/${token}`);
          }, 1500);
        } else {
          setVerificationState({
            isLoading: false,
            isSuccess: false,
            error: data.error || 'Email verification failed.',
            email: null
          });
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          error: 'An error occurred during verification.',
          email: null
        });
      }
    };

    verifyEmail();
  }, [token, router]);

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
            <p className="mt-2 text-center text-blue-500">Redirecting to set up your password...</p>
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
