import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN";
  isEmailVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // This will be implemented later with actual API calls
          // const response = await fetch('/api/auth/login', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ email, password })
          // })
          // const data = await response.json()

          // Mock implementation for now
          console.log("Login attempt:", { email, password });

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          // This will be implemented later with actual API calls
          console.log("Register attempt:", userData);

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Register error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
