"use client";

import { toast as sonnerToast } from "sonner";

// Define the toast function types
type ToastProps = {
  variant?: "default" | "destructive" | "success";
  title?: string;
  description?: string;
  [key: string]: any;
};

// Create a wrapper around sonner's toast function
const toast = ({ title, description, variant, ...props }: ToastProps) => {
  // Handle different variants
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...props,
    });
  }

  if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      ...props,
    });
  }

  // Default case
  return sonnerToast(title, {
    description,
    ...props,
  });
};

// Create a hook that returns the toast function
export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: sonnerToast.error,
    success: sonnerToast.success,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    promise: sonnerToast.promise,
    custom: sonnerToast.custom,
    loading: sonnerToast.loading,
  };
};
