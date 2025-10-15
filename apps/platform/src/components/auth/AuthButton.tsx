"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface AuthButtonProps {
  children: ReactNode;
  modalView?: "signIn" | "signUp";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  requireAuth?: boolean;
  authAction?: () => void;
  callbackUrl?: string;
}

/**
 * Button that opens the auth modal when clicked
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Button content
 * @param {'signIn' | 'signUp'} props.modalView - Which view to show in the modal
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Additional click handler
 * @param {boolean} props.requireAuth - Whether to require authentication
 * @param {Function} props.authAction - Action to perform when authenticated
 * @param {string} props.callbackUrl - URL to redirect to after authentication (defaults to current path)
 */
export function AuthButton({
  children,
  modalView = "signIn",
  variant = "default",
  size = "default",
  className = "",
  onClick,
  requireAuth = true,
  authAction,
  callbackUrl,
}: AuthButtonProps) {
  const { openAuthModal } = useAuthModal();
  const { status } = useSession();
  const pathname = usePathname();

  const handleClick = () => {
    // Call the additional click handler if provided
    if (onClick) {
      onClick();
    }

    // If authentication is required
    if (requireAuth) {
      // If user is authenticated and we have an auth action
      if (status === "authenticated" && authAction) {
        authAction();
      }
      // If user is not authenticated, open the auth modal
      else if (status !== "authenticated") {
        // Use provided callbackUrl or current path
        const redirectUrl = callbackUrl || pathname || "";
        openAuthModal(modalView, redirectUrl);
        console.log(
          `Opening auth modal with view: ${modalView}, callbackUrl: ${redirectUrl}`,
        );
      }
    }
    // If authentication is not required, just open the modal
    else {
      // Use provided callbackUrl or current path
      const redirectUrl = callbackUrl || pathname || "";
      openAuthModal(modalView, redirectUrl);
      console.log(
        `Opening auth modal with view: ${modalView}, callbackUrl: ${redirectUrl}`,
      );
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
