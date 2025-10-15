"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type AuthView = "signIn" | "signUp";

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthView;
  callbackUrl: string | null;
  openAuthModal: (view?: AuthView, callbackUrl?: string) => void;
  closeAuthModal: () => void;
  switchView: (view: AuthView) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>("signIn");
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  // Use useCallback to memoize these functions to prevent unnecessary re-renders
  const openAuthModal = useCallback(
    (initialView: AuthView = "signIn", newCallbackUrl?: string) => {
      console.log(
        `Opening auth modal with view: ${initialView}, callbackUrl: ${newCallbackUrl || "none"}`,
      );
      setView(initialView);
      setCallbackUrl(newCallbackUrl || null);
      setIsOpen(true);
    },
    [],
  );

  const closeAuthModal = useCallback(() => {
    console.log("Closing auth modal");
    setIsOpen(false);
    // Don't clear callbackUrl on close to preserve it for potential reopening
  }, []);

  const switchView = useCallback((newView: AuthView) => {
    console.log(`Switching auth modal view to: ${newView}`);
    setView(newView);
  }, []);

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      isOpen,
      view,
      callbackUrl,
      openAuthModal,
      closeAuthModal,
      switchView,
    }),
    [isOpen, view, callbackUrl, openAuthModal, closeAuthModal, switchView],
  );

  return (
    <AuthModalContext.Provider value={contextValue} data-auth-modal-provider>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
