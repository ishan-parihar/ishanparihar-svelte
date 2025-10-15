"use client";

import { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getProfilePicture } from "@/lib/avatar-utils";

export const UserSession = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      signIn(undefined, { callbackUrl: window.location.pathname });
    }
  }, [isLoading, session]);

  if (isLoading) return <div>Loading session...</div>;
  if (!session) return null;

  const user = session.user;

  // Get the appropriate profile picture based on user data and login type
  const picture = getProfilePicture(
    {
      email: user.email || "",
      name: user.name || undefined,
      picture: (user as any).picture,
      image: user.image || undefined,
      custom_picture: (user as any).custom_picture,
      provider: (user as any).provider,
    },
    "small",
  ); // Use small size for session display

  const handleSignOut = () => signOut({ callbackUrl: "/", redirect: true });

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <Image
          src={picture}
          alt={user.name || user.email || "User avatar"}
          width={32}
          height={32}
          className="rounded-full object-cover"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => console.log("Avatar loading failed")}
        />
      </div>
      <div className="flex flex-col">
        {user.name && <span className="text-sm font-medium">{user.name}</span>}
        <span className="text-xs text-gray-500">{user.email}</span>
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};
