import { rune, type Rune } from 'svelte\/compiler';

interface User {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
}

interface SessionState {
  isLoading: boolean;
  isLoggedIn: boolean;
  isPremium: boolean;
  user: User | null;
}

function createSessionStore() {
  let state: SessionState = $rune({
    isLoading: true,
    isLoggedIn: false,
    isPremium: false,
    user: null,
  });

  return {
    get state() {
      return state;
    },
    setSession: (session: Partial<SessionState>) => {
      state = { ...state, ...session };
    },
  };
}

export const sessionStore = createSessionStore();
