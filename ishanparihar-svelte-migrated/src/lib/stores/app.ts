import { rune, type Rune } from 'svelte\/compiler';

interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
}

function createAppStore() {
  let state: AppState = $rune({
    theme: 'dark',
    isLoading: false,
  });

  return {
    get state() {
      return state;
    },
    setTheme: (theme: 'light' | 'dark') => {
      state.theme = theme;
    },
    setLoading: (loading: boolean) => {
      state.isLoading = loading;
    },
  };
}

export const appStore = createAppStore();
