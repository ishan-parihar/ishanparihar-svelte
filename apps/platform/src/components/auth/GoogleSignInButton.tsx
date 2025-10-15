"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const GoogleSignInButton = ({
  onClick,
  isLoading = false,
}: GoogleSignInButtonProps) => {
  // Handle the click event
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Log the click event
    console.log("Google sign-in button clicked");

    // Call the onClick handler
    onClick();
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 dark:bg-black dark:hover:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-none transition-all duration-200 rounded-none font-ui"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white" />
      ) : (
        <FcGoogle className="h-5 w-5" />
      )}
      <span className="font-medium">
        Sign {isLoading ? "ing" : ""} in with Google
      </span>
    </Button>
  );
};
