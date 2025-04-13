'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import RoleGuard from '@/components/auth/RoleGuard';

export default function AdminPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isAdmin } = useRole();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  return (
    <RoleGuard 
      allowedRoles={['admin']} 
      redirectTo="/user"
      fallback={
        <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
          <h1 className="text-2xl font-bold mb-6 text-center">Access Denied</h1>
          <p className="text-center">You don't have permission to access the admin panel.</p>
        </div>
      }
    >
      <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <UserManagement />
      </div>
    </RoleGuard>
  );
}
