"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageCropper } from "./image-cropper";
import { useToast } from "@/components/ui/use-toast";

interface ExistingImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number;
  recommendedAspectRatio?: string;
  recommendedMinWidth?: number;
  recommendedMinHeight?: number;
}

export function ExistingImageCropper({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  aspectRatio = 3 / 2,
  recommendedAspectRatio = "3:2",
  recommendedMinWidth = 1200,
  recommendedMinHeight = 800,
}: ExistingImageCropperProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the image and convert it to a File object when the component mounts or imageUrl changes
  useEffect(() => {
    if (isOpen && imageUrl) {
      setIsLoading(true);
      setError(null);

      const fetchImage = async () => {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch image: ${response.status} ${response.statusText}`,
            );
          }

          const blob = await response.blob();
          const filename = imageUrl.split("/").pop() || "image.jpg";
          const file = new File([blob], filename, { type: blob.type });

          setImageFile(file);
        } catch (error) {
          console.error("Error fetching image:", error);
          setError(
            error instanceof Error ? error.message : "Failed to fetch image",
          );
          toast({
            title: "Error",
            description: "Failed to load the image for cropping.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchImage();
    }
  }, [isOpen, imageUrl, toast]);

  const handleCropComplete = (croppedBlob: Blob) => {
    onCropComplete(croppedBlob);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">
            <p>{error}</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : imageFile ? (
          <div className="p-4">
            <ImageCropper
              imageFile={imageFile}
              onCropComplete={handleCropComplete}
              onCancel={handleCancel}
              aspectRatio={aspectRatio}
              minWidth={recommendedMinWidth}
              minHeight={recommendedMinHeight}
            />

            {recommendedAspectRatio && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Recommended aspect ratio:</span>{" "}
                {recommendedAspectRatio}
              </p>
            )}

            {(recommendedMinWidth || recommendedMinHeight) && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Recommended minimum size:</span>
                {recommendedMinWidth && ` ${recommendedMinWidth}px width`}
                {recommendedMinWidth && recommendedMinHeight && " x "}
                {recommendedMinHeight && ` ${recommendedMinHeight}px height`}
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
