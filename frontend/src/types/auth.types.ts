/**
 * Authentication & User Types
 * Mapped exactly to Spring Boot DTOs (dto/auth/*.java)
 */

export type UserRole =
  | "ADMIN"
  | "ASSET_MANAGER"
  | "DEPARTMENT_HEAD"
  | "EMPLOYEE";

/**
 * Maps to AuthUserResponse.java
 * { id(Long), fullName, email, departmentId, roleId, roleName, status }
 */
export interface AuthUserResponse {
  id: number;
  fullName: string;
  email: string;
  departmentId: number | null;
  roleId: number;
  roleName: string;
  status: "Active" | "Inactive";
}

/**
 * Maps to AuthResponse.java
 * { accessToken, tokenType, expiresInSeconds, user }
 * Note: No refreshToken in current backend contract
 */
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUserResponse;
}

/**
 * Maps to LoginRequest.java
 * { email, password }
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Maps to SignupRequest.java
 * { fullName, email, password, departmentId? }
 * BUSINESS RULE: No role field — signup always creates EMPLOYEE
 */
export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  departmentId?: number | null;
}

/**
 * Maps to ForgotPasswordRequest.java
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Maps to ForgotPasswordResponse.java
 */
export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Maps to ResetPasswordRequest.java
 * { token, newPassword }
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ─── Zod form schemas (keep types co-located for easy maintenance) ─────────

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  departmentId?: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

// ─── App session user (normalized from AuthUserResponse) ─────────────────────

export interface AppUser {
  id: number;
  fullName: string;
  email: string;
  departmentId: number | null;
  roleId: number;
  roleName: string;
  status: "Active" | "Inactive";
}

// Keep old User alias for store compatibility
export type User = AppUser;
export type AuthTokens = Pick<AuthResponse, "accessToken" | "tokenType" | "expiresInSeconds">;
