/**
 * useAuth hook
 * Provides current user, auth state, and auth actions to components
 */
"use client";

import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/auth.types";

export function normalizeRoleName(roleName?: string | null): UserRole | null {
  if (!roleName) return null;

  const normalized = roleName
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/ADMINISTRATOR/, "ADMIN")
    .replace(/ASSET\s*MANAGER/, "ASSET_MANAGER")
    .replace(/DEPARTMENT\s*HEAD/, "DEPARTMENT_HEAD")
    .replace(/[\s-]+/g, "_");

  if (Object.values(USER_ROLES).includes(normalized as UserRole)) {
    return normalized as UserRole;
  }

  return null;
}

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const currentRole = normalizeRoleName(user?.roleName);

  const hasRole = (role: UserRole): boolean => {
    return currentRole === role;
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
    currentRole,
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
