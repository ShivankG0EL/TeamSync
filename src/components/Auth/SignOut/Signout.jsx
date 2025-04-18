'use client';

import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';

export default function Signout({ className }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  const handleSignout = async () => {
    try {
      if (token) {
        console.log('Signing out with token:', token.substring(0, 15) + '...');
        
        // Call the signout API endpoint with the token
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Signout API error:', data);
        } else {
          console.log('Signout successful:', data);
        }
      } else {
        console.warn('No token found for logout');
      }
      
      // Clear auth state in Redux regardless of API response
      dispatch(logout());
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error during signout:', error);
      // Still logout from frontend even if API call fails
      dispatch(logout());
      router.push('/');
    }
  };

  return (
    <button 
      onClick={handleSignout} 
      className={className || "text-red-600 hover:text-red-800 font-medium"}
    >
      Sign out
    </button>
  );
}
