import { writable } from 'svelte/store';

interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
}

const initialState: AppState = {
  theme: 'dark',
  isLoading: false,
};

function createAppStore() {
  const { subscribe, set, update } = writable<AppState>(initialState);

  return {
    subscribe,
    setTheme: (theme: 'light' | 'dark') => update(state => ({ ...state, theme })),
    setLoading: (loading: boolean) => update(state => ({ ...state, isLoading: loading })),
    reset: () => set(initialState)
  };
}

export const appStore = createAppStore();
