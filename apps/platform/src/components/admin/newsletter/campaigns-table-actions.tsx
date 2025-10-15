"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send, Edit, Trash, Calendar } from "lucide-react";
import { NewsletterCampaign } from "@/lib/newsletterService";
import { ScheduleCampaignDialog } from "./schedule-campaign-dialog";
import { useScheduleNewsletterCampaignMutation } from "@/queries/adminQueries";

interface CampaignsTableActionsProps {
  campaign: NewsletterCampaign;
  onEdit: (campaign: NewsletterCampaign) => void;
  onDelete: (campaign: NewsletterCampaign) => void;
  onSend: (campaign: NewsletterCampaign) => void;
}

export function CampaignsTableActions({
  campaign,
  onEdit,
  onDelete,
  onSend,
}: CampaignsTableActionsProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const scheduleCampaignMutation = useScheduleNewsletterCampaignMutation();

  const handleSchedule = async (scheduledTime: string) => {
    try {
      await scheduleCampaignMutation.mutateAsync({
        campaignId: campaign.id!,
        scheduledTime,
      });

      // Close dialog - cache invalidation is handled automatically by the mutation hook
      setIsScheduleDialogOpen(false);
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      throw error;
    }
  };

  const canSend = campaign.status === "draft";
  const canSchedule = campaign.status === "draft";
  const canEdit = campaign.status === "draft";
  const canDelete = campaign.status !== "sending";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canSend && (
            <DropdownMenuItem onClick={() => onSend(campaign)}>
              <Send className="mr-2 h-4 w-4" />
              <span>Send Now</span>
            </DropdownMenuItem>
          )}
          {canSchedule && (
            <DropdownMenuItem onClick={() => setIsScheduleDialogOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Schedule</span>
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem onClick={() => onEdit(campaign)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={() => onDelete(campaign)}>
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ScheduleCampaignDialog
        campaign={campaign}
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        onSchedule={handleSchedule}
      />
    </>
  );
}
