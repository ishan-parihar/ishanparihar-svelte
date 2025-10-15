"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// SIMPLE LOADING COMPONENTS (NO FRAMER-MOTION)
// ============================================================================

interface SimpleLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  spinner?: "default" | "dots" | "wave";
  className?: string;
}

function SimpleLoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full w-8 h-8 border-2 border-neutral-300 border-t-accent dark:border-neutral-700 dark:border-t-accent",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function SimpleLoadingOverlay({
  isVisible,
  message = "Loading...",
  spinner = "default",
  className = "",
}: SimpleLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/80 dark:bg-neutral-900/80",
        "backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center space-y-4 p-8 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg">
        <SimpleLoadingSpinner />
        <p className="text-neutral-600 dark:text-neutral-400 font-ui text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING CONTEXT TYPES
// ============================================================================

interface LoadingState {
  isLoading: boolean;
  message: string;
  spinner: "default" | "dots" | "wave";
}

interface LoadingContextType {
  // Global loading state
  globalLoading: LoadingState;

  // Page loading state
  pageLoading: LoadingState;

  // Component loading states
  componentLoading: Record<string, LoadingState>;

  // Actions
  setGlobalLoading: (
    loading: boolean,
    message?: string,
    spinner?: LoadingState["spinner"],
  ) => void;
  setPageLoading: (
    loading: boolean,
    message?: string,
    spinner?: LoadingState["spinner"],
  ) => void;
  setComponentLoading: (
    componentId: string,
    loading: boolean,
    message?: string,
    spinner?: LoadingState["spinner"],
  ) => void;

  // Utilities
  isAnyLoading: () => boolean;
  clearAllLoading: () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// ============================================================================
// LOADING PROVIDER
// ============================================================================

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [globalLoading, setGlobalLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "Loading...",
    spinner: "default",
  });

  const [pageLoading, setPageLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "Loading page...",
    spinner: "default",
  });

  const [componentLoading, setComponentLoadingState] = useState<
    Record<string, LoadingState>
  >({});

  // Global loading actions
  const setGlobalLoading = useCallback(
    (
      loading: boolean,
      message = "Loading...",
      spinner: LoadingState["spinner"] = "default",
    ) => {
      setGlobalLoadingState({
        isLoading: loading,
        message,
        spinner,
      });
    },
    [],
  );

  // Page loading actions
  const setPageLoading = useCallback(
    (
      loading: boolean,
      message = "Loading page...",
      spinner: LoadingState["spinner"] = "default",
    ) => {
      setPageLoadingState({
        isLoading: loading,
        message,
        spinner,
      });
    },
    [],
  );

  // Component loading actions
  const setComponentLoading = useCallback(
    (
      componentId: string,
      loading: boolean,
      message = "Loading...",
      spinner: LoadingState["spinner"] = "default",
    ) => {
      setComponentLoadingState((prev) => {
        if (!loading) {
          const { [componentId]: removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [componentId]: {
            isLoading: loading,
            message,
            spinner,
          },
        };
      });
    },
    [],
  );

  // Utility functions
  const isAnyLoading = useCallback(() => {
    return (
      globalLoading.isLoading ||
      pageLoading.isLoading ||
      Object.values(componentLoading).some((state) => state.isLoading)
    );
  }, [globalLoading.isLoading, pageLoading.isLoading, componentLoading]);

  const clearAllLoading = useCallback(() => {
    setGlobalLoadingState((prev) => ({ ...prev, isLoading: false }));
    setPageLoadingState((prev) => ({ ...prev, isLoading: false }));
    setComponentLoadingState({});
  }, []);

  const contextValue: LoadingContextType = {
    globalLoading,
    pageLoading,
    componentLoading,
    setGlobalLoading,
    setPageLoading,
    setComponentLoading,
    isAnyLoading,
    clearAllLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}

      {/* Global loading overlay */}
      <SimpleLoadingOverlay
        isVisible={globalLoading.isLoading}
        message={globalLoading.message}
        spinner={globalLoading.spinner}
      />

      {/* Page loading overlay */}
      <SimpleLoadingOverlay
        isVisible={pageLoading.isLoading && !globalLoading.isLoading}
        message={pageLoading.message}
        spinner={pageLoading.spinner}
        className="z-40" // Lower z-index than global loading
      />
    </LoadingContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// Hook for global loading
export function useGlobalLoading() {
  const { globalLoading, setGlobalLoading } = useLoading();
  return {
    isLoading: globalLoading.isLoading,
    message: globalLoading.message,
    spinner: globalLoading.spinner,
    setLoading: setGlobalLoading,
  };
}

// Hook for page loading
export function usePageLoading() {
  const { pageLoading, setPageLoading } = useLoading();
  return {
    isLoading: pageLoading.isLoading,
    message: pageLoading.message,
    spinner: pageLoading.spinner,
    setLoading: setPageLoading,
  };
}

// Hook for component-specific loading
export function useComponentLoading(componentId: string) {
  const { componentLoading, setComponentLoading } = useLoading();
  const state = componentLoading[componentId] || {
    isLoading: false,
    message: "Loading...",
    spinner: "default" as const,
  };

  // Memoize the setLoading function to prevent infinite re-renders
  const setLoading = useCallback(
    (loading: boolean, message?: string, spinner?: LoadingState["spinner"]) =>
      setComponentLoading(componentId, loading, message, spinner),
    [setComponentLoading, componentId],
  );

  return {
    isLoading: state.isLoading,
    message: state.message,
    spinner: state.spinner,
    setLoading,
  };
}

// Hook for checking if any loading is active
export function useIsAnyLoading() {
  const { isAnyLoading } = useLoading();
  return isAnyLoading();
}
