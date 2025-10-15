"use client";

import { useUserAuth } from "@/contexts/UserAuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfilePicture } from "@/lib/avatar-utils";

export function UserAccountHeader() {
  const { user, signOut, isLoading } = useUserAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Function to safely decode URI components
  const safeDecodeURIComponent = (
    str: string | null | undefined,
  ): string | undefined => {
    if (!str) return undefined;
    try {
      return decodeURIComponent(str);
    } catch (e) {
      console.error("Error decoding URI component:", e);
      return str;
    }
  };

  // Get decoded user data
  const userName = safeDecodeURIComponent(user.name) || "";
  const userEmail = safeDecodeURIComponent(user.email) || "";
  const userPicture = safeDecodeURIComponent(user.picture) || "";

  // Get the appropriate profile picture based on user data and login type
  const profilePicture = getProfilePicture(
    {
      email: userEmail,
      name: userName,
      picture: userPicture,
      custom_picture: user.custom_picture,
      provider: user.provider,
    },
    "medium",
  ); // Use medium size for account header

  return (
    <div className="flex flex-row items-center justify-end w-full gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          {userName && (
            <span className="text-sm font-medium dark:text-white">
              {userName}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userEmail}
          </span>
        </div>
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white dark:border-gray-800 shadow-sm">
          <AvatarImage
            src={profilePicture}
            alt={userName || userEmail}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
            {userName
              ? userName.charAt(0).toUpperCase()
              : userEmail.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
