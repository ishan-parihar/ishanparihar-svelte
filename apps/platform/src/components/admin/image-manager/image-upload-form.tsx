"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Crop as CropIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NextImage from "next/image";
import { ImageCropper } from "./image-cropper";

interface ImageUploadFormProps {
  onSuccess?: (imageData: any) => void;
  onCancel?: () => void;
  uploadApiEndpoint?: string;
  bucketName?: string;
  targetBucket?: string; // Specific bucket to use for upload
  recommendedAspectRatio?: string; // Format: "16:9", "4:3", "1:1", etc.
  recommendedMinWidth?: number;
  recommendedMinHeight?: number;
  aspectRatio?: number; // Direct aspect ratio value (e.g., 1.5 for 3:2)
}

export function ImageUploadForm({
  onSuccess,
  onCancel,
  uploadApiEndpoint = "/api/image-manager/images/upload",
  bucketName = "site-images",
  targetBucket,
  recommendedAspectRatio,
  recommendedMinWidth,
  recommendedMinHeight,
  aspectRatio: directAspectRatio,
}: ImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use direct aspect ratio if provided, otherwise parse from string format
  const aspectRatio =
    directAspectRatio !== undefined
      ? directAspectRatio
      : recommendedAspectRatio
        ? (() => {
            const [width, height] = recommendedAspectRatio
              .split(":")
              .map(Number);
            return width && height ? width / height : undefined;
          })()
        : undefined;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Auto-fill alt text from filename if empty
      if (!altText) {
        const fileName = selectedFile.name
          .split(".")[0]
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setAltText(fileName);
      }

      // Show the cropper after selecting a file
      setShowCropper(true);
    }
  };

  // Handle crop completion
  const handleCropComplete = (blob: Blob) => {
    // Create a new preview URL from the cropped blob
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clean up old preview URL
    }

    const croppedUrl = URL.createObjectURL(blob);
    setPreviewUrl(croppedUrl);
    setCroppedBlob(blob);
    setShowCropper(false);

    // Create a file name for the cropped image
    const fileExtension = file?.name.split(".").pop() || "webp";
    const fileName = `cropped-${Date.now()}.${fileExtension}`;

    // We'll use the blob for upload, but keep the original file reference for metadata
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!altText) {
      toast({
        title: "Error",
        description: "Alt text is required for accessibility",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Create form data
      const formData = new FormData();

      // Use the cropped blob if available, otherwise use the original file
      if (croppedBlob) {
        // Create a File object from the Blob
        const fileExtension = file.name.split(".").pop() || "webp";
        const croppedFile = new File(
          [croppedBlob],
          `cropped-${file.name.replace(/\.[^/.]+$/, "")}.${fileExtension}`,
          { type: croppedBlob.type || "image/webp" },
        );
        formData.append("file", croppedFile);
      } else {
        formData.append("file", file);
      }

      // Handle different API endpoints
      if (uploadApiEndpoint === "/api/upload") {
        // For blog images API
        if (bucketName) {
          formData.append("bucket", bucketName);
        }
      } else {
        // For image manager API
        formData.append("alt_text", altText);

        if (caption) {
          formData.append("caption", caption);
        }

        if (tags) {
          formData.append("tags", tags);
        }

        // Add targetBucket if specified
        if (targetBucket) {
          formData.append("targetBucket", targetBucket);
          console.log(`Using target bucket: ${targetBucket} for upload`);
        }
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 200);

      // Upload image to server
      const response = await fetch(uploadApiEndpoint, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Image upload API error:", errorData);

        // Create a more detailed error message if available
        let errorMessage = errorData.error || "Failed to upload image";
        if (errorData.details || errorData.hint) {
          errorMessage += ` (${errorData.details || errorData.hint})`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUploadProgress(100);

      if (data.success) {
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });

        // Reset form
        setFile(null);
        setAltText("");
        setCaption("");
        setTags("");
        setPreviewUrl(null);

        // Call onSuccess callback with the uploaded image data
        if (onSuccess) {
          onSuccess(data.image);
        }
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);

      // Create a more user-friendly error message
      let errorMessage = error.message || "An unexpected error occurred";

      // If it's an RLS error, provide a more helpful message
      if (errorMessage.includes("row-level security")) {
        errorMessage =
          "Permission error: The system doesn't have the right permissions to save this image. Please contact the administrator.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show for longer since it's an error
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file selection via button click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle removing selected file
  const handleRemoveFile = () => {
    setFile(null);
    setCroppedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowCropper(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {showCropper && file ? (
        <div className="border rounded-md p-4">
          <ImageCropper
            imageFile={file}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
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
      ) : (
        <div className="space-y-2 mb-4">
          <Label htmlFor="file-upload" className="font-medium">
            Image File <span className="text-red-500">*</span>
          </Label>
          {previewUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <NextImage
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  console.error("Failed to load preview image:", previewUrl);
                  // Don't set a fallback here as this is a preview of a local file
                }}
                onLoad={() => {
                  console.log("Preview image loaded successfully:", previewUrl);
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  onClick={() => setShowCropper(true)}
                  title="Edit crop"
                >
                  <CropIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleRemoveFile}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleButtonClick}
              className="border-2 border-dashed rounded-md p-4 cursor-pointer hover:border-primary text-center transition-colors py-6 flex flex-col items-center justify-center"
            >
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                SVG, PNG, JPG or WebP (max. 5MB)
              </p>
            </div>
          )}
          <input
            type="file"
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      )}

      <div className="space-y-2 mb-4">
        <Label htmlFor="alt-text" className="required font-medium">
          Alt Text <span className="text-red-500">*</span>
        </Label>
        <Input
          id="alt-text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image for accessibility"
          required
        />
        <p className="text-xs text-muted-foreground">
          Provide a description of the image for screen readers and
          accessibility
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <Label htmlFor="caption" className="font-medium">
          Caption
        </Label>
        <Input
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Optional caption to display with the image"
        />
      </div>

      <div className="space-y-2 mb-4">
        <Label htmlFor="tags" className="font-medium">
          Tags
        </Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Comma-separated tags (e.g., hero, about, logo)"
        />
        <p className="text-xs text-muted-foreground">
          Add tags to help organize and find your images later
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
