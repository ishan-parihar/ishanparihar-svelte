"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { generateDefaultAvatar, getProfilePicture } from "@/lib/avatar-utils";
import {
  Loader2,
  RefreshCw,
  Upload,
  Check,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface ProfileImageManagerProps {
  maintainTab?: () => void;
}

export function ProfileImageManager({ maintainTab }: ProfileImageManagerProps) {
  const { user, updateUserData } = useUserAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Effect to handle UI refresh after successful update without page reload
  useEffect(() => {
    if (shouldRefresh) {
      const timer = setTimeout(() => {
        console.log("Updating UI to show updated profile picture");

        // Call maintainTab first to ensure we stay on the settings tab
        if (maintainTab) {
          maintainTab();
        }

        // Don't use router.refresh() as it causes a full page reload
        // Instead, just update the state and let React handle the UI update
        setShouldRefresh(false); // Reset the flag
      }, 500); // Reduced to 500ms for better responsiveness

      return () => clearTimeout(timer);
    }
  }, [shouldRefresh, maintainTab]);

  // Function to reset profile picture to Google profile picture
  const handleResetToGooglePicture = async () => {
    if (!user || user.provider !== "google") return;

    setIsResetting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users/reset-profile-picture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset profile picture");
      }

      const data = await response.json();

      // Update the user data in the context
      await updateUserData({
        picture: data.picture,
        custom_picture: false,
      });

      // Clear any selected avatar
      setSelectedAvatar(null);
      setPreviewImage(null);

      // Clear any local storage that might have the old picture
      localStorage.removeItem("userPicture");
      sessionStorage.removeItem("userPicture");

      // Show success message
      setMessage({
        text: "Profile picture reset to Google profile picture!",
        type: "success",
      });

      // If maintainTab function is provided, call it to ensure we stay on the settings tab
      if (maintainTab) {
        maintainTab();
      }

      // Set flag to refresh the page after ensuring we're on the settings tab
      setShouldRefresh(true);
    } catch (error) {
      console.error("Error resetting profile picture:", error);
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Failed to reset profile picture. Please try again.",
        type: "error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Generate a set of random avatars for the user to choose from
  const generateRandomAvatars = () => {
    const avatars: string[] = [];
    for (let i = 0; i < 6; i++) {
      // Use a random seed based on the user's email plus a random number
      const seed = `${user?.email || "user"}-${Math.random().toString(36).substring(2, 8)}`;
      avatars.push(generateDefaultAvatar(seed, undefined));
    }
    setGeneratedAvatars(avatars);
  };

  // Initialize random avatars when component mounts
  if (generatedAvatars.length === 0) {
    generateRandomAvatars();
  }

  // Handle avatar selection
  const handleSelectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        text: "Please select an image file",
        type: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: "File size must be less than 5MB",
        type: "error",
      });
      return;
    }

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setSelectedAvatar(objectUrl);

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!user || !fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const file = fileInputRef.current.files[0];

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Log user info for debugging
      console.log("Uploading profile picture for user:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload image to server
      const response = await fetch("/api/users/upload-profile-picture", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for authentication
        headers: {
          // Add custom headers to help with debugging
          "X-User-Email": user.email || "",
          "X-User-ID": user.id || "",
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading profile picture:", errorData);

        // Try the direct update API as a fallback
        console.log("Trying direct update API as fallback...");

        // We need to convert the file to a data URL for the fallback
        if (file) {
          try {
            // Convert the file to a data URL
            const reader = new FileReader();
            const dataUrlPromise = new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            const dataUrl = await dataUrlPromise;

            const directResponse = await fetch(
              "/api/users/update-profile-picture-direct",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-User-Email": user.email || "",
                  "X-User-ID": user.id || "",
                },
                body: JSON.stringify({
                  pictureUrl: dataUrl,
                }),
                credentials: "include",
              },
            );

            if (!directResponse.ok) {
              const directErrorData = await directResponse.json();
              throw new Error(
                directErrorData.error ||
                  "Failed to update profile picture directly",
              );
            }

            const directData = await directResponse.json();
            console.log("Direct update successful:", directData);

            // Use the data URL as the file URL
            return {
              success: true,
              fileUrl: dataUrl,
            };
          } catch (directError) {
            console.error("Error with direct update:", directError);
            throw new Error(
              "Failed to upload profile picture through all available methods",
            );
          }
        } else {
          throw new Error(
            errorData.error ||
              "Failed to upload profile picture - no file available for fallback",
          );
        }
      }

      const data = await response.json();

      // Update the user data directly using the update-profile API
      try {
        const updateResponse = await fetch("/api/users/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify({
            picture: data.fileUrl,
            custom_picture: true,
          }),
          credentials: "include",
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(
            errorData.error || "Failed to update profile in database",
          );
        }

        console.log("Successfully updated profile directly in database");

        // Now update the user data in the context (but don't wait for it)
        updateUserData({
          picture: data.fileUrl,
          custom_picture: true,
        }).catch((err) => {
          console.error(
            "Error updating user data in context (non-blocking):",
            err,
          );
        });

        // Show success message
        setMessage({
          text: "Profile picture uploaded successfully!",
          type: "success",
        });

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Clear preview
        setPreviewImage(null);
        setSelectedAvatar(data.fileUrl);

        // Clear any local storage that might have the old picture
        localStorage.removeItem("userPicture");
        sessionStorage.removeItem("userPicture");

        // If maintainTab function is provided, call it to ensure we stay on the settings tab
        if (maintainTab) {
          maintainTab();
        }

        // Set flag to refresh the page after ensuring we're on the settings tab
        setShouldRefresh(true);
      } catch (updateError) {
        console.error("Error updating profile:", updateError);
        throw new Error("Failed to update profile in database");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Failed to upload profile picture. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle avatar update
  const handleUpdateAvatar = async () => {
    if (!selectedAvatar || !user) return;

    // If it's a blob URL from a file upload, use the file upload handler instead
    if (selectedAvatar.startsWith("blob:")) {
      return handleFileUpload();
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Call API to update the user's profile picture
      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({
          picture: selectedAvatar,
          custom_picture: true,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile picture");
      }

      // Update the user data directly using the update-profile API
      try {
        const updateResponse = await fetch("/api/users/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify({
            picture: selectedAvatar,
            custom_picture: true,
          }),
          credentials: "include",
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(
            errorData.error || "Failed to update profile in database",
          );
        }

        console.log("Successfully updated profile directly in database");

        // Now update the user data in the context (but don't wait for it)
        updateUserData({
          picture: selectedAvatar,
          custom_picture: true,
        }).catch((err) => {
          console.error(
            "Error updating user data in context (non-blocking):",
            err,
          );
        });

        // Log the update for debugging
        console.log("Profile picture update result:", {
          picture: selectedAvatar.substring(0, 30) + "...",
          custom_picture: true,
        });

        // Show success message
        setMessage({
          text: "Profile picture updated successfully!",
          type: "success",
        });

        // Clear any local storage that might have the old picture
        localStorage.removeItem("userPicture");
        sessionStorage.removeItem("userPicture");

        // If maintainTab function is provided, call it to ensure we stay on the settings tab
        if (maintainTab) {
          maintainTab();
        }

        // Set flag to refresh the page after ensuring we're on the settings tab
        setShouldRefresh(true);
      } catch (updateError) {
        console.error("Error updating profile:", updateError);
        throw new Error("Failed to update profile in database");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Failed to update profile picture. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new random avatars
  const handleGenerateNewAvatars = () => {
    generateRandomAvatars();
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2 text-primary dark:text-primary-foreground">
        Profile Picture
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Update your profile picture or choose from generated options
      </p>
      <div className="space-y-6">
        {/* Profile Picture Preview */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-white dark:border-gray-800 shadow-md">
              <AvatarImage
                src={
                  selectedAvatar ||
                  getProfilePicture(
                    {
                      email: user.email,
                      name: user.name,
                      picture: user.picture,
                      custom_picture: user.custom_picture,
                      provider: user.provider,
                    },
                    "large",
                  )
                } // Use large size for profile manager preview
                alt={user.name || user.email}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 text-xl">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {selectedAvatar && selectedAvatar !== user.picture && (
              <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {selectedAvatar && selectedAvatar !== user.picture
                ? "Preview (Not Saved)"
                : "Current Profile Picture"}
            </p>
          </div>
        </div>

        {/* Generated Avatars */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Choose a new avatar:</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateNewAvatars}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Generate New
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {generatedAvatars.map((avatar, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-md p-2 transition-all ${
                  selectedAvatar === avatar
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleSelectAvatar(avatar)}
              >
                <div className="flex justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={avatar}
                      alt={`Generated avatar ${index + 1}`}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="object-cover"
                    />
                  </Avatar>
                </div>
                {selectedAvatar === avatar && (
                  <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload option */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Upload your own image:</h3>
          <div
            className="border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="space-y-2">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Uploading image...
                  </p>
                </div>
                <Progress value={uploadProgress} className="h-1" />
                <p className="text-xs text-muted-foreground">
                  {uploadProgress}%
                </p>
              </div>
            ) : previewImage ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Click to change image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
                <p className="text-sm font-medium mb-1">Upload a photo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click to browse or drag and drop
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div
            className={`p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleUpdateAvatar}
            disabled={!selectedAvatar || isLoading || isResetting}
            className="w-full"
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Updating..."}
              </>
            ) : selectedAvatar && selectedAvatar !== user.picture ? (
              selectedAvatar.startsWith("blob:") ? (
                "Upload Profile Picture"
              ) : (
                "Save Profile Picture"
              )
            ) : (
              "Select a New Picture"
            )}
          </Button>

          {/* Reset to Google Profile Picture button - only show for Google accounts with custom pictures */}
          {user.provider === "google" && user.custom_picture && (
            <Button
              onClick={handleResetToGooglePicture}
              disabled={isLoading || isUploading || isResetting}
              variant="outline"
              className="w-full"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Google Picture
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
