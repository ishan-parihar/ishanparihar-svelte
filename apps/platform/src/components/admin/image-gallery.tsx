import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Search,
  Loader2,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import NextImage from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ImageUploadForm } from "@/components/admin/image-manager/image-upload-form";
import { createClient } from "@/utils/supabase/client";
import { getOptimizedAdminThumbnailUrl } from "@/lib/imageService.client";

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    imageUrl: string,
    bucketPath: string | null,
    imageId: string | null,
  ) => void;
  apiEndpoint?: string; // Custom API endpoint for fetching images
  uploadApiEndpoint?: string; // Custom API endpoint for uploading images
  bucketName?: string; // Bucket name for context
  allowUpload?: boolean; // Whether to show the upload button
  recommendedAspectRatio?: string; // Format: "16:9", "4:3", "1:1", etc.
  recommendedMinWidth?: number;
  recommendedMinHeight?: number;
}

type GalleryImage = {
  id?: string;
  name: string;
  url: string;
  bucketPath: string | null;
  size: number;
  created_at: string;
  isAccessible?: boolean;
};

// Define a fallback image that exists in your public directory
const DEFAULT_FALLBACK_IMAGE = "/uploads/default-blog-image.jpg";

// Create a standard fallback image object
const createFallbackImage = () => ({
  name: "default-blog-image.jpg",
  url: DEFAULT_FALLBACK_IMAGE,
  bucketPath: "default",
  size: 0,
  created_at: new Date().toISOString(),
  isAccessible: true,
});

export function ImageGallery({
  isOpen,
  onClose,
  onSelect,
  apiEndpoint = "/api/images",
  uploadApiEndpoint = "/api/upload",
  bucketName = "blog-images",
  allowUpload = true,
  recommendedAspectRatio,
  recommendedMinWidth,
  recommendedMinHeight,
}: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize Supabase client for image optimization
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Loading images...");

    try {
      // Add a random query parameter to avoid caching
      const timestamp = new Date().getTime();
      // Include the bucket name in the request
      const url = `${apiEndpoint}?_=${timestamp}&bucket=${bucketName}`;
      console.log(`Fetching images from API endpoint ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Error response from API: ${response.status} ${response.statusText}`,
          errorText,
        );
        setError("Error loading images");
        setStatusMessage(
          `Failed to load images: ${response.status} ${response.statusText}`,
        );
        setIsLoading(false);

        // Add a fallback image
        const fallbackImage = createFallbackImage();
        setImages([fallbackImage]);
        setFilteredImages([fallbackImage]);
        setSelectedImage(fallbackImage.url);
        return;
      }

      const data = await response.json();
      console.log("Images API response:", data);

      if (data.success && data.images && Array.isArray(data.images)) {
        setStatusMessage(`Found ${data.images.length} images`);

        // Make sure all images have the necessary properties and are accessible
        const processedImages = data.images.map((img: any) => ({
          id: img.id || null,
          name: img.filename_original || img.alt_text || "Unnamed image",
          url: img.url || DEFAULT_FALLBACK_IMAGE,
          bucketPath: img.supabase_path || null,
          size: img.size_bytes || 0,
          created_at: img.created_at || new Date().toISOString(),
          isAccessible: true,
        }));

        if (processedImages.length === 0) {
          console.log("No images found in response");
          setStatusMessage(
            "No images found in your library. Upload one to get started.",
          );
        } else {
          console.log(`Processing ${processedImages.length} images`);
          setStatusMessage(null);
        }

        setImages(processedImages);
        setFilteredImages(processedImages);

        // Pre-select the first image if we have any and no image is currently selected
        if (processedImages.length > 0) {
          // Use a local variable to avoid dependency issues
          setSelectedImage((prevSelected) => {
            if (!prevSelected) {
              return processedImages[0].url;
            }
            return prevSelected;
          });
        }
      } else {
        console.warn(
          "API returned unsuccessful response or no images array:",
          data,
        );
        let errorMessage =
          "No images found in your library. Upload one to get started.";
        if (
          data.error &&
          data.error.includes("blog-images bucket could not be found")
        ) {
          errorMessage =
            "Error loading images\n\nBlog-images bucket could not be found or created.";
          setError(errorMessage);
        }

        setStatusMessage(errorMessage);

        // Add a fallback image only if there are no other images
        const fallbackImage = createFallbackImage();
        setImages([fallbackImage]);
        setFilteredImages([fallbackImage]);
        setSelectedImage(fallbackImage.url);
      }
    } catch (err: any) {
      console.error("Error fetching images:", err);
      setError("Error loading images");
      setStatusMessage("Failed to load images. Please try again.");

      // Add a fallback image if there's an error
      const fallbackImage = createFallbackImage();
      setImages([fallbackImage]);
      setFilteredImages([fallbackImage]);
      setSelectedImage(fallbackImage.url);
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, bucketName]);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      // Reset everything when opening
      setSelectedImage(null);

      const loadImages = async () => {
        if (isMounted) {
          await fetchImages();
        }
      };

      loadImages();
    } else {
      // Reset state when gallery closes
      setSelectedImage(null);
      setSearchQuery("");
      setError(null);
      setStatusMessage(null);
    }

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [isOpen, fetchAttempts, fetchImages]);

  // Filter images when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredImages(images);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredImages(
        images.filter((image) => image.name.toLowerCase().includes(query)),
      );
    }
  }, [searchQuery, images]);

  const handleSelect = () => {
    if (selectedImage) {
      // Find the selected image to get both URL and bucket path
      const selected = images.find((img) => img.url === selectedImage);

      if (selected) {
        onSelect(selected.url, selected.bucketPath, selected.id || null);
      } else {
        onSelect(selectedImage, null, null);
      }
      onClose();
    }
  };

  const retryFetch = () => {
    setFetchAttempts((prev) => prev + 1);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSupabaseHelp = () => {
    window.open("https://supabase.com/dashboard", "_blank");
  };

  // Handle image deletion
  const handleDeleteImage = async (
    image: GalleryImage,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Prevent selecting the image when clicking delete

    // Don't allow deleting the default image
    if (
      image.bucketPath === "default" ||
      image.url === DEFAULT_FALLBACK_IMAGE
    ) {
      setDeleteError("Cannot delete the default image");
      return;
    }

    setImageToDelete(image);
    setShowDeleteConfirm(true);
  };

  // Confirm and process image deletion
  const confirmDeleteImage = async () => {
    if (!imageToDelete) {
      setDeleteError("No image selected for deletion");
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Determine which API endpoint to use based on the context
      let endpoint = "/api/images";
      let payload: any = {};

      // If we have an ID, use the image-manager API which uses IDs
      if (imageToDelete.id) {
        endpoint = "/api/image-manager/images";
        payload = { id: imageToDelete.id };
        console.log(
          "Using image-manager API for deletion with ID:",
          imageToDelete.id,
        );
      }
      // Otherwise use the bucketPath for the legacy API
      else if (imageToDelete.bucketPath) {
        endpoint = "/api/images";
        payload = { bucketPath: imageToDelete.bucketPath };
        console.log(
          "Using legacy API for deletion with bucketPath:",
          imageToDelete.bucketPath,
        );
      }
      // If we don't have either ID or bucketPath, but we have a URL, try to extract the path from the URL
      else if (
        imageToDelete.url &&
        imageToDelete.url.includes("/storage/v1/object/public/")
      ) {
        try {
          // Extract the bucket and path from the URL
          const urlParts = imageToDelete.url.split(
            "/storage/v1/object/public/",
          );
          if (urlParts.length > 1) {
            const pathWithBucket = urlParts[1];
            const firstSlashIndex = pathWithBucket.indexOf("/");

            if (firstSlashIndex > 0) {
              const bucketName = pathWithBucket.substring(0, firstSlashIndex);
              const path = pathWithBucket.substring(firstSlashIndex + 1);

              endpoint = "/api/images";
              payload = { bucketPath: path, bucket: bucketName };
              console.log(
                `Extracted bucket: ${bucketName} and path: ${path} from URL for deletion`,
              );
            }
          }
        } catch (error) {
          console.error("Error extracting path from URL:", error);
        }
      }

      // If we still don't have a valid payload, throw an error
      if (!payload.id && !payload.bucketPath) {
        throw new Error("Image has no ID or bucketPath for deletion");
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete image");
      }

      // Update the image list after successful deletion
      setImages((prevImages) =>
        prevImages.filter((img) => img.url !== imageToDelete.url),
      );

      // Also update filtered images
      setFilteredImages((prevImages) =>
        prevImages.filter((img) => img.url !== imageToDelete.url),
      );

      // Reset selection if the deleted image was selected
      if (selectedImage === imageToDelete.url) {
        setSelectedImage(null);
      }

      // Reset the image to delete
      setImageToDelete(null);
      setShowDeleteConfirm(false);

      // Show success message
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });

      setStatusMessage("Image deleted successfully");
      setTimeout(() => {
        if (setStatusMessage) setStatusMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error("Error deleting image:", error);
      setDeleteError(error.message || "Failed to delete image");

      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteImage = () => {
    setImageToDelete(null);
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Select an Image</DialogTitle>
            <DialogDescription>
              Browse and select an existing image from your media library
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={retryFetch}
              title="Refresh images"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {allowUpload && (
              <Button
                variant="default"
                onClick={() => setShowUploadForm(true)}
                className="whitespace-nowrap"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            )}
          </div>

          {showUploadForm && (
            <div className="border rounded-md p-4 mb-4">
              <div className="flex justify-between items-center mb-2 bg-background z-10 pb-2 border-b">
                <h3 className="text-lg font-medium">Upload New Image</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUploadForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ImageUploadForm
                uploadApiEndpoint={uploadApiEndpoint}
                bucketName={bucketName}
                recommendedAspectRatio={recommendedAspectRatio}
                recommendedMinWidth={recommendedMinWidth}
                recommendedMinHeight={recommendedMinHeight}
                onSuccess={(imageData) => {
                  // Validate the image data
                  if (!imageData || !imageData.id) {
                    console.error(
                      "Upload success callback received invalid image data:",
                      imageData,
                    );
                    toast({
                      title: "Upload Error",
                      description:
                        "Upload completed but image data is missing or invalid.",
                      variant: "destructive",
                    });
                    return;
                  }

                  console.log(
                    "Image upload successful, received data:",
                    imageData,
                  );

                  // Add the new image to the list
                  const newImage: GalleryImage = {
                    id: imageData.id,
                    name:
                      imageData.filename_original ||
                      imageData.alt_text ||
                      "Unnamed Image",
                    url: imageData.url,
                    bucketPath: imageData.supabase_path || imageData.bucketPath,
                    size: imageData.size_bytes || imageData.size || 0,
                    created_at:
                      imageData.created_at || new Date().toISOString(),
                    isAccessible: true,
                  };

                  setImages((prevImages) => [newImage, ...prevImages]);
                  setFilteredImages((prevImages) => [newImage, ...prevImages]);
                  setSelectedImage(newImage.url);
                  setShowUploadForm(false);

                  // Show success message
                  toast({
                    title: "Success",
                    description: "Image uploaded and added to gallery.",
                  });
                }}
                onCancel={() => setShowUploadForm(false)}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error loading images</p>
                <p className="text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={retryFetch}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error deleting image</p>
                <p className="text-sm">{deleteError}</p>
              </div>
            </div>
          )}

          {statusMessage && !error && (
            <div className="text-center p-2 text-muted-foreground text-sm mb-2">
              {statusMessage}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading images...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[40vh] p-1">
              {filteredImages.length > 0 ? (
                filteredImages.map((image) => (
                  <Card
                    key={image.url}
                    className={`relative overflow-hidden cursor-pointer transition-all border ${
                      selectedImage === image.url
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <div className="aspect-[16/9] relative bg-muted">
                      <NextImage
                        src={
                          getOptimizedAdminThumbnailUrl(
                            supabase,
                            bucketName,
                            image.bucketPath,
                          ) || image.url
                        }
                        alt={image.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover"
                        onError={(e) => {
                          console.error(`Failed to load image: ${image.url}`);
                          // Only set fallback if the image actually failed to load
                          // Check if this is already the fallback to prevent infinite loops
                          if (image.url !== DEFAULT_FALLBACK_IMAGE) {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_FALLBACK_IMAGE;

                            // Mark this image as inaccessible in our state to prevent reselection
                            setImages((prev) =>
                              prev.map((img) =>
                                img.url === image.url
                                  ? { ...img, isAccessible: false }
                                  : img,
                              ),
                            );

                            // If this was the selected image, select another one
                            if (selectedImage === image.url) {
                              const accessibleImages = images.filter(
                                (img) =>
                                  img.url !== image.url &&
                                  img.isAccessible !== false,
                              );
                              if (accessibleImages.length > 0) {
                                setSelectedImage(accessibleImages[0].url);
                              } else {
                                setSelectedImage(null);
                              }
                            }
                          }
                        }}
                      />
                      {selectedImage === image.url && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}

                      {/* Delete button - don't show for default image */}
                      {image.bucketPath !== "default" && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7 bg-red-500/80 hover:bg-red-600 text-white"
                          onClick={(e) => handleDeleteImage(image, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(image.size)} •{" "}
                        {formatDate(image.created_at)}
                      </p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
                  <FolderPlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No images match your search
                  </p>
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedImage || isLoading}
            >
              Select Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{imageToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeleteImage}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
