/**
 * Auth Store (Zustand)
 * Manages authenticated user session, JWT token, and lifecycle
 */
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppUser, AuthResponse } from "@/types/auth.types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Actions
  setAuthFromResponse: (response: AuthResponse) => void;
  updateUser: (user: Partial<AppUser>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      /**
       * Called after a successful login.
       * Persists the access token to localStorage so Axios interceptor picks it up.
       */
      setAuthFromResponse: (response: AuthResponse) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        }
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
        });
      },

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
