'use client';
import React, { ReactNode } from 'react';
import { useRole } from '@/context/RoleContext';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'manager' | 'user')[];
  fallback?: ReactNode;
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = <p>You don't have permission to access this page.</p>,
  redirectTo
}) => {
  const { userRole } = useRole();
  const router = useRouter();
  
  const hasAccess = userRole && allowedRoles.includes(userRole as any);
  
  if (!hasAccess && redirectTo) {
    router.push(redirectTo);
    return null;
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
