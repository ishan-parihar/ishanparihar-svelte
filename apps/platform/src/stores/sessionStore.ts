import { create } from "zustand";

interface SessionState {
  isLoading: boolean;
  isLoggedIn: boolean;
  isPremium: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    role?: string;
  } | null;
  setSession: (session: {
    isLoading: boolean;
    isLoggedIn: boolean;
    isPremium: boolean;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      picture?: string;
      role?: string;
    } | null;
  }) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  isLoading: true,
  isLoggedIn: false,
  isPremium: false,
  user: null,
  setSession: (session) => set(session),
}));
