/**
 * Auth API Service Layer
 * All endpoints mapped to backend contract (AuthController.java)
 * Base URL: /api/auth
 */
import api from "@/lib/api";
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  AuthUserResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from "@/types/auth.types";

export const authApi = {
  /**
   * POST /api/auth/login
   * Returns: { accessToken, tokenType, expiresInSeconds, user }
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * POST /api/auth/signup
   * Signup is EMPLOYEE-only — role is never sent from frontend.
   * Returns: AuthUserResponse
   */
  signup: async (data: SignupRequest): Promise<AuthUserResponse> => {
    const response = await api.post<AuthUserResponse>("/auth/signup", data);
    return response.data;
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user
   */
  me: async (): Promise<AuthUserResponse> => {
    const response = await api.get<AuthUserResponse>("/auth/me");
    return response.data;
  },

  /**
   * POST /api/auth/forgot-password
   * Sends password reset email
   */
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  /**
   * POST /api/auth/reset-password
   * Resets password using token from email
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<AuthUserResponse> => {
    const response = await api.post<AuthUserResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },
};
