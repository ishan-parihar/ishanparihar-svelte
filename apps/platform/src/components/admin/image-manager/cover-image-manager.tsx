"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  X,
  Edit,
  ImageIcon,
  Upload,
  Grid3X3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ImageUploadForm } from "@/components/admin/image-manager/image-upload-form";
import { ImageGallery } from "@/components/admin/image-gallery";
import { ExistingImageCropper } from "@/components/admin/image-manager/existing-image-cropper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  normalizeImageUrl,
  validateImageUrl,
  getDefaultImageUrl,
} from "@/lib/imageUtils";

interface CoverImageManagerProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  aspectRatio?: number;
  recommendedAspectRatio?: string;
  recommendedMinWidth?: number;
  recommendedMinHeight?: number;
}

export function CoverImageManager({
  imageUrl,
  onChange,
  aspectRatio = 3 / 2,
  recommendedAspectRatio = "3:2",
  recommendedMinWidth = 1200,
  recommendedMinHeight = 800,
}: CoverImageManagerProps) {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadAttempts, setImageLoadAttempts] = useState(0);
  const { toast } = useToast();

  // Get default fallback image for admin context
  const DEFAULT_FALLBACK_IMAGE = getDefaultImageUrl("admin");

  // Function to handle image load error
  const handleImageError = () => {
    const originalUrl = imageUrl;
    const fixedUrl = normalizeImageUrl(imageUrl, {
      context: "admin",
      logFixes: true,
    });

    setImageError("Image could not be loaded");
    setIsImageLoading(false);

    console.error(`Failed to load image:`, {
      originalUrl,
      fixedUrl,
      attempts: imageLoadAttempts + 1,
    });

    // Show toast notification with more specific information
    toast({
      title: "Image Load Error",
      description:
        originalUrl !== fixedUrl
          ? "The image URL was corrected but still failed to load. The image may no longer exist."
          : "The featured image could not be loaded. Please select a different image.",
      variant: "destructive",
    });
  };

  // Function to handle image load success
  const handleImageLoad = () => {
    setImageError(null);
    setIsImageLoading(false);
    setImageLoadAttempts(0);
  };

  // Function to retry loading image
  const retryImageLoad = () => {
    setImageError(null);
    setIsImageLoading(true);
    setImageLoadAttempts((prev) => prev + 1);
  };

  // If an image is already set, show the preview
  if (imageUrl) {
    return (
      <div className="space-y-4">
        {/* Image Error Alert */}
        {imageError && (
          <Alert variant="destructive" className="rounded-none">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{imageError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={retryImageLoad}
                className="ml-2 rounded-none"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="relative w-full overflow-hidden rounded-none border dark:border-neutral-800">
          <div
            className="relative w-full"
            style={{
              aspectRatio: `${aspectRatio}`,
              display: "block", // Ensure block display to prevent whitespace
            }}
          >
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <Image
              src={
                imageError
                  ? DEFAULT_FALLBACK_IMAGE
                  : normalizeImageUrl(imageUrl, {
                      context: "admin",
                      logFixes: true,
                    })
              }
              alt="Cover preview"
              fill
              sizes="100vw"
              className="object-cover"
              priority
              onLoad={handleImageLoad}
              onError={handleImageError}
              onLoadStart={() => setIsImageLoading(true)}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => {
              onChange(null);
              setImageError(null);
              setImageLoadAttempts(0);
            }}
          >
            <X className="mr-2 h-4 w-4" /> Remove
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => {
              setIsGalleryOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Change
          </Button>
        </div>

        {/* Image Gallery for selecting existing images */}
        <ImageGallery
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={async (url, bucketPath, imageId) => {
            // Validate the selected image URL before proceeding
            const isValid = await validateImageUrl(url);
            if (!isValid) {
              toast({
                title: "Invalid Image",
                description:
                  "The selected image is not accessible. Please choose a different image.",
                variant: "destructive",
              });
              return;
            }

            // Set the selected image URL and open the cropper
            setSelectedImageUrl(url);
            setIsGalleryOpen(false);
            setIsCropperOpen(true);
          }}
          apiEndpoint="/api/images"
          uploadApiEndpoint="/api/image-manager/images/upload"
          bucketName="blog-images"
          allowUpload={true}
          recommendedAspectRatio={recommendedAspectRatio}
          recommendedMinWidth={recommendedMinWidth}
          recommendedMinHeight={recommendedMinHeight}
        />

        {/* Cropper for existing images */}
        <ExistingImageCropper
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageUrl={selectedImageUrl}
          onCropComplete={(croppedBlob) => {
            // Create a URL for the cropped blob
            const croppedUrl = URL.createObjectURL(croppedBlob);

            // Upload the cropped image
            const formData = new FormData();
            const filename =
              selectedImageUrl?.split("/").pop() || "cropped-image.jpg";
            const file = new File([croppedBlob], `cropped-${filename}`, {
              type: croppedBlob.type || "image/jpeg",
            });

            formData.append("file", file);
            formData.append("alt_text", "Blog cover image");
            formData.append("targetBucket", "blog-images");

            // Upload the cropped image
            fetch("/api/image-manager/images/upload", {
              method: "POST",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success && data.image && data.image.url) {
                  // Reset error state and set the new cropped image URL
                  setImageError(null);
                  setImageLoadAttempts(0);
                  onChange(data.image.url);
                  toast({
                    title: "Success",
                    description: "Image cropped and uploaded successfully.",
                  });
                } else {
                  throw new Error(
                    data.error || "Failed to upload cropped image",
                  );
                }
              })
              .catch((error) => {
                console.error("Error uploading cropped image:", error);
                // Fallback to using the blob URL temporarily
                onChange(croppedUrl);
                toast({
                  title: "Warning",
                  description:
                    "Using temporary image. The image may not persist after page refresh.",
                  variant: "destructive",
                });
              })
              .finally(() => {
                setIsCropperOpen(false);
              });
          }}
          aspectRatio={aspectRatio}
          recommendedAspectRatio={recommendedAspectRatio}
          recommendedMinWidth={recommendedMinWidth}
          recommendedMinHeight={recommendedMinHeight}
        />
      </div>
    );
  }

  // If no image is set, show the upload/select interface
  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="upload"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="rounded-none">
            <Upload className="h-4 w-4 mr-2" /> Upload New
          </TabsTrigger>
          <TabsTrigger value="select" className="rounded-none">
            <Grid3X3 className="h-4 w-4 mr-2" /> Select Existing
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="upload"
          className="border p-4 rounded-none dark:border-neutral-800"
        >
          <ImageUploadForm
            uploadApiEndpoint="/api/image-manager/images/upload"
            targetBucket="blog-images"
            aspectRatio={aspectRatio}
            recommendedAspectRatio={recommendedAspectRatio}
            recommendedMinWidth={recommendedMinWidth}
            recommendedMinHeight={recommendedMinHeight}
            onSuccess={async (imageData) => {
              if (imageData && imageData.url) {
                // Validate the uploaded image URL
                const isValid = await validateImageUrl(imageData.url);
                if (isValid) {
                  setImageError(null);
                  setImageLoadAttempts(0);
                  onChange(imageData.url);
                  toast({
                    title: "Image Uploaded",
                    description: "The cover image has been uploaded and set.",
                  });
                } else {
                  toast({
                    title: "Upload Error",
                    description:
                      "The uploaded image is not accessible. Please try again.",
                    variant: "destructive",
                  });
                }
              } else {
                toast({
                  title: "Upload Error",
                  description:
                    "Image upload completed but no valid URL was returned.",
                  variant: "destructive",
                });
              }
            }}
          />
        </TabsContent>
        <TabsContent
          value="select"
          className="border p-4 rounded-none dark:border-neutral-800"
        >
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Button
              onClick={() => setIsGalleryOpen(true)}
              className="rounded-none"
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Browse Image Library
            </Button>
          </div>

          {/* Image Gallery for selecting existing images */}
          <ImageGallery
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            onSelect={async (url, bucketPath, imageId) => {
              // Validate the selected image URL before proceeding
              const isValid = await validateImageUrl(url);
              if (!isValid) {
                toast({
                  title: "Invalid Image",
                  description:
                    "The selected image is not accessible. Please choose a different image.",
                  variant: "destructive",
                });
                return;
              }

              // Set the selected image URL and open the cropper
              setSelectedImageUrl(url);
              setIsGalleryOpen(false);
              setIsCropperOpen(true);
            }}
            apiEndpoint="/api/images"
            uploadApiEndpoint="/api/image-manager/images/upload"
            bucketName="blog-images"
            allowUpload={true}
            recommendedAspectRatio={recommendedAspectRatio}
            recommendedMinWidth={recommendedMinWidth}
            recommendedMinHeight={recommendedMinHeight}
          />
        </TabsContent>
      </Tabs>

      {/* Cropper for existing images */}
      <ExistingImageCropper
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageUrl={selectedImageUrl}
        onCropComplete={(croppedBlob) => {
          // Create a URL for the cropped blob
          const croppedUrl = URL.createObjectURL(croppedBlob);

          // Upload the cropped image
          const formData = new FormData();
          const filename =
            selectedImageUrl?.split("/").pop() || "cropped-image.jpg";
          const file = new File([croppedBlob], `cropped-${filename}`, {
            type: croppedBlob.type || "image/jpeg",
          });

          formData.append("file", file);
          formData.append("alt_text", "Blog cover image");
          formData.append("targetBucket", "blog-images");

          // Upload the cropped image
          fetch("/api/image-manager/images/upload", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success && data.image && data.image.url) {
                // Reset error state and set the new cropped image URL
                setImageError(null);
                setImageLoadAttempts(0);
                onChange(data.image.url);
                toast({
                  title: "Success",
                  description: "Image cropped and uploaded successfully.",
                });
              } else {
                throw new Error(data.error || "Failed to upload cropped image");
              }
            })
            .catch((error) => {
              console.error("Error uploading cropped image:", error);
              // Fallback to using the blob URL temporarily
              onChange(croppedUrl);
              toast({
                title: "Warning",
                description:
                  "Using temporary image. The image may not persist after page refresh.",
                variant: "destructive",
              });
            })
            .finally(() => {
              setIsCropperOpen(false);
            });
        }}
        aspectRatio={aspectRatio}
        recommendedAspectRatio={recommendedAspectRatio}
        recommendedMinWidth={recommendedMinWidth}
        recommendedMinHeight={recommendedMinHeight}
      />
    </div>
  );
}
