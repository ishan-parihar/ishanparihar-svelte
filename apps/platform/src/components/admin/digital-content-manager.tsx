"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Hash,
  FileText,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProductService } from "@/lib/supabase";

interface DigitalContentData {
  enabled: boolean;
  url?: string;
  filename?: string;
  size_bytes?: number;
  mime_type?: string;
  bucket?: string;
  path?: string;
  description?: string;
  access_type?: "immediate" | "scheduled" | "manual";
  expires_at?: string;
  download_limit?: number;
  uploaded_at?: string;
}

interface DigitalContentManagerProps {
  serviceId?: string;
  initialData?: DigitalContentData;
  onChange: (data: DigitalContentData) => void;
  disabled?: boolean;
}

export function DigitalContentManager({
  serviceId,
  initialData,
  onChange,
  disabled = false,
}: DigitalContentManagerProps) {
  const [data, setData] = useState<DigitalContentData>(
    initialData || {
      enabled: false,
      access_type: "immediate",
    },
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent when data changes
  const updateData = (newData: Partial<DigitalContentData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    onChange(updatedData);
  };

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 100MB");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetBucket", "digital-content");
      formData.append("alt_text", `Digital content for service: ${file.name}`);
      formData.append("caption", data.description || "");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      const response = await fetch("/api/digital-content/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();

      // Update data with upload result
      updateData({
        url: result.publicUrl,
        filename: file.name,
        size_bytes: file.size,
        mime_type: file.type,
        bucket: result.bucket || "digital-content",
        path: result.path,
        uploaded_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    updateData({
      url: undefined,
      filename: undefined,
      size_bytes: undefined,
      mime_type: undefined,
      bucket: undefined,
      path: undefined,
      uploaded_at: undefined,
    });
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-4 w-4" />;

    if (mimeType.startsWith("image/")) return <FileText className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <FileText className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <FileText className="h-4 w-4" />;
    if (mimeType.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <File className="h-4 w-4" />;

    return <File className="h-4 w-4" />;
  };

  return (
    <Card className="shadow-sm rounded-none border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-subheading flex items-center gap-2">
          <Download className="h-5 w-5" />
          Digital Content
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload digital content that customers will receive after purchase
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Digital Content Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              Enable Digital Content
            </Label>
            <p className="text-sm text-muted-foreground">
              Provide downloadable content to customers after purchase
            </p>
          </div>
          <Switch
            checked={data.enabled}
            onCheckedChange={(enabled) => updateData({ enabled })}
            disabled={disabled}
          />
        </div>

        {data.enabled && (
          <>
            {/* File Upload Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Upload File</Label>

              {!data.url ? (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-none p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, ZIP, MP4, MP3, or other digital content (max 100MB)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.zip,.rar,.mp4,.mp3,.wav,.epub,.mobi,.docx,.pptx"
                    disabled={disabled || isUploading}
                  />
                </div>
              ) : (
                <div className="border rounded-none p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(data.mime_type)}
                      <div>
                        <p className="font-medium">{data.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(data.size_bytes)} • {data.mime_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(data.url, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-none">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            {/* Content Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Content Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what customers will receive (e.g., 'Complete course materials including videos, worksheets, and bonus content')"
                value={data.description || ""}
                onChange={(e) => updateData({ description: e.target.value })}
                disabled={disabled}
                rows={3}
              />
            </div>

            {/* Access Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Access Type</Label>
                <Select
                  value={data.access_type || "immediate"}
                  onValueChange={(
                    value: "immediate" | "scheduled" | "manual",
                  ) => updateData({ access_type: value })}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Immediate Access
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Scheduled Release
                      </div>
                    </SelectItem>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Manual Approval
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="download_limit">Download Limit</Label>
                <Input
                  id="download_limit"
                  type="number"
                  placeholder="Unlimited"
                  value={data.download_limit || ""}
                  onChange={(e) =>
                    updateData({
                      download_limit: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  disabled={disabled}
                  min="1"
                />
              </div>
            </div>

            {/* Expiration Date */}
            {data.access_type === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={
                    data.expires_at
                      ? new Date(data.expires_at).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    updateData({
                      expires_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                  disabled={disabled}
                />
              </div>
            )}

            {/* Upload Status */}
            {data.uploaded_at && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-none">
                <CheckCircle className="h-4 w-4" />
                Digital content uploaded on{" "}
                {new Date(data.uploaded_at).toLocaleDateString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
