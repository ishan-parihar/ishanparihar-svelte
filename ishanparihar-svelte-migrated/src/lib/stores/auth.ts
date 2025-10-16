import { writable } from 'svelte/store';

export const auth = writable({
  isLoading: true,
  user: null,
});