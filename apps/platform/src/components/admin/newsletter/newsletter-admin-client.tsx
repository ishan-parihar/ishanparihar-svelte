"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscribersTable } from "./subscribers-table";
import { CampaignsTable } from "./campaigns-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import {
  NewsletterCampaign,
  NewsletterSubscriber,
} from "@/lib/newsletterService";
import { NewCampaignDialog } from "./new-campaign-dialog";
import { WelcomeEmailConfig } from "./welcome-email-config";
import { api } from "@/lib/trpc-client";
import {
  adminQueryKeys,
  useDeleteNewsletterCampaignMutation,
} from "@/queries/adminQueries";

export function NewsletterAdminClient() {
  const [activeTab, setActiveTab] = useState("subscribers");
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const queryClient = useQueryClient();

  const deleteCampaignMutation = useDeleteNewsletterCampaignMutation();

  // tRPC queries for subscribers and campaigns
  const {
    data: subscribersData,
    isLoading: subscribersLoading,
    error: subscribersError,
  } = api.admin.getNewsletterSubscribers.useQuery({
    page: 1,
    limit: 100,
    subscribed: activeOnly ? true : undefined,
  });

  const {
    data: campaignsData,
    isLoading: campaignsLoading,
    error: campaignsError,
  } = api.admin.getNewsletterCampaigns.useQuery({
    page: 1,
    limit: 100,
  });

  // Transform data to match expected format
  const subscribers = subscribersData?.subscribers || [];
  const campaigns = campaignsData?.campaigns || [];

  // Determine loading state based on active tab
  const isLoading =
    activeTab === "subscribers" ? subscribersLoading : campaignsLoading;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleRefresh = () => {
    if (activeTab === "subscribers") {
      queryClient.invalidateQueries({
        queryKey: [["admin", "getNewsletterSubscribers"]],
      });
    } else if (activeTab === "campaigns") {
      queryClient.invalidateQueries({
        queryKey: [["admin", "getNewsletterCampaigns"]],
      });
    }
  };

  const handleNewCampaign = () => {
    setShowNewCampaignDialog(true);
  };

  const handleCampaignCreated = () => {
    setShowNewCampaignDialog(false);
    // Invalidate campaigns query to refetch data
    queryClient.invalidateQueries({
      queryKey: [["admin", "getNewsletterCampaigns"]],
    });
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaignMutation.mutateAsync({ campaignId: id });
      // Cache invalidation is handled automatically by the mutation hook
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          {activeTab === "campaigns" && (
            <Button onClick={handleNewCampaign} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-transparent rounded-none shadow p-6">
        {activeTab === "subscribers" && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={() => setActiveOnly(!activeOnly)}
                  className="mr-2 h-4 w-4"
                />
                <span>Show active subscribers only</span>
              </label>
            </div>
            <SubscribersTable
              subscribers={subscribers}
              isLoading={isLoading}
              onRefresh={() =>
                queryClient.invalidateQueries({
                  queryKey: [["admin", "getNewsletterSubscribers"]],
                })
              }
            />
          </div>
        )}

        {activeTab === "campaigns" && (
          <CampaignsTable
            campaigns={campaigns}
            isLoading={isLoading}
            onDelete={handleDeleteCampaign}
          />
        )}

        {activeTab === "welcome" && <WelcomeEmailConfig />}
      </div>

      <NewCampaignDialog
        open={showNewCampaignDialog}
        onClose={() => setShowNewCampaignDialog(false)}
        onCreated={handleCampaignCreated}
      />
    </div>
  );
}
