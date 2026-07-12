/**
 * useAuth hook
 * Provides current user, auth state, and auth actions to components
 */
"use client";

import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/auth.types";

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const hasRole = (role: UserRole): boolean => {
    if (!user?.roleName) return false;
    const normalizedUserRole = user.roleName.toUpperCase().replace(/\s+/g, "_");
    return normalizedUserRole === role;
  };

  const hasAnyRole = (...roles: UserRole[]): boolean =>
    roles.some((role) => hasRole(role));

  const isAdmin = hasRole(USER_ROLES.ADMIN as UserRole);
  const isAssetManager = hasRole(USER_ROLES.ASSET_MANAGER as UserRole);
  const isDepartmentHead = hasRole(USER_ROLES.DEPARTMENT_HEAD as UserRole);
  const isEmployee = hasRole(USER_ROLES.EMPLOYEE as UserRole);

  // Asset managers and admins can manage assets
  const canManageAssets = hasAnyRole(
    USER_ROLES.ADMIN as UserRole,
    USER_ROLES.ASSET_MANAGER as UserRole
  );

  // Admins can manage users and organization
  const canManageOrganization = isAdmin;

  // Department heads and above can approve transfers
  const canApproveTransfers = hasAnyRole(
    USER_ROLES.ADMIN as UserRole,
    USER_ROLES.ASSET_MANAGER as UserRole,
    USER_ROLES.DEPARTMENT_HEAD as UserRole
  );

  return {
    user,
    isAuthenticated,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isAssetManager,
    isDepartmentHead,
    isEmployee,
    canManageAssets,
    canManageOrganization,
    canApproveTransfers,
  };
}
