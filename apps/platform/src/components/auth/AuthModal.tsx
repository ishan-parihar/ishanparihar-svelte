"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useSession } from "next-auth/react";

export function AuthModal() {
  const { isOpen, view, callbackUrl, closeAuthModal, switchView } =
    useAuthModal();
  const { status } = useSession();

  // Close modal if user becomes authenticated and handle redirection
  useEffect(() => {
    if (status === "authenticated" && isOpen) {
      console.log(
        "User authenticated, closing modal and redirecting to:",
        callbackUrl || "/account",
      );
      closeAuthModal();

      // If we have a callbackUrl, redirect to it
      if (callbackUrl && callbackUrl !== "/") {
        // Use a small delay to ensure the modal is closed before redirecting
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 100);
      } else {
        // If no specific callback URL, just refresh the current page to update auth state
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  }, [status, isOpen, closeAuthModal, callbackUrl]);

  // Handle Google sign-in within the modal context
  const handleGoogleSignIn = async () => {
    try {
      // Import signIn dynamically to ensure it's only loaded on the client
      const { signIn } = await import("next-auth/react");

      // Use NextAuth.js for Google authentication with redirect: false
      const result = await signIn("google", {
        callbackUrl: callbackUrl || "/account",
        redirect: false,
      });

      console.log("Modal Google sign-in result:", result);

      // If there's an error, log it but don't handle it here
      // The SignInForm component will handle the error display
      if (result?.error) {
        console.error("Modal Google sign-in error:", result.error);
        return;
      }

      // If there's a URL, this means NextAuth wants us to redirect to Google's OAuth page
      if (result?.url) {
        // Check if the URL is a Google OAuth URL (contains accounts.google.com)
        if (result.url.includes("accounts.google.com")) {
          console.log("Modal redirecting to Google OAuth page:", result.url);
          // This will open the Google sign-in popup/page
          window.location.href = result.url;
        } else {
          // This is likely the callback URL after successful authentication
          console.log("Authentication successful, redirecting to:", result.url);
          window.location.href = result.url;
        }
      } else {
        console.warn("No URL returned from signIn, unexpected behavior");
      }
    } catch (error) {
      console.error("Error in modal Google sign-in:", error);
    }
  };

  // Handle modal close when backdrop is clicked
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAuthModal();
    }
  };

  // Handle switching between sign-in and sign-up views
  const handleSwitchToSignUp = () => {
    console.log("Switching to sign-up view");
    switchView("signUp");
  };

  const handleSwitchToSignIn = () => {
    console.log("Switching to sign-in view");
    switchView("signIn");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} data-auth-modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mainheading">
            {view === "signIn" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="font-ui">
            {view === "signIn"
              ? "Sign in to your account to access all features"
              : "Create a new account to get started"}
          </DialogDescription>
        </DialogHeader>

        {view === "signIn" ? (
          <SignInForm
            onGoogleSignIn={handleGoogleSignIn}
            inModal={true}
            onSwitchToSignUp={handleSwitchToSignUp}
            callbackUrl={callbackUrl || "/account"}
          />
        ) : (
          <SignUpForm
            inModal={true}
            onSwitchToSignIn={handleSwitchToSignIn}
            callbackUrl={callbackUrl || "/account"}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
