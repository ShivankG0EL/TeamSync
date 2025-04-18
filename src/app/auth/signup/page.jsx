'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email:'',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingUser(null);

    try {
      const { data } = await axios.post('/api/auth/signup', formData);

      if (data.success) {
        alert('Verification email sent. Please check your inbox.');
        router.push('/auth/signin');
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.pendingVerification) {
        // Account exists but is pending verification
        setPendingUser({
          userId: err.response.data.userId,
          email: formData.email
        });
      } else {
        setError(err.response?.data?.error || err.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingUser) return;
    
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/signup', {
        email: pendingUser.email,
        resendVerification: true
      });
      
      if (data.success) {
        setResendSuccess(true);
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to resend verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        {resendSuccess ? (
          <div className="text-center p-4 bg-green-100 rounded mb-4">
            <p className="text-green-700">Verification link sent successfully!</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to sign in page...</p>
          </div>
        ) : pendingUser ? (
          <div className="text-center p-4 bg-yellow-100 rounded mb-4">
            <p className="text-yellow-800">This account exists but hasn't been verified.</p>
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        )}
        
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
