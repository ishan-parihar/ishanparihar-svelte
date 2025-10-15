"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useCreateNewsletterCampaignMutation } from "@/queries/adminQueries";

interface NewCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewCampaignDialog({
  open,
  onClose,
  onCreated,
}: NewCampaignDialogProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const createCampaignMutation = useCreateNewsletterCampaignMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !content.trim()) {
      setError("Subject and content are required");
      return;
    }

    try {
      await createCampaignMutation.mutateAsync({
        subject,
        content,
        status: "draft",
      });

      // Reset form
      setSubject("");
      setContent("");

      // Notify parent
      onCreated();
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create campaign",
      );
    }
  };

  const handleClose = () => {
    // Reset form
    setSubject("");
    setContent("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new newsletter campaign. It will be saved as a draft.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter campaign subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter campaign content"
                rows={10}
                required
              />
              <p className="text-xs text-slate-500">
                You can use Markdown formatting in your content.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCampaignMutation.isPending}>
              {createCampaignMutation.isPending
                ? "Creating..."
                : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
