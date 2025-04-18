'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      router.push(`/${user.role}/dashboard`);
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/signin');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Redirecting to your dashboard...</h1>
        <div className="mt-4 animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
};

export default Dashboard;