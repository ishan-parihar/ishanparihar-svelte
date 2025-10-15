"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  useSession,
  signOut as nextAuthSignOut,
  getSession,
} from "next-auth/react";

type User = {
  email: string;
  name?: string;
  picture?: string;
  provider?: string;
  hasPassword?: boolean;
  id?: string;
  // Additional fields from older tables
  custom_picture?: boolean;
  newsletter_subscribed?: boolean;
  manually_unsubscribed?: boolean;
  is_active?: boolean;
  subscribed_at?: string;
  unsubscribed_at?: string;
  unsubscribe_token?: string;
  last_login?: string;
  login_count?: number;
  preferences?: any;
  role?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
} | null;

type UserAuthContextType = {
  user: User;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateUserData: (userData?: Partial<User>) => Promise<boolean | void>;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined,
);

export function UserAuthProvider({
  children,
  mounted = true,
}: {
  children: ReactNode;
  mounted?: boolean;
}) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();

  // Use refs to track the last processed session to prevent infinite loops
  const lastProcessedSessionRef = useRef<string>("");
  const isProcessingRef = useRef(false);

  // Extract complex expressions to separate variables for dependency tracking
  const userEmail = session?.user?.email || "";
  const userId = session?.user?.id || "";

  useEffect(() => {
    // Don't process session data if not mounted yet
    // This prevents hydration mismatches and ensures proper client-side initialization
    if (!mounted) {
      return;
    }
    // Prevent processing if already processing or if this is the same session we just processed
    const sessionId = userEmail || userId || "no-session";

    if (
      isProcessingRef.current ||
      lastProcessedSessionRef.current === sessionId
    ) {
      return;
    }

    console.log("UserAuthContext: Session status changed to", status);
    console.log("UserAuthContext: Session data:", session);

    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    // Mark as processing to prevent concurrent executions
    isProcessingRef.current = true;
    lastProcessedSessionRef.current = sessionId;

    if (session?.user) {
      console.log("UserAuthContext: Valid session found with user:", {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role,
      });

      // Create a user object from the session data
      const sessionUser = {
        id: (session.user as any).id || (session.user as any).sub,
        email: session.user.email || "",
        name: session.user.name || undefined,
        picture: session.user.image || (session.user as any).picture || null,
        provider: (session.user as any).provider || "email",
        role: (session.user as any).role || "user",
        custom_picture: (session.user as any).custom_picture || false,
        email_verified: true,
      };

      // Log the name for debugging
      console.log(
        "UserAuthContext: Setting user with name from session:",
        sessionUser.name,
      );

      // Set user data and mark as complete
      setUser(sessionUser);
      setIsLoading(false);
      isProcessingRef.current = false;
    } else {
      setUser(null);
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [session, status, userEmail, userId, mounted]);

  // Helper function to clear all auth state (legacy - NextAuth v5 handles this automatically)
  const clearAuthState = () => {
    // Clear cookies with standard approach
    const cookieNames = [
      // User cookies
      "userAuthenticated",
      "userEmail",
      "userName",
      "userPicture",
      "userProvider",
      "userAuthToken",
      "userRole",
      "userHasPassword",
      "userId",
      "userCustomPicture",
      "userNewsletterSubscribed",
      "userIsActive",
      "userSubscribedAt",
      "userUnsubscribeToken",
      "userLastLogin",
      "userLoginCount",
      "userPreferences",
      "userEmailVerified",
      "userCreatedAt",
      "userUpdatedAt",
      "user_session",

      // Admin cookies
      "adminAuthenticated",
      "adminEmail",
      "admin_session",

      // Legacy NextAuth cookies
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",

      // User-specific NextAuth cookies
      "user.session-token",
      "user.csrf-token",
      "user.callback-url",

      // Admin-specific NextAuth cookies
      "admin.session-token",
      "admin.csrf-token",
      "admin.callback-url",

      // Legacy Better Auth cookies
      "better-auth.session_token",
      "googleSignIn",
    ];

    // Use a more standard and reliable approach to clear cookies
    cookieNames.forEach((name) => {
      // Clear with path=/
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });

    // Clear all auth-related items from localStorage
    const localStorageKeys = [
      "userAuthenticated",
      "userEmail",
      "userName",
      "userPicture",
      "userProvider",
      "userAuthToken",
      "userRole",
      "userHasPassword",
      "userId",
      "userCustomPicture",
      "userNewsletterSubscribed",
      "userIsActive",
      "userSubscribedAt",
      "userUnsubscribeToken",
      "userLastLogin",
      "userLoginCount",
      "userPreferences",
      "userEmailVerified",
      "userCreatedAt",
      "userUpdatedAt",
      "user",
      "userData",
      "auth",
      "authToken",
      "session",
    ];

    localStorageKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear all auth-related items from sessionStorage
    localStorageKeys.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Also try to clear any items that might start with 'user' or 'auth'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("user") || key.startsWith("auth"))) {
        localStorage.removeItem(key);
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith("user") || key.startsWith("auth"))) {
        sessionStorage.removeItem(key);
      }
    }
  };

  // Function to update user data without a full page reload
  const updateUserData = async (userData?: Partial<User>) => {
    if (!user && !userData) return false;

    try {
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

      // If userData is provided, update the local state first
      if (userData) {
        console.log("Updating user data with provided values:", {
          ...userData,
          picture: userData.picture
            ? userData.picture.substring(0, 30) + "..."
            : undefined,
        });

        // If we're updating the name, also update the NextAuth session FIRST
        // This ensures the session has the latest name before we do anything else
        if (userData.name && updateSession) {
          try {
            console.log(
              "Updating NextAuth session with new name:",
              userData.name,
            );
            await updateSession({ name: userData.name });
            console.log("NextAuth session update successful");
          } catch (sessionError) {
            console.error("Error updating NextAuth session:", sessionError);
            // Continue anyway, we'll try again later
          }
        }

        // If userData includes updates to Supabase fields, send them to the server
        const supabaseFields = [
          "name",
          "picture",
          "custom_picture",
          "newsletter_subscribed",
          "preferences",
        ];

        // Filter out any special fields that start with underscore (used for local state only)
        const regularFields = Object.keys(userData).filter(
          (key) => !key.startsWith("_"),
        );

        const hasSupabaseUpdates = regularFields.some((key) =>
          supabaseFields.includes(key),
        );

        // Special handling for profile picture updates
        if (userData.picture) {
          // Set custom_picture to true when explicitly updating the picture
          // unless custom_picture is explicitly set to false
          if (userData.custom_picture !== false) {
            userData.custom_picture = true;
            console.log(
              "Setting custom_picture flag to true for profile picture update",
            );
          }
        }

        // Check if we need to update the database
        if (hasSupabaseUpdates) {
          // First check if the values are actually different from the current user data
          let hasActualChanges = false;

          if (user) {
            // Compare each field to see if it's actually changed
            for (const key of regularFields) {
              if (
                supabaseFields.includes(key) &&
                (userData as any)[key] !== (user as any)[key]
              ) {
                console.log(
                  `Field ${key} has changed from`,
                  (user as any)[key],
                  "to",
                  (userData as any)[key],
                );
                hasActualChanges = true;
                break;
              }
            }
          } else {
            // If we don't have user data to compare against, assume changes are needed
            hasActualChanges = true;
          }

          if (!hasActualChanges) {
            console.log("No actual changes detected, skipping database update");

            // Still update the local state
            setUser((prevUser) => {
              if (!prevUser) return prevUser;
              return { ...prevUser, ...userData };
            });

            return true;
          }

          try {
            // Update directly in the users table
            console.log("Sending update to database with data:", {
              ...Object.keys(userData).reduce((acc: any, key) => {
                acc[key] =
                  key === "picture" ? "[picture data]" : (userData as any)[key];
                return acc;
              }, {}),
            });

            const updateResponse = await fetch("/api/users/update-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
              body: JSON.stringify(userData),
              // Don't automatically follow redirects
              redirect: "manual",
            });

            let responseData;
            try {
              // Try to parse as JSON first
              responseData = await updateResponse.json();
            } catch (e) {
              // If that fails, get as text
              responseData = await updateResponse.text();
            }

            if (!updateResponse.ok) {
              // Check if this is a "No valid fields" error, which we can ignore
              if (
                typeof responseData === "string" &&
                responseData.includes("No valid fields to update")
              ) {
                console.log(
                  "Server reported no changes needed to update in the database",
                );
              } else if (
                typeof responseData === "object" &&
                responseData.error === "No valid fields to update"
              ) {
                console.log(
                  "Server reported no changes needed to update in the database",
                );
              } else {
                console.error("Failed to update user data:", responseData);
              }
            } else {
              console.log(
                "Successfully updated user data in database:",
                responseData,
              );

              // If the server indicates no changes were needed, that's still a success
              if (responseData.message === "No changes needed") {
                console.log(
                  "Server reported no changes were needed in the database",
                );
              }

              // If the server indicates session update is required, update the session again
              if (
                responseData.sessionUpdateRequired &&
                userData.name &&
                updateSession
              ) {
                try {
                  console.log(
                    "Server requested session update with name:",
                    userData.name,
                  );
                  await updateSession({ name: userData.name });
                  console.log("Session update after server request successful");
                } catch (sessionError) {
                  console.error(
                    "Error updating session after server request:",
                    sessionError,
                  );
                }
              }
            }
          } catch (updateError) {
            console.error("Error updating user data:", updateError);
          }
        }

        // Update the user state with the new data
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return { ...prevUser, ...userData };
        });

        // Update cookies if needed (for backward compatibility)
        if (userData.picture) {
          document.cookie = `userPicture=${encodeURIComponent(userData.picture)}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }
        if (userData.name) {
          document.cookie = `userName=${encodeURIComponent(userData.name)}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }

        // If we're updating the name, update the NextAuth session one more time
        // This is a final attempt to ensure the session is updated
        if (userData.name && updateSession) {
          try {
            console.log(
              "Final verification of NextAuth session update with name:",
              userData.name,
            );
            await updateSession({ name: userData.name });
            console.log(
              "Final NextAuth session update verification successful",
            );
          } catch (sessionError) {
            console.error(
              "Error in final NextAuth session update verification:",
              sessionError,
            );
          }
        }
      }

      // Only fetch fresh data if we're not just updating local state
      // This prevents unnecessary API calls that could cause infinite loops
      if (
        !userData ||
        Object.keys(userData).some((key) =>
          ["id", "email", "provider", "hasPassword"].includes(key),
        )
      ) {
        console.log("Refreshing session data");

        try {
          // Use the NextAuth session to get fresh user data
          // getSession is already imported at the top of the file

          // Get the updated session
          const updatedSession = await getSession();

          if (updatedSession?.user) {
            // Create a user object from the session data
            const sessionUser = {
              id:
                (updatedSession.user as any).id ||
                (updatedSession.user as any).sub,
              email: updatedSession.user.email || "",
              name: updatedSession.user.name || undefined,
              picture:
                updatedSession.user.image ||
                (updatedSession.user as any).picture ||
                null,
              provider: (updatedSession.user as any).provider || "email",
              role: (updatedSession.user as any).role || "user",
              custom_picture:
                (updatedSession.user as any).custom_picture || false,
              email_verified: true,
            };

            console.log("Refreshed session data with name:", sessionUser.name);
            setUser(sessionUser);
            return true;
          } else {
            console.error("Failed to get updated session data");
            return false;
          }
        } catch (error) {
          console.error("Error refreshing session data:", error);
          return false;
        }
      } else {
        // If we didn't fetch fresh data, just return true to indicate success
        return true;
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }

    return false;
  };

  const signOut = async () => {
    try {
      // Use the official NextAuth v5 signOut method with redirect
      await nextAuthSignOut({
        callbackUrl: "/",
        redirect: true,
      });
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Fallback: redirect to home page
      window.location.href = "/";
    }
  };

  // Provide appropriate values based on mounting state
  const contextValue = {
    user: mounted ? user : null,
    isLoading: mounted ? isLoading : true,
    signOut,
    updateUserData,
  };

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}
