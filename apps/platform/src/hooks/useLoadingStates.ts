"use client";

import { useEffect, useCallback } from "react";
import {
  useComponentLoading,
  useGlobalLoading,
  usePageLoading,
} from "@/contexts/LoadingContext";

// ============================================================================
// REACT QUERY LOADING HOOKS
// ============================================================================

interface UseQueryLoadingOptions {
  componentId?: string;
  globalLoading?: boolean;
  message?: string;
  spinner?: "default" | "dots" | "wave";
}

/**
 * Hook to manage loading states for React Query operations
 */
export function useQueryLoading(
  isLoading: boolean,
  options: UseQueryLoadingOptions = {},
) {
  const {
    componentId,
    globalLoading = false,
    message = "Loading...",
    spinner = "default",
  } = options;

  const { setLoading: setGlobalLoading } = useGlobalLoading();
  const { setLoading: setComponentLoading } = useComponentLoading(
    componentId || "default",
  );

  useEffect(() => {
    if (globalLoading) {
      setGlobalLoading(isLoading, message, spinner);
    } else if (componentId) {
      setComponentLoading(isLoading, message, spinner);
    }
  }, [
    isLoading,
    globalLoading,
    componentId,
    message,
    spinner,
    setGlobalLoading,
    setComponentLoading,
  ]);

  return {
    isLoading,
    setMessage: useCallback(
      (newMessage: string) => {
        if (globalLoading) {
          setGlobalLoading(isLoading, newMessage, spinner);
        } else if (componentId) {
          setComponentLoading(isLoading, newMessage, spinner);
        }
      },
      [
        isLoading,
        globalLoading,
        componentId,
        spinner,
        setGlobalLoading,
        setComponentLoading,
      ],
    ),
  };
}

/**
 * Hook for managing multiple loading states
 */
export function useMultipleLoadingStates(
  loadingStates: Array<{
    isLoading: boolean;
    componentId: string;
    message?: string;
    spinner?: "default" | "dots" | "wave";
  }>,
) {
  const { setLoading: setComponentLoading } = useComponentLoading("default");

  useEffect(() => {
    loadingStates.forEach(
      ({
        isLoading,
        componentId,
        message = "Loading...",
        spinner = "default",
      }) => {
        setComponentLoading(isLoading, message, spinner);
      },
    );
  }, [loadingStates, setComponentLoading]);

  const isAnyLoading = loadingStates.some((state) => state.isLoading);
  const loadingCount = loadingStates.filter((state) => state.isLoading).length;

  return {
    isAnyLoading,
    loadingCount,
    allLoaded: !isAnyLoading,
  };
}

// ============================================================================
// NAVIGATION LOADING HOOKS
// ============================================================================

/**
 * Hook for managing navigation loading states
 */
export function useNavigationLoading() {
  const { setLoading } = usePageLoading();

  const startNavigation = useCallback(
    (
      message = "Navigating...",
      spinner: "default" | "dots" | "wave" = "default",
    ) => {
      setLoading(true, message, spinner);
    },
    [setLoading],
  );

  const endNavigation = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return {
    startNavigation,
    endNavigation,
  };
}

// ============================================================================
// FORM LOADING HOOKS
// ============================================================================

interface UseFormLoadingOptions {
  componentId: string;
  submitMessage?: string;
  validatingMessage?: string;
  spinner?: "default" | "dots" | "wave";
}

/**
 * Hook for managing form loading states
 */
export function useFormLoading(options: UseFormLoadingOptions) {
  const {
    componentId,
    submitMessage = "Submitting...",
    validatingMessage = "Validating...",
    spinner = "default",
  } = options;

  const { setLoading } = useComponentLoading(componentId);

  const setSubmitting = useCallback(
    (isSubmitting: boolean) => {
      setLoading(isSubmitting, submitMessage, spinner);
    },
    [setLoading, submitMessage, spinner],
  );

  const setValidating = useCallback(
    (isValidating: boolean) => {
      setLoading(isValidating, validatingMessage, spinner);
    },
    [setLoading, validatingMessage, spinner],
  );

  const setCustomLoading = useCallback(
    (isLoading: boolean, message: string) => {
      setLoading(isLoading, message, spinner);
    },
    [setLoading, spinner],
  );

  return {
    setSubmitting,
    setValidating,
    setCustomLoading,
    clearLoading: () => setLoading(false),
  };
}

// ============================================================================
// DATA FETCHING LOADING HOOKS
// ============================================================================

interface UseDataLoadingOptions {
  componentId: string;
  initialMessage?: string;
  refetchMessage?: string;
  spinner?: "default" | "dots" | "wave";
}

/**
 * Hook for managing data fetching loading states
 */
export function useDataLoading(
  isLoading: boolean,
  isFetching: boolean,
  options: UseDataLoadingOptions,
) {
  const {
    componentId,
    initialMessage = "Loading data...",
    refetchMessage = "Refreshing...",
    spinner = "default",
  } = options;

  const { setLoading } = useComponentLoading(componentId);

  useEffect(() => {
    if (isLoading) {
      setLoading(true, initialMessage, spinner);
    } else if (isFetching) {
      setLoading(true, refetchMessage, spinner);
    } else {
      setLoading(false);
    }
  }, [
    isLoading,
    isFetching,
    initialMessage,
    refetchMessage,
    spinner,
    setLoading,
  ]);

  return {
    isInitialLoading: isLoading,
    isRefetching: isFetching && !isLoading,
    isAnyLoading: isLoading || isFetching,
  };
}

// ============================================================================
// BATCH OPERATIONS LOADING HOOKS
// ============================================================================

interface UseBatchLoadingOptions {
  componentId: string;
  operationName?: string;
  spinner?: "default" | "dots" | "wave";
}

/**
 * Hook for managing batch operations loading states
 */
export function useBatchLoading(options: UseBatchLoadingOptions) {
  const {
    componentId,
    operationName = "operation",
    spinner = "default",
  } = options;

  const { setLoading } = useComponentLoading(componentId);

  const setBatchLoading = useCallback(
    (isLoading: boolean, currentItem?: number, totalItems?: number) => {
      if (isLoading && currentItem !== undefined && totalItems !== undefined) {
        const message = `Processing ${operationName} ${currentItem} of ${totalItems}...`;
        setLoading(true, message, spinner);
      } else if (isLoading) {
        setLoading(true, `Processing ${operationName}...`, spinner);
      } else {
        setLoading(false);
      }
    },
    [setLoading, operationName, spinner],
  );

  return {
    setBatchLoading,
    setCompleted: () => setLoading(false),
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for debounced loading states
 */
export function useDebouncedLoading(
  isLoading: boolean,
  delay: number = 300,
  componentId: string = "debounced",
) {
  const { setLoading } = useComponentLoading(componentId);

  useEffect(() => {
    if (isLoading) {
      // Show loading immediately
      setLoading(true, "Loading...", "default");
    } else {
      // Delay hiding loading to prevent flashing
      const timer = setTimeout(() => {
        setLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isLoading, delay, setLoading]);

  return isLoading;
}

/**
 * Hook for minimum loading time
 */
export function useMinimumLoading(
  isLoading: boolean,
  minimumTime: number = 500,
  componentId: string = "minimum",
) {
  const { setLoading } = useComponentLoading(componentId);

  useEffect(() => {
    if (isLoading) {
      setLoading(true, "Loading...", "default");
    } else {
      // Ensure minimum loading time
      const timer = setTimeout(() => {
        setLoading(false);
      }, minimumTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minimumTime, setLoading]);

  return isLoading;
}
