// Frontend-only role management
import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

// Available roles for the prototype
export const FRONTEND_ROLES = {
  ADMIN: 'admin',
  PROCESSOR: 'processor', 
  DISTRIBUTOR: 'distributor',
  RETAILER: 'retailer'
};

export const ROLE_LABELS = {
  [FRONTEND_ROLES.ADMIN]: 'Admin',
  [FRONTEND_ROLES.PROCESSOR]: 'Processor',
  [FRONTEND_ROLES.DISTRIBUTOR]: 'Distributor', 
  [FRONTEND_ROLES.RETAILER]: 'Retailer'
};

export const ROLE_DESCRIPTIONS = {
  [FRONTEND_ROLES.ADMIN]: 'Full system access, can manage roles and view all data',
  [FRONTEND_ROLES.PROCESSOR]: 'Can create batches and add trace events',
  [FRONTEND_ROLES.DISTRIBUTOR]: 'Can transfer ownership and add distribution events',
  [FRONTEND_ROLES.RETAILER]: 'Can view batch history and mark as delivered'
};

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(FRONTEND_ROLES.ADMIN);

  const switchRole = (newRole) => {
    console.log(`🔄 [ROLE] Switching from ${currentRole} to ${newRole}`);
    setCurrentRole(newRole);
  };

  const hasPermission = (requiredRole) => {
    // Admin can do everything
    if (currentRole === FRONTEND_ROLES.ADMIN) {
      return true;
    }
    
    // Otherwise, exact role match required
    return currentRole === requiredRole;
  };

  const canCreateBatch = () => {
    return hasPermission(FRONTEND_ROLES.PROCESSOR) || hasPermission(FRONTEND_ROLES.ADMIN);
  };

  const canManageRoles = () => {
    return hasPermission(FRONTEND_ROLES.ADMIN);
  };

  const canViewAdmin = () => {
    return hasPermission(FRONTEND_ROLES.ADMIN);
  };

  const value = {
    currentRole,
    switchRole,
    hasPermission,
    canCreateBatch,
    canManageRoles,
    canViewAdmin,
    roleLabel: ROLE_LABELS[currentRole],
    roleDescription: ROLE_DESCRIPTIONS[currentRole]
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext;
