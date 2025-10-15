import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash, Edit2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ImageEditor } from "./image-editor";
import { ImageGallery } from "./image-gallery";
import NextImage from "next/image";
import { createClient } from "@/utils/supabase/client";
import { getOptimizedAdminThumbnailUrl } from "@/lib/imageService.client";
import { api } from "@/lib/trpc-client";
import { toast } from "sonner";

interface ImageUploadProps {
  onChange?: (value: string) => void;
  value?: string;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  folder?: string;
  className?: string;
  startEmpty?: boolean;
  compact?: boolean;
  aspectRatio?: string;
  fullWidth?: boolean;
}

// Helper function to ensure the image URL is correctly formatted for display
const getDisplayUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // Handle relative URLs
  if (url.startsWith("/")) {
    return url;
  }

  // Handle absolute URLs
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Handle blob URLs
  if (url.startsWith("blob:")) {
    return url;
  }

  // Default case: assume it's a relative URL
  return url;
};

// Helper function to get optimized preview URL for admin components
const getOptimizedPreviewUrl = (
  supabase: any,
  url: string | null | undefined,
  bucketPath: string | null,
  folder?: string,
): string => {
  if (!url) return "";

  // Don't optimize blob URLs (temporary previews)
  if (url.startsWith("blob:")) {
    return url;
  }

  // Try to get optimized URL if we have bucket path
  if (bucketPath) {
    const optimizedUrl = getOptimizedAdminThumbnailUrl(
      supabase,
      folder || "blog-images",
      bucketPath,
    );
    if (optimizedUrl) {
      return optimizedUrl;
    }
  }

  // Fallback to original URL
  return getDisplayUrl(url);
};

export function ImageUpload({
  onChange,
  value,
  initialUrl,
  onUrlChange,
  folder,
  className,
  startEmpty = false,
  compact = false,
  aspectRatio,
  fullWidth = false,
}: ImageUploadProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => {
    return startEmpty ? "" : value || initialUrl || "";
  });
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(() => {
    // Initialize with a valid value or null if startEmpty
    return startEmpty ? null : value || initialUrl || null;
  });
  const [bucketPath, setBucketPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Initialize Supabase client for image optimization
  const supabase = createClient();

  // Update state when value or initialUrl changes externally
  useEffect(() => {
    const newValue = value || initialUrl || "";
    if (newValue) {
      console.log("Value changed externally:", newValue);
      // Only update if the value has actually changed to prevent unnecessary rerenders
      if (newValue !== currentImageUrl) {
        setCurrentImageUrl(newValue);
        setPreviewImageUrl(newValue);
        setImageLoaded(false); // Reset image loaded state when URL changes
      }
    } else if (newValue === "" && currentImageUrl !== "") {
      // Handle the case where value is cleared externally
      setCurrentImageUrl("");
      setPreviewImageUrl(null);
      setImageLoaded(false);
    }
  }, [value, initialUrl, currentImageUrl]);

  // Preload image when URL changes to ensure it's ready for display
  useEffect(() => {
    if (previewImageUrl) {
      const img = new Image();
      img.onload = () => {
        console.log("Image preloaded successfully:", previewImageUrl);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error("Failed to load image:", previewImageUrl);
        setError("Failed to load image. The URL may be invalid.");
        setImageLoaded(false);
      };
      img.src = getDisplayUrl(previewImageUrl);
    }
  }, [previewImageUrl]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Set image preview immediately using blob URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageUrl(objectUrl);
      console.log("Setting preview image to blob URL:", objectUrl);

      try {
        // Create form data
        const formData = new FormData();
        formData.append("file", file);

        // Add folder if provided
        if (folder) {
          formData.append("folder", folder);
        }

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Upload image to server
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to upload image");
        }

        const data = await response.json();
        setUploadProgress(100);

        // Remove the temporary blob URL preview
        if (previewImageUrl && previewImageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewImageUrl);
        }

        // Set the image URL and bucket path
        const fileUrl = data.fileUrl || "";
        console.log("Uploaded image URL:", fileUrl);

        setCurrentImageUrl(fileUrl);
        setPreviewImageUrl(fileUrl);
        setBucketPath(data.bucketPath || null);

        // Store the bucket path for later use
        if (data.bucketPath) {
          try {
            const storedPaths = JSON.parse(
              localStorage.getItem("image_bucket_paths") || "{}",
            );
            storedPaths[fileUrl] = data.bucketPath;
            localStorage.setItem(
              "image_bucket_paths",
              JSON.stringify(storedPaths),
            );
          } catch (err) {
            console.error("Error storing bucket path in localStorage:", err);
          }
        }

        // Update the form
        if (onChange) onChange(fileUrl);
        if (onUrlChange) onUrlChange(fileUrl);
      } catch (err: any) {
        setError(err.message || "Failed to upload image");
        // Don't reset the preview if upload fails - keep the blob preview
      } finally {
        setIsUploading(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onChange, previewImageUrl, folder, onUrlChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    },
    [handleFileUpload],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    // Clean up any blob URL
    if (previewImageUrl && previewImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewImageUrl);
    }

    setCurrentImageUrl("");
    setPreviewImageUrl(null);
    setImageLoaded(false);
    if (onChange) onChange("");
    if (onUrlChange) onUrlChange("");
  };

  const handleEditClick = () => {
    if (currentImageUrl || previewImageUrl) {
      setIsEditorOpen(true);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
  };

  const handleEditorSave = useCallback(
    (editedUrl: string) => {
      console.log("Editor saved with URL:", editedUrl);
      // Ensure we update both state variables with the new URL
      setPreviewImageUrl(editedUrl);
      setCurrentImageUrl(editedUrl);
      setImageLoaded(false); // Reset image loaded state to trigger reload
      // Update the form value
      if (onChange) onChange(editedUrl);
      if (onUrlChange) onUrlChange(editedUrl);
      setIsEditorOpen(false);
    },
    [onChange, onUrlChange],
  );

  const handleGalleryOpen = () => {
    setIsGalleryOpen(true);
  };

  const handleGalleryClose = () => {
    setIsGalleryOpen(false);
  };

  const handleGallerySelect = (
    imageUrl: string,
    imageBucketPath: string | null,
  ) => {
    // Update both state variables to ensure consistent display
    setCurrentImageUrl(imageUrl);
    setPreviewImageUrl(imageUrl);
    setBucketPath(imageBucketPath);
    setImageLoaded(false); // Reset image loaded state to trigger reload
    // Update the form value
    if (onChange) onChange(imageUrl);
    if (onUrlChange) onUrlChange(imageUrl);
    setIsGalleryOpen(false);
  };

  // Calculate container styles based on aspect ratio
  const containerStyle: React.CSSProperties = {};

  if (aspectRatio) {
    const [width, height] = aspectRatio.split("/").map(Number);
    if (!isNaN(width) && !isNaN(height)) {
      containerStyle.paddingBottom = `${(height / width) * 100}%`;
      containerStyle.position = "relative";
    }
  } else {
    // Default aspect ratio of 16:9
    containerStyle.paddingBottom = "56.25%";
    containerStyle.position = "relative";
  }

  return (
    <div
      className={`grid w-full gap-3 ${fullWidth ? "max-w-none" : ""} ${className || ""}`}
    >
      {/* Hidden preload image to force browser to load it */}
      {(previewImageUrl || currentImageUrl) && (
        <div style={{ display: "none" }}>
          <NextImage
            ref={imgRef as any}
            src={getOptimizedPreviewUrl(
              supabase,
              previewImageUrl || currentImageUrl,
              bucketPath,
              folder,
            )}
            alt=""
            width={1}
            height={1}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error(
                "Failed to load image:",
                previewImageUrl || currentImageUrl,
              );
              setError("Failed to load image. The URL may be invalid.");
            }}
          />
        </div>
      )}

      {(currentImageUrl || previewImageUrl) && !isUploading ? (
        <div
          className="relative rounded-md border overflow-hidden"
          style={{ width: "100%", height: "0", ...containerStyle }}
        >
          {/* Use Next.js Image component instead of img */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#f8f9fa",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {!imageLoaded && (
              <div className="text-sm text-gray-500">Loading image...</div>
            )}
            <NextImage
              src={getOptimizedPreviewUrl(
                supabase,
                previewImageUrl || currentImageUrl,
                bucketPath,
                folder,
              )}
              alt="Cover image preview"
              fill
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: imageLoaded ? "block" : "none",
              }}
            />
          </div>

          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleEditClick}
              className="h-8 w-8 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white"
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleRemoveImage}
              className="h-8 w-8 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          ref={dropZoneRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={handleButtonClick}
          className={`border-2 ${
            isDragging ? "border-primary" : "border-dashed"
          } rounded-md p-4 cursor-pointer hover:border-primary text-center transition-colors ${
            compact ? "py-2" : "py-8 md:py-12"
          } flex flex-col items-center justify-center`}
        >
          {isUploading ? (
            <div className="w-full max-w-xs">
              <div className="mb-2 text-center">
                <Upload className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">
                  Uploading image...
                </p>
              </div>
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-muted-foreground text-center mt-1">
                {uploadProgress}%
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                {previewImageUrl ? "Change Image" : "Upload Image"}
              </p>
              <p className="text-xs text-muted-foreground">
                Drop your file here or click to browse
              </p>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {currentImageUrl && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleRemoveImage}
            size="sm"
            disabled={isUploading}
            className="h-8 text-xs sm:text-sm"
          >
            <Trash className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{compact ? "" : "Remove"}</span>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGalleryOpen}
          disabled={isUploading}
          className="h-8 flex-grow sm:flex-grow-0 text-xs sm:text-sm"
        >
          Choose from Gallery
        </Button>
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
      />

      {/* Image Editor Component */}
      {(currentImageUrl || previewImageUrl) && (
        <ImageEditor
          imageUrl={currentImageUrl || previewImageUrl || ""}
          isOpen={isEditorOpen}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}

      {/* Image Gallery Component */}
      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={handleGalleryClose}
        onSelect={handleGallerySelect}
        apiEndpoint="/api/images"
        uploadApiEndpoint="/api/upload"
        bucketName={folder || "blog-images"}
        allowUpload={true}
      />
    </div>
  );
}
