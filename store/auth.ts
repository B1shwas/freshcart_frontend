import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthApi, UserApi } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "user" | "admin" | string;
  profile?: Record<string, unknown> | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Add this to track if auth has been checked

  // Actions
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (identifier: string, password: string) => {
        set({ isLoading: true });
        try {
          const { accessToken } = await AuthApi.login({ identifier, password });
          set({ token: accessToken, isAuthenticated: true });
          await get().fetchMe();
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            token: null,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          await UserApi.signup(userData);
          // Auto login after successful signup using email as identifier
          await get().login(userData.email, userData.password);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchMe: async () => {
        const token = get().token;
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        try {
          const me = (await AuthApi.me(token)) as AuthUser;
          set({ user: me, isAuthenticated: true, isInitialized: true });
        } catch {
          // token invalid/expired
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      },

      setUser: (user: AuthUser | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token, isAuthenticated: !!token });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
