import { useSessionStore } from "@/stores/sessionStore";

export function useSession() {
  const { isLoading, isLoggedIn, isPremium, user } = useSessionStore();

  return {
    isLoading,
    isLoggedIn,
    isPremium,
    user,
  };
}
