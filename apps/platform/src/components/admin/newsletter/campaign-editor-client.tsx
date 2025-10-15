"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { NewsletterCampaign } from "@/lib/newsletterService";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateNewsletterCampaignMutation } from "@/queries/adminQueries";

interface CampaignEditorClientProps {
  campaignId: string;
}

export function CampaignEditorClient({
  campaignId,
}: CampaignEditorClientProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<NewsletterCampaign | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateCampaignMutation = useUpdateNewsletterCampaignMutation();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/newsletter/campaigns/${campaignId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch campaign");
        }

        const data = await response.json();
        setCampaign(data.data);
        setSubject(data.data.subject);
        setContent(data.data.content);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("Failed to load campaign. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleSave = async () => {
    setError("");
    setSaveSuccess(false);

    if (!subject.trim() || !content.trim()) {
      setError("Subject and content are required");
      return;
    }

    try {
      await updateCampaignMutation.mutateAsync({
        campaignId,
        subject,
        content,
      });

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating campaign:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update campaign",
      );
    }
  };

  const handleBack = () => {
    router.push("/admin/newsletter");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Campaign not found</p>
            <p className="text-sm mt-1">
              The campaign you are looking for does not exist or has been
              deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-green-600 dark:text-green-400 text-sm">
              Campaign saved successfully!
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={
              updateCampaignMutation.isPending || campaign.status !== "draft"
            }
          >
            <Save className="h-4 w-4 mr-2" />
            {updateCampaignMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {campaign.status !== "draft" && (
        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-md">
          <p className="font-medium">This campaign has already been sent</p>
          <p className="text-sm mt-1">
            Sent campaigns cannot be edited. You can view the content but not
            make changes.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-none shadow p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter campaign subject"
            disabled={
              campaign.status !== "draft" || updateCampaignMutation.isPending
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter campaign content"
            rows={20}
            disabled={
              campaign.status !== "draft" || updateCampaignMutation.isPending
            }
          />
          <p className="text-xs text-slate-500">
            You can use Markdown formatting in your content.
          </p>
        </div>
      </div>
    </div>
  );
}
