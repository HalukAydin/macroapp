import { create } from "zustand";
import * as api from "../lib/api";
import { TOKEN_KEY } from "../lib/api";

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

  login: async (email, password) => {
    const { token } = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  register: async (email, password) => {
    const { token } = await api.register(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  }
}));
