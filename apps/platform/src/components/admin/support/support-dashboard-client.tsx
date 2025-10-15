"use client";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Ticket,
  Clock,
  AlertTriangle,
  Users,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Circle,
  Home,
  ChevronRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  SupportTicket,
  SupportTicketCategory,
  ChatSession,
} from "@/lib/supportService";
import { SupportMetricsCards } from "./support-metrics-cards";
import { ActiveChatsPanel } from "./active-chats-panel";
import { RecentTicketsTable } from "./recent-tickets-table";
import { QuickActionsPanel } from "./quick-actions-panel";
import { TicketsListClient } from "./tickets/tickets-list-client";
import { ChatManagementClient } from "./chat-management-client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { api } from "@/lib/trpc-client";
import {
  SupportErrorBoundary,
  SupportDataError,
  SupportLoadingState,
  useSupportErrorHandler,
} from "./support-error-boundary";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";

interface SupportDashboardData {
  metrics: {
    total_tickets: number;
    open_tickets: number;
    in_progress_tickets: number;
    urgent_tickets: number;
    active_chat_sessions: number;
  };
  recent_tickets: SupportTicket[];
  active_chats: ChatSession[];
  categories: SupportTicketCategory[];
}

interface SupportDashboardClientProps {
  initialData?: SupportDashboardData;
}

export function SupportDashboardClient({
  initialData,
}: SupportDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const {
    error: componentError,
    handleError,
    clearError,
  } = useSupportErrorHandler();

  // Performance monitoring
  usePerformanceMonitor("SupportDashboard");

  // Fetch dashboard data using tRPC
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    error: ticketsError,
  } = api.support.getAllTickets.useQuery({
    page: 1,
    limit: 10,
  });

  const {
    data: chatSessionsData,
    isLoading: chatsLoading,
    error: chatsError,
  } = api.support.getActiveChatSessions.useQuery({ limit: 10 });

  // Combine loading states and errors
  const isLoading = ticketsLoading || chatsLoading;
  const hasError = ticketsError || chatsError;

  // Transform data to match expected dashboard format
  const dashboardData = useMemo(
    () => ({
      tickets: ticketsData?.tickets || [],
      totalTickets: ticketsData?.total || 0,
      activeChatSessions: chatSessionsData?.chat_sessions || [],
      totalActiveChatSessions: chatSessionsData?.chat_sessions?.length || 0,
      metrics: {
        total_tickets: ticketsData?.total || 0,
        open_tickets:
          ticketsData?.tickets?.filter((t: any) => t.status === "open")
            .length || 0,
        in_progress_tickets:
          ticketsData?.tickets?.filter((t: any) => t.status === "in_progress")
            .length || 0,
        urgent_tickets:
          ticketsData?.tickets?.filter((t: any) => t.priority === "urgent")
            .length || 0,
        active_chat_sessions: chatSessionsData?.chat_sessions?.length || 0,
      },
    }),
    [ticketsData, chatSessionsData],
  );

  const refetch = () => {
    // Refetch both queries
    api.useUtils().support.getAllTickets.invalidate();
    api.useUtils().support.getActiveChatSessions.invalidate();
  };

  // Handle success callback using useEffect (React Query v5 pattern)
  useEffect(() => {
    if (dashboardData && !isLoading && !hasError) {
      // Performance monitoring is now handled automatically by the hook
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Support dashboard data loaded successfully");
      }
    }
  }, [dashboardData, isLoading, hasError]);

  // All data is now fetched from the consolidated dashboard endpoint
  // No need for separate API calls for chats and categories

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
  };

  const handleCreateTicket = () => {
    // Navigate to create ticket page or open modal
    window.location.href = "/admin/support/tickets/new";
  };

  const handleStartChat = () => {
    // Navigate to chat interface or open modal
    window.location.href = "/admin/support/chat/new";
  };

  // Extract data from tRPC responses
  const activeChatData = dashboardData?.activeChatSessions || [];
  const categories: any[] = []; // Categories would need to be fetched separately if needed
  const chatError = chatsError; // Use the actual chat error from tRPC

  // Handle critical errors
  if (hasError || componentError) {
    const errorToShow = hasError
      ? new Error(hasError.message || "Failed to load dashboard data")
      : componentError || new Error("Unknown error occurred");

    return (
      <SupportDataError
        error={errorToShow}
        onRetry={() => {
          clearError();
          refetch();
        }}
        title="Failed to Load Support Dashboard"
        description="There was an error loading the support dashboard data. Please try again."
      />
    );
  }

  // Show loading state for initial load
  if (isLoading && !dashboardData) {
    return (
      <SupportLoadingState
        title="Loading Support Dashboard"
        description="Please wait while we load your support data"
        rows={6}
      />
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="flex justify-between items-center">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="bg-transparent rounded-none border-b w-full justify-start">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Main CRM
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chats
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Action buttons with Dark Theme */}
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-border hover:bg-muted/50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {activeTab === "tickets" && (
            <Button
              onClick={handleCreateTicket}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          )}
          {activeTab === "chats" && (
            <Button
              onClick={handleStartChat}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          )}
        </div>
      </div>

      {/* Tab Content with Dark Theme */}
      <div className="bg-card dark:bg-card border border-border rounded-none p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="mt-0">
            {/* Overview Tab - Main CRM Dashboard */}
            <div className="space-y-6">
              {/* Status Window - Single Line with Dark Theme */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border rounded-none bg-card dark:bg-card shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Tickets
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {dashboardData?.metrics?.total_tickets || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-muted/20 rounded-lg">
                        <Ticket className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border rounded-none bg-card dark:bg-card shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Open Tickets
                        </p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {dashboardData?.metrics?.open_tickets || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border rounded-none bg-card dark:bg-card shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          In Progress
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {dashboardData?.metrics?.in_progress_tickets || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border rounded-none bg-card dark:bg-card shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Active Chats
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {dashboardData?.metrics?.active_chat_sessions || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Filters - Horizontal with Dark Theme */}
              <div className="flex flex-wrap gap-2 p-4 bg-muted/10 dark:bg-muted/5 border border-border rounded-none">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border hover:bg-muted/50"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Open Tickets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border hover:bg-muted/50"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent Priority
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border hover:bg-muted/50"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Unassigned
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border hover:bg-muted/50"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Active Chats
                </Button>
              </div>

              {/* Main Dashboard Grid - 50/50 Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tickets - 50% */}
                <div>
                  <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none h-full">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-foreground">
                            Recent Tickets
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Latest support requests
                          </CardDescription>
                        </div>
                        <Link href="/admin/support/tickets">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View All
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <RecentTicketsTable
                        tickets={dashboardData?.tickets || []}
                        isLoading={isLoading}
                        searchQuery=""
                        statusFilter="all"
                        priorityFilter="all"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Active Chats - 50% */}
                <div>
                  <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none h-full">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-foreground">
                            Active Chats
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Live customer conversations
                          </CardDescription>
                        </div>
                        <Link href="/admin/support/chat">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View All
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ActiveChatsPanel
                        chatSessions={activeChatData}
                        isLoading={isLoading}
                        showActions={true}
                        maxSessions={5}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-0">
            {/* Tickets Tab - Full Tickets Management */}
            <TicketsListClient
              initialTickets={dashboardData?.tickets}
              initialCategories={categories}
            />
          </TabsContent>

          <TabsContent value="chats" className="mt-0">
            {/* Chats Tab - Full Chat Management */}
            <ChatManagementClient />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
