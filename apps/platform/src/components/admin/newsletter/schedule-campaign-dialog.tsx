"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Calendar } from "lucide-react";
import { NewsletterCampaign } from "@/lib/newsletterService";

interface ScheduleCampaignDialogProps {
  campaign: NewsletterCampaign;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledTime: string) => Promise<void>;
}

export function ScheduleCampaignDialog({
  campaign,
  isOpen,
  onClose,
  onSchedule,
}: ScheduleCampaignDialogProps) {
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current date and time in ISO format for the min attribute
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5); // Add 5 minutes to ensure it's in the future
  const minDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm

  const handleSchedule = async () => {
    if (!scheduledTime) {
      setError("Please select a date and time");
      return;
    }

    try {
      setError(null);
      setIsScheduling(true);
      await onSchedule(scheduledTime);
      onClose();
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      setError("Failed to schedule campaign. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md flex items-start text-sm">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="campaign-title">Campaign</Label>
            <Input
              id="campaign-title"
              value={campaign.subject}
              disabled
              className="bg-slate-100 dark:bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-time">Schedule Date and Time</Label>
            <div className="relative">
              <Input
                id="scheduled-time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={minDateTime}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500">
              Select when you want this campaign to be sent. The campaign will
              be automatically sent at the specified time.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isScheduling}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isScheduling || !scheduledTime}
          >
            {isScheduling ? "Scheduling..." : "Schedule Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
