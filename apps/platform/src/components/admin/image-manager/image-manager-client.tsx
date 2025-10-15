"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Upload,
  Search,
  X,
  Trash2,
  ArrowLeft,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  adminQueryKeys,
  useAdminImagesWithHelpers,
} from "@/queries/adminQueries";
import { createClient } from "@/utils/supabase/client";
import { getOptimizedAdminThumbnailUrl } from "@/lib/imageService.client";

interface Image {
  id: string;
  url: string;
  alt_text: string;
  caption?: string;
  filename_original: string;
  width: number;
  height: number;
  tags?: string[];
  created_at: string;
}

export function ImageManagerClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isImageDetailsOpen, setIsImageDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);
  const queryClient = useQueryClient();

  const { toast } = useToast();

  // Initialize Supabase client for image optimization
  const supabase = createClient();

  // Form state for image upload
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // React Query for images using optimized cache helpers
  const {
    data: images = [],
    isLoading,
    error,
    refetch,
  } = useAdminImagesWithHelpers({
    search: searchQuery,
    tag: selectedTag || undefined,
  });

  // Handle query error
  if (error) {
    console.error("Error fetching images:", error);
    toast({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to fetch images",
      variant: "destructive",
    });
  }

  // Extract all unique tags from images
  useEffect(() => {
    const tags = new Set<string>();
    images.forEach((image) => {
      if (image.tags && image.tags.length > 0) {
        image.tags.forEach((tag) => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
  }, [images]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Handle form submission for image upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

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
        description: "Alt text is required",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt_text", altText);
      if (caption) formData.append("caption", caption);
      if (tags) formData.append("tags", tags);

      setUploadProgress(30); // Update progress

      // Upload the image
      const response = await fetch("/api/image-manager/images/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90); // Almost done

      const data = await response.json();

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

        // Close dialog
        setIsUploadDialogOpen(false);

        // Invalidate and refetch images
        await queryClient.invalidateQueries({
          queryKey: adminQueryKeys.allImages(),
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while uploading the image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch("/api/image-manager/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: imageToDelete.id }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });

        // Reset state
        setImageToDelete(null);
        setIsDeleteDialogOpen(false);

        // If the deleted image was selected, clear the selection
        if (selectedImage && selectedImage.id === imageToDelete.id) {
          setSelectedImage(null);
          setIsImageDetailsOpen(false);
        }

        // Invalidate and refetch images
        await queryClient.invalidateQueries({
          queryKey: adminQueryKeys.allImages(),
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Images</h1>
          <p className="text-muted-foreground">
            Upload and manage images for use throughout the website.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/image-manager">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Image</DialogTitle>
                <DialogDescription>
                  Upload a new image to the website. The image will be
                  automatically converted to WebP format.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Image File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    required
                  />
                  {previewUrl && (
                    <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-md border">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text (Required)</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Descriptive text for the image"
                    disabled={isUploading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption to display with the image"
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="hero, background, profile, etc."
                    disabled={isUploading}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !file || !altText}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-3/4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-md">
              <p className="text-muted-foreground mb-4">No images found</p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    setSelectedImage(image);
                    setIsImageDetailsOpen(true);
                  }}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={
                        getOptimizedAdminThumbnailUrl(
                          supabase,
                          "blog-images",
                          image.url,
                        ) || image.url
                      }
                      alt={image.alt_text}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">
                      {image.alt_text}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Filter by Tag</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  className="text-xs"
                >
                  All
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedTag(tag === selectedTag ? null : tag)
                    }
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
                {allTags.length === 0 && (
                  <p className="text-xs text-muted-foreground">No tags found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Image Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Images:
                  </span>
                  <span className="text-sm font-medium">{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Displayed Images:
                  </span>
                  <span className="text-sm font-medium">{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Tags:
                  </span>
                  <span className="text-sm font-medium">{allTags.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Details Dialog */}
      <Dialog open={isImageDetailsOpen} onOpenChange={setIsImageDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>Image Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <Image
                    src={
                      getOptimizedAdminThumbnailUrl(
                        supabase,
                        "blog-images",
                        selectedImage.url,
                      ) || selectedImage.url
                    }
                    alt={selectedImage.alt_text}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Alt Text</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.alt_text}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Dimensions</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.width} × {selectedImage.height}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Original Filename</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedImage.filename_original}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Uploaded</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedImage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedImage.caption && (
                  <div>
                    <h3 className="text-sm font-medium">Caption</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.caption}
                    </p>
                  </div>
                )}
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedImage.tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center bg-muted px-2 py-1 rounded-sm text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImage.url);
                      toast({
                        title: "URL Copied",
                        description: "Image URL copied to clipboard",
                      });
                    }}
                  >
                    Copy URL
                  </Button>
                  <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImageToDelete(selectedImage);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Image
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Image</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this image? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteImage}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
