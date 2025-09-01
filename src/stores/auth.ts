import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthUser } from "@/lib/auth-client";

type AuthState = {
  user: AuthUser | null;
  initializing: boolean;
  loading: boolean;
  error?: string | null;

  fetchMe: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      initializing: true,
      loading: false,
      error: null,

      fetchMe: async () => {
        try {
          const me = await authApi.me();
          set({ user: me, initializing: false, error: null });
        } catch {
          set({ user: null, initializing: false });
        }
      },

      signUp: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const me = await authApi.signUp({ name, email, password });
          set({ user: me, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e.message || "Sign up failed" });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const me = await authApi.signIn({ email, password });
          set({ user: me, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e.message || "Sign in failed" });
        }
      },

      signOut: async () => {
        set({ loading: true, error: null });
        try {
          await authApi.signOut();
          set({ user: null, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e.message || "Sign out failed" });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({ user: s.user }),
    }
  )
);
