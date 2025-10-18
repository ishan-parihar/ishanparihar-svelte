import { writable } from 'svelte/store';

export interface AuthState {
  isLoading: boolean;
  user: any | null; // Replace with actual user type when available
  isLoggedIn: boolean;
}

interface AuthStore {
  subscribe: (fn: (state: AuthState) => void) => () => void;
  set: (state: AuthState) => void;
  update: (fn: (state: AuthState) => AuthState) => void;
  signOut: () => void;
  openAuthModal: (type: 'signIn' | 'signUp', redirect?: string) => void;
}

const store = writable<AuthState>({
  isLoading: true,
  user: null,
  isLoggedIn: false,
});

export const auth: AuthStore = {
  ...store,
  signOut: () => {
    // Implementation would go here
    store.set({ isLoading: false, user: null, isLoggedIn: false });
  },
  openAuthModal: (type: 'signIn' | 'signUp', redirect?: string) => {
    // Implementation would go here 
    console.log(`Opening ${type} modal with redirect: ${redirect}`);
  }
};