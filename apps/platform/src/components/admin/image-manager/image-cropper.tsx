"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RotateCw,
  ZoomIn,
  Crop as CropIcon,
  Move,
  X,
  Check,
} from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

const ZOOM_STEP = 0.1;
const ROTATION_STEP = 15;

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // Optional aspect ratio constraint
  minWidth?: number;
  minHeight?: number;
}

// Helper function to create a centered crop with the given aspect ratio
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

export function ImageCropper({
  imageFile,
  onCropComplete,
  onCancel,
  aspectRatio,
  minWidth,
  minHeight,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [activeTab, setActiveTab] = useState("crop");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create a URL for the image file
  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl);

      // Clean up the URL when the component unmounts
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  // Handle image load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;

    setOriginalWidth(naturalWidth);
    setOriginalHeight(naturalHeight);
    setIsImageLoaded(true);
    setImageError(null);

    // Always use the provided aspect ratio if available, otherwise use the natural aspect ratio
    const initialAspectRatio =
      aspectRatio !== undefined ? aspectRatio : naturalWidth / naturalHeight;
    const initialCrop = centerAspectCrop(width, height, initialAspectRatio);
    setCrop(initialCrop);
  };

  // Apply crop to canvas and get the result
  const getCroppedImage = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop || !canvasRef.current) {
      return null;
    }

    const img = imgRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to the cropped size
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = originalWidth / img.width;
    const scaleY = originalHeight / img.height;

    // Calculate source coordinates
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    // Save context state
    ctx.save();

    // Apply rotation if needed
    if (rotate !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Restore context state
    ctx.restore();

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/webp",
        0.95,
      );
    });
  };

  // Handle crop completion
  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      } else {
        throw new Error("Failed to create cropped image");
      }
    } catch (error) {
      console.error("Error creating cropped image:", error);
      setImageError("Failed to process the cropped image");
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Crop Image</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="crop">
            <CropIcon className="h-4 w-4 mr-2" />
            Crop
          </TabsTrigger>
          <TabsTrigger value="adjust">
            <Move className="h-4 w-4 mr-2" />
            Adjust
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crop" className="space-y-4">
          <div
            className="relative bg-gray-50 rounded-md overflow-hidden"
            style={{ minHeight: "300px" }}
          >
            {imageUrl && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio} // This enforces the aspect ratio constraint
                minWidth={minWidth || 50}
                minHeight={minHeight || 50}
                // Removed locked prop to allow resizing while maintaining aspect ratio
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ReactCrop requires a plain img element */}
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Image to crop"
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: "100%",
                    maxHeight: "400px",
                  }}
                />
              </ReactCrop>
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500">
                {imageError}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="adjust" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Zoom</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setScale(Math.max(0.5, scale - ZOOM_STEP))}
                >
                  <ZoomIn className="h-4 w-4 rotate-180" />
                </Button>
                <Slider
                  value={[scale * 100]}
                  min={50}
                  max={200}
                  step={10}
                  onValueChange={(value) => setScale(value[0] / 100)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setScale(Math.min(2, scale + ZOOM_STEP))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rotate</span>
                <span className="text-sm text-muted-foreground">{rotate}°</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotate((prev) => prev - ROTATION_STEP)}
                >
                  <RotateCw className="h-4 w-4 rotate-180" />
                </Button>
                <Slider
                  value={[rotate + 180]}
                  min={0}
                  max={360}
                  step={ROTATION_STEP}
                  onValueChange={(value) => setRotate(value[0] - 180)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotate((prev) => prev + ROTATION_STEP)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleCropComplete}
          disabled={!isImageLoaded || !completedCrop}
        >
          <Check className="h-4 w-4 mr-2" />
          Apply Crop
        </Button>
      </div>

      {/* Hidden canvas for processing the cropped image */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
