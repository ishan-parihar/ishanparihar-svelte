"use client";

import React, { useState } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface UpdateNameFormProps {
  maintainTab?: () => void;
}

export const UpdateNameForm = ({ maintainTab }: UpdateNameFormProps) => {
  const { user, updateUserData } = useUserAuth();
  const { update: updateSession } = useSession();
  const [name, setName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Update the name state when the user object changes
  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Please enter a valid name");
      return;
    }

    // Check if the name has actually changed (case-sensitive comparison)
    if (trimmedName === user?.name) {
      toast.info("No changes to save");
      return;
    }

    // Also check for case-insensitive match to avoid unnecessary updates
    if (trimmedName.toLowerCase() === user?.name?.toLowerCase()) {
      // If only the case is different, we'll still update but inform the user
      toast.info("Only letter case is changing");
    }

    setIsUpdating(true);
    const toastId = toast.loading("Updating your name...");

    try {
      console.log("Updating name from", user?.name, "to", trimmedName);

      // First update the database
      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({ name: trimmedName }), // Use the trimmed name
      });

      let responseData;
      try {
        // Try to parse as JSON first
        responseData = await response.json();
      } catch (e) {
        // If that fails, get as text
        responseData = await response.text();
        console.error("Error parsing response:", e);
      }

      if (!response.ok) {
        // Check if this is a "No valid fields" error, which we can handle gracefully
        if (
          typeof responseData === "object" &&
          responseData.error === "No valid fields to update"
        ) {
          console.log("No changes needed according to server");
          toast.success("Your name is already up to date", { id: toastId });
          return;
        } else if (
          typeof responseData === "string" &&
          responseData.includes("No valid fields to update")
        ) {
          console.log("No changes needed according to server");
          toast.success("Your name is already up to date", { id: toastId });
          return;
        }

        // Otherwise it's a real error
        const errorMessage =
          typeof responseData === "object"
            ? responseData.error
            : "Failed to update name";
        throw new Error(errorMessage || "Failed to update name");
      }

      console.log("Name update API response:", responseData);

      // If maintainTab function is provided, call it FIRST to ensure we stay on the settings tab
      // This must be done before any state updates that might trigger re-renders
      if (maintainTab) {
        maintainTab();
      }

      // Update the NextAuth session to ensure it has the latest name
      // This is the critical step to update the session state
      try {
        console.log("Updating NextAuth session with new name:", trimmedName);
        await updateSession({ name: trimmedName });
        console.log("NextAuth session update successful");
      } catch (sessionError) {
        console.error("Error updating NextAuth session:", sessionError);
      }

      // Update the user data in context AFTER session update
      // This prevents multiple refreshes
      const updateSuccess = await updateUserData({
        name: trimmedName, // Use the trimmed name for consistency
      });

      console.log(
        "Context update result:",
        updateSuccess ? "success" : "failed",
      );

      toast.success("Name updated successfully", { id: toastId });
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error(
        `Failed to update name: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: toastId },
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Your Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          disabled={isUpdating}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={isUpdating || name === user?.name}
        className="w-full sm:w-auto"
      >
        {isUpdating ? "Updating..." : "Update Name"}
      </Button>
    </form>
  );
};
