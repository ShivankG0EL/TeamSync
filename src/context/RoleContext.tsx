'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

type RoleContextType = {
  userRole: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
  canAccessAdminFeatures: boolean;
  canAccessManagerFeatures: boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || null;
  
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isUser = userRole === 'user' || !userRole;
  
  // Define role-based permissions
  const canAccessAdminFeatures = isAdmin;
  const canAccessManagerFeatures = isAdmin || isManager;

  return (
    <RoleContext.Provider 
      value={{ 
        userRole, 
        isAdmin, 
        isManager, 
        isUser,
        canAccessAdminFeatures,
        canAccessManagerFeatures
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
