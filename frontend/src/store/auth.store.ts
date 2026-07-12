/**
 * Auth Store (Zustand)
 * Manages authenticated user state, tokens, and session lifecycle
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthTokens } from "@/types/auth.types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        // Persist tokens to localStorage for Axios interceptor
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        }
        set({ user, tokens, isAuthenticated: true });
      },

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        set({ user: null, tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
