/**
 * Authentication & User Types
 */
import type { UUID, ISODateString } from "./common.types";

export type UserRole = "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE";

export interface User {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId: UUID | null;
  departmentName: string | null;
  organizationId: UUID;
  organizationName: string;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationCode: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
