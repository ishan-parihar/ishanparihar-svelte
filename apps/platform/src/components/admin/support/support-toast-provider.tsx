"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useSupportToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useSupportToast must be used within a SupportToastProvider",
    );
  }
  return context;
}

export function SupportToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "success", title, description });
    },
    [addToast],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "error", title, description, duration: 8000 });
    },
    [addToast],
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "warning", title, description, duration: 6000 });
    },
    [addToast],
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "info", title, description });
    },
    [addToast],
  );

  const getToastIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
    }
  };

  const getToastVariant = (type: Toast["type"]) => {
    switch (type) {
      case "error":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      case "warning":
        return "border-orange-200 bg-orange-50 text-orange-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "";
    }
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variant={getToastVariant(toast.type)}
            className={`relative transition-all duration-300 ease-in-out ${getToastStyles(toast.type)}`}
          >
            {getToastIcon(toast.type)}
            <div className="flex-1">
              <AlertTitle className="text-sm font-medium">
                {toast.title}
              </AlertTitle>
              {toast.description && (
                <AlertDescription className="text-sm">
                  {toast.description}
                </AlertDescription>
              )}
              {toast.action && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toast.action.onClick}
                    className="h-7 text-xs"
                  >
                    {toast.action.label}
                  </Button>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Predefined toast messages for common support scenarios
export const SupportToastMessages = {
  ticketCreated: (ticketNumber: string) => ({
    type: "success" as const,
    title: "Ticket Created",
    description: `Support ticket ${ticketNumber} has been created successfully.`,
  }),

  ticketUpdated: () => ({
    type: "success" as const,
    title: "Ticket Updated",
    description: "The support ticket has been updated successfully.",
  }),

  chatJoined: (sessionId: string) => ({
    type: "success" as const,
    title: "Chat Joined",
    description: `You have joined chat session ${sessionId}.`,
  }),

  chatEnded: () => ({
    type: "info" as const,
    title: "Chat Ended",
    description: "The chat session has been ended.",
  }),

  dataRefreshed: () => ({
    type: "success" as const,
    title: "Data Refreshed",
    description: "Support dashboard data has been updated.",
    duration: 3000,
  }),

  connectionError: () => ({
    type: "error" as const,
    title: "Connection Error",
    description:
      "Unable to connect to the server. Please check your internet connection.",
  }),

  permissionDenied: () => ({
    type: "error" as const,
    title: "Permission Denied",
    description: "You do not have permission to perform this action.",
  }),

  sessionExpired: () => ({
    type: "warning" as const,
    title: "Session Expired",
    description: "Your session has expired. Please sign in again.",
    action: {
      label: "Sign In",
      onClick: () => (window.location.href = "/auth/signin"),
    },
  }),
};
