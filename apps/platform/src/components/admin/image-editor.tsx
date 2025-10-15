"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { Slider } from "@/components/ui/slider";
import {
  RotateCw,
  ZoomIn,
  Crop as CropIcon,
  Move,
  X,
  Check,
} from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";
import NextImage from "next/image";

const ZOOM_STEP = 0.1;
const ROTATION_STEP = 15;

interface ImageEditorProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect || mediaWidth / mediaHeight,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

// Helper to check if URL is from an external domain
const isExternalUrl = (url: string): boolean => {
  if (!url) return false;

  // Handle base64 data URLs (these are same-origin)
  if (url.startsWith("data:")) return false;

  // Handle relative URLs (these are same-origin)
  if (url.startsWith("/")) return false;

  // For absolute URLs, check if the domain is different
  try {
    const urlObj = new URL(url);
    const locationObj = new URL(window.location.href);
    return urlObj.origin !== locationObj.origin;
  } catch (e) {
    // If URL parsing fails, assume it's not external
    return false;
  }
};

// Use a CORS proxy for external images
const getProxiedImageUrl = (url: string): string => {
  if (!isExternalUrl(url)) return url;

  // If it's from Supabase, we can bypass the proxy as Supabase should have CORS enabled
  if (url.includes("supabase.co")) return url;

  // For other external URLs, use a proxy service
  // Consider using your own proxy or a service like https://cors.io/
  return `https://cors-anywhere.herokuapp.com/${url}`;
};

export function ImageEditor({
  imageUrl,
  isOpen,
  onClose,
  onSave,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("crop");
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null,
  );
  const [isProcessingPreview, setIsProcessingPreview] = useState(false);

  // Process and prepare image URL for editing
  useEffect(() => {
    if (imageUrl) {
      try {
        // Clean up any previous blob URLs
        if (processedImageUrl && processedImageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(processedImageUrl);
        }

        // Set the image URL directly
        setProcessedImageUrl(imageUrl);
        setImageLoadError(null);
      } catch (error) {
        console.error("Error processing image URL:", error);
        setProcessedImageUrl(imageUrl);
        setImageLoadError(
          "Error preparing image for editing. Basic view enabled.",
        );
      }
    }
  }, [imageUrl, processedImageUrl]);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (imageUrl) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setScale(1);
      setRotate(0);
      setIsImageLoaded(false);
      setEditedImageUrl(null);
      setImageLoadError(null);
    }
  }, [imageUrl]);

  // Release any object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (editedImageUrl && editedImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(editedImageUrl);
      }
      if (processedImageUrl && processedImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [editedImageUrl, processedImageUrl]);

  // Handle image load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = e.currentTarget;

      // Store natural dimensions
      setImgWidth(naturalWidth);
      setImgHeight(naturalHeight);

      // Get the container dimensions
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 500;

      // Calculate how much we need to scale to fit the image within the container
      const widthRatio = containerWidth / naturalWidth;
      const heightRatio = containerHeight / naturalHeight;

      // Set initial scale to show the entire image comfortably
      // Use a slightly smaller value (0.9) to leave some margin
      let initialScale = Math.min(widthRatio, heightRatio) * 0.9;

      // Ensure the scale is reasonable
      initialScale = Math.min(Math.max(initialScale, 0.1), 1.0);

      console.log("Setting initial scale:", initialScale);
      console.log("Container dimensions:", containerWidth, containerHeight);
      console.log("Image dimensions:", naturalWidth, naturalHeight);

      setScale(initialScale);

      // Set a default crop with the 3:2 aspect ratio
      const initialCrop = centerAspectCrop(naturalWidth, naturalHeight, 3 / 2);
      setCrop(initialCrop);

      // Convert percentage crop to pixel crop
      const pixelCrop: PixelCrop = {
        unit: "px",
        x: Math.round((initialCrop.x / 100) * naturalWidth),
        y: Math.round((initialCrop.y / 100) * naturalHeight),
        width: Math.round((initialCrop.width / 100) * naturalWidth),
        height: Math.round((initialCrop.height / 100) * naturalHeight),
      };
      setCompletedCrop(pixelCrop);
      setIsImageLoaded(true);
    }
  };

  // Add custom styles for ReactCrop to ensure proper containment
  useEffect(() => {
    // Add custom styles for ReactCrop
    const style = document.createElement("style");
    style.textContent = `
      .editor-dialog {
        overflow: hidden ;
      }
      
      .editor-dialog-content {
        overflow: hidden ;
        display: flex;
        flex-direction: column;
      }
      
      .editor-container {
        flex: 1;
        position: relative;
        overflow: visible ;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ReactCrop {
        max-width: 100%;
        max-height: 100%;
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ReactCrop__child-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .ReactCrop__image {
        object-fit: contain;
        max-height: 100%;
        max-width: 100%;
        transform-origin: center;
      }
      
      .ReactCrop__crop-selection {
        border: 1px solid #2563eb;
      }
      
      .ReactCrop__drag-handle {
        width: 15px;
        height: 15px;
        background-color: #2563eb;
      }
      
      .editor-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle image load error
  const onImageError = () => {
    setImageLoadError(
      "Failed to load image. The image may be from an unsupported source.",
    );
    setIsImageLoaded(false);
  };

  // Apply edits to canvas
  const applyEdits = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) return;

    // Prevent multiple processing at once
    if (isProcessingPreview) return;
    setIsProcessingPreview(true);

    const img = imgRef.current;
    const canvas = canvasRef.current;

    try {
      // Get the original image dimensions
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;

      if (originalWidth === 0 || originalHeight === 0) {
        console.error(
          "Image has zero dimensions:",
          originalWidth,
          originalHeight,
        );
        setIsProcessingPreview(false);
        return;
      }

      // Set canvas dimensions for the preview (using a consistent size)
      const outputWidth = Math.round(completedCrop.width * 2);
      const outputHeight = Math.round(completedCrop.height * 2);

      if (outputWidth <= 0 || outputHeight <= 0) {
        console.error("Invalid canvas dimensions:", outputWidth, outputHeight);
        setIsProcessingPreview(false);
        return;
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        console.error("Failed to get canvas context");
        setIsProcessingPreview(false);
        return;
      }

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Clear canvas and set a white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation (convert degrees to radians)
      ctx.rotate((rotate * Math.PI) / 180);

      // Calculate the source coordinates based on the crop
      const cropX = (completedCrop.x / imgWidth) * originalWidth;
      const cropY = (completedCrop.y / imgHeight) * originalHeight;
      const cropWidth = (completedCrop.width / imgWidth) * originalWidth;
      const cropHeight = (completedCrop.height / imgHeight) * originalHeight;

      // Safety check on dimensions
      if (cropWidth <= 0 || cropHeight <= 0) {
        console.error("Invalid crop dimensions:", cropWidth, cropHeight);
        ctx.restore();
        setIsProcessingPreview(false);
        return;
      }

      // Apply scale
      const scaledCropWidth = cropWidth / scale;
      const scaledCropHeight = cropHeight / scale;
      const scaledX = cropX - (scaledCropWidth - cropWidth) / 2;
      const scaledY = cropY - (scaledCropHeight - cropHeight) / 2;

      // Draw the image centered and scaled
      ctx.drawImage(
        img,
        scaledX,
        scaledY,
        scaledCropWidth,
        scaledCropHeight,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height,
      );

      // Restore context state
      ctx.restore();

      // Convert canvas to data URL with high quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Release previous object URL if it exists
            if (editedImageUrl && editedImageUrl.startsWith("blob:")) {
              URL.revokeObjectURL(editedImageUrl);
            }
            const url = URL.createObjectURL(blob);
            setEditedImageUrl(url);
          } else {
            console.error("Failed to create blob from canvas");
          }
          setIsProcessingPreview(false);
        },
        "image/jpeg",
        0.95,
      );
    } catch (error) {
      console.error("Error applying edits to canvas:", error);
      if (error instanceof DOMException && error.name === "SecurityError") {
        setImageLoadError(
          "Cannot edit this image due to cross-origin restrictions.",
        );
      } else {
        setImageLoadError(
          "Error editing image. Try again or use a different image.",
        );
      }
      setIsProcessingPreview(false);
    }
  }, [
    completedCrop,
    scale,
    rotate,
    imgWidth,
    imgHeight,
    editedImageUrl,
    isProcessingPreview,
  ]);

  // Update canvas when crop, scale, or rotation changes
  useEffect(() => {
    if (
      isImageLoaded &&
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current
    ) {
      // Small delay to debounce frequent updates
      const timer = setTimeout(() => {
        applyEdits();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [completedCrop, scale, rotate, isImageLoaded, applyEdits]);

  // Handle save button click
  const handleSave = () => {
    if (!canvasRef.current || !imgRef.current) {
      console.error("Canvas or image reference is null");
      return;
    }

    try {
      // Create a temporary canvas with the original image dimensions
      const canvas = document.createElement("canvas");
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Save the current transformation matrix
      ctx.save();

      // Translate to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate the canvas
      if (rotate !== 0) {
        ctx.rotate((rotate * Math.PI) / 180);
      }

      // Scale the canvas if needed
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }

      // Draw the image centered
      ctx.drawImage(
        imgRef.current,
        -imgWidth / 2,
        -imgHeight / 2,
        imgWidth,
        imgHeight,
      );

      // Restore the transformation matrix
      ctx.restore();

      // If we have a crop, apply it
      if (completedCrop) {
        const croppedCanvas = document.createElement("canvas");
        const croppedCtx = croppedCanvas.getContext("2d");

        if (!croppedCtx) {
          throw new Error("Could not get cropped canvas context");
        }

        croppedCanvas.width = completedCrop.width;
        croppedCanvas.height = completedCrop.height;

        // Draw the cropped portion of the original canvas
        croppedCtx.drawImage(
          canvas,
          completedCrop.x,
          completedCrop.y,
          completedCrop.width,
          completedCrop.height,
          0,
          0,
          completedCrop.width,
          completedCrop.height,
        );

        // Get the data URL from the cropped canvas
        const dataUrl = croppedCanvas.toDataURL("image/jpeg", 0.95);

        // Generate unique file name for the edited image
        const fileName = `edited-${Date.now()}.jpg`;

        // First, update UI immediately with the data URL to provide instant feedback
        // This ensures the user sees the changes right away
        const tempImg = new Image();
        tempImg.onload = () => {
          console.log(
            "Image edited - showing temporary preview before upload completes",
          );
          onSave(dataUrl);
        };
        tempImg.src = dataUrl;

        // Convert the data URL to a file
        const blob = dataURLToBlob(dataUrl);
        const file = new File([blob], fileName, { type: "image/jpeg" });

        // Create formData to send to server
        const formData = new FormData();
        formData.append("file", file);

        // Call upload function directly with the edited image data
        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to upload edited image");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Edited image saved:", data.fileUrl);

            if (data.fileUrl) {
              // Create a temporary image to ensure the URL is loaded and cached
              const finalImg = new Image();
              finalImg.onload = () => {
                // Update with the final server URL once upload is complete
                console.log("Updating with final server URL:", data.fileUrl);
                onSave(data.fileUrl);
              };
              finalImg.src = data.fileUrl;
            }

            // Clean up any created blob URLs
            if (editedImageUrl && editedImageUrl.startsWith("blob:")) {
              URL.revokeObjectURL(editedImageUrl);
            }
          })
          .catch((error) => {
            console.error("Error saving edited image:", error);
            // We already saved with dataUrl, so no need to call onSave again
          });
      } else {
        // If no crop, just use the full canvas
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

        // Create a temporary image to ensure the URL is loaded and cached
        const tempImg = new Image();
        tempImg.onload = () => {
          // Call onSave with the new URL after the image is loaded
          onSave(dataUrl);
          onClose();
        };
        tempImg.src = dataUrl;
      }
    } catch (error) {
      console.error("Error saving image:", error);
      onClose();
    }
  };

  // Helper function to convert data URL to Blob
  const dataURLToBlob = (dataURL: string): Blob => {
    const parts = dataURL.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setScale(value[0]);
  };

  // Handle rotation
  const handleRotate = () => {
    setRotate((prev) => (prev + ROTATION_STEP) % 360);
  };

  return (
    <div className="editor-dialog">
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="editor-dialog-content sm:max-w-[95vw] w-[95vw] max-h-[90vh] h-[90vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>

          {imageLoadError && (
            <div className="bg-amber-50 text-amber-800 p-2 rounded-md mb-2 text-sm flex-shrink-0">
              {imageLoadError}
            </div>
          )}

          <Tabs
            defaultValue="crop"
            className="flex-1 flex flex-col overflow-hidden"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mx-auto mb-2 flex-shrink-0">
              <TabsTrigger value="crop" className="flex items-center gap-1">
                <CropIcon className="h-4 w-4" /> Crop
              </TabsTrigger>
              <TabsTrigger value="rotate" className="flex items-center gap-1">
                <RotateCw className="h-4 w-4" /> Rotate
              </TabsTrigger>
              <TabsTrigger value="zoom" className="flex items-center gap-1">
                <ZoomIn className="h-4 w-4" /> Zoom
              </TabsTrigger>
            </TabsList>

            <div
              ref={containerRef}
              className="editor-container bg-gray-50 rounded-md flex-grow"
            >
              {processedImageUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={3 / 2}
                  className={`${activeTab === "crop" ? "" : "pointer-events-none"}`}
                  minWidth={50}
                  minHeight={50}
                  keepSelection={true}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={processedImageUrl}
                    alt="Image to edit"
                    onLoad={onImageLoad}
                    onError={onImageError}
                    crossOrigin="anonymous"
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      transition: "transform 0.2s ease",
                    }}
                    className="editor-image"
                  />
                </ReactCrop>
              )}
            </div>

            <div className="flex items-center justify-center text-xs text-muted-foreground mt-2 flex-shrink-0">
              <CropIcon className="h-3 w-3 mr-1" /> Fixed 3:2 aspect ratio (blog
              standard)
            </div>

            <TabsContent
              value="rotate"
              className="space-y-3 mt-3 flex-shrink-0"
            >
              <div className="flex justify-center">
                <Button
                  onClick={handleRotate}
                  className="flex items-center"
                  size="sm"
                >
                  <RotateCw className="h-4 w-4 mr-2" /> Rotate 15°
                </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Current rotation: {rotate}°
              </div>
            </TabsContent>

            <TabsContent value="zoom" className="space-y-3 mt-3 flex-shrink-0">
              <div className="px-4 w-full max-w-md mx-auto">
                <Slider
                  defaultValue={[1]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={[scale]}
                  onValueChange={handleZoomChange}
                />
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Zoom level: {scale.toFixed(1)}x
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-2 flex-shrink-0" style={{ height: "130px" }}>
            <canvas ref={canvasRef} className="hidden" />

            <div className="h-full">
              <p className="text-xs font-medium mb-1">Preview:</p>
              <div className="relative bg-gray-50 rounded-md border h-[calc(100%-20px)]">
                <div className="flex items-center justify-center h-full">
                  {isProcessingPreview && !editedImageUrl && (
                    <div className="text-sm text-muted-foreground">
                      Processing preview...
                    </div>
                  )}
                  {editedImageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={editedImageUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                  {!editedImageUrl && !isProcessingPreview && (
                    <div className="text-sm text-muted-foreground">
                      Preparing preview...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2 mt-2 pt-2 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="gap-1"
              size="sm"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} className="gap-1" size="sm">
              <Check className="h-4 w-4" /> Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
