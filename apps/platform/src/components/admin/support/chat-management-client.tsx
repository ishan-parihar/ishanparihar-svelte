"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
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
  Users,
  Clock,
  RefreshCw,
  Plus,
  Activity,
  AlertCircle,
} from "lucide-react";
import { PaginatedChatSessions } from "./paginated-chat-sessions";
import { ActiveChatsPanel } from "./active-chats-panel";

interface ChatMetrics {
  total_sessions: number;
  active_sessions: number;
  unassigned_sessions: number;
  avg_response_time: number;
  sessions_today: number;
}

export function ChatManagementClient() {
  const [activeTab, setActiveTab] = useState("active");
  const queryClient = useQueryClient();

  // Fetch chat metrics using tRPC
  const { data: metrics, isLoading: metricsLoading } =
    api.support.getChatMetrics.useQuery(undefined, {
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "support", "chat"] });
  };

  const handleStartNewChat = async () => {
    try {
      // Create a new chat session with admin as initiator
      const response = await fetch("/api/admin/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          customer_email: "admin-initiated@support.com",
          customer_name: "Admin Initiated Chat",
          customer_id: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start new chat");
      }

      const chatSession = await response.json();

      // Refresh the chat data to show the new session
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "chat"] });

      // You could also redirect to the chat session or open it in a modal
      console.log("New chat session created:", chatSession);

      // Optional: Show success message
      // toast.success('New chat session started successfully');
    } catch (error) {
      console.error("Error starting new chat:", error);
      // Optional: Show error message
      // toast.error('Failed to start new chat session');
    }
  };

  return (
    <div className="w-full space-y-6 bg-surface-background dark:bg-[var(--bg-primary)] min-h-screen">
      {/* Header - Vectura Labs Theme */}
      <div className="flex justify-between items-center px-6 py-6 border-b border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)]">
        <div>
          <h2 className="text-2xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
            Chat Management
          </h2>
          <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
            Manage live customer conversations and chat sessions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button
            onClick={handleStartNewChat}
            size="sm"
            className="bg-brand-accent text-white hover:bg-[var(--brand-accent-hover)] dark:bg-brand-accent dark:text-white dark:hover:bg-[var(--brand-accent-hover)] rounded-none font-ui font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
        </div>
      </div>

      {/* Vectura Labs Professional Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-6">
        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
              Total Sessions
            </CardTitle>
            <div className="p-2 bg-ui-border-light dark:bg-[var(--bg-tertiary)] rounded-none">
              <MessageSquare className="h-5 w-5 text-text-secondary dark:text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary dark:text-[var(--text-primary)] font-headings">
              {metricsLoading ? "..." : metrics?.total_chats || 0}
            </div>
            <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] mt-1 font-ui">
              All time sessions
            </p>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
              Active Now
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-none">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-headings">
              {metricsLoading ? "..." : metrics?.active_chats || 0}
            </div>
            <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] mt-1 font-ui">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-neutral-800 rounded-none bg-surface-background dark:bg-[#1C1C1F] shadow-none hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-neutral-400 uppercase tracking-wide font-ui">
              Unassigned
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-none">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-headings">
              {metricsLoading ? "..." : metrics?.waiting_chats || 0}
            </div>
            <p className="text-xs text-text-secondary dark:text-neutral-400 mt-1 font-ui">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-neutral-800 rounded-none bg-surface-background dark:bg-[#1C1C1F] shadow-none hover:bg-brand-accent/10 dark:hover:bg-brand-accent/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-neutral-400 uppercase tracking-wide font-ui">
              Avg Response
            </CardTitle>
            <div className="p-2 bg-brand-accent/10 dark:bg-brand-accent/20 rounded-none">
              <Clock className="h-5 w-5 text-brand-accent dark:text-brand-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent dark:text-brand-accent font-headings">
              {metricsLoading ? "..." : `${metrics?.avg_response_time || 0}m`}
            </div>
            <p className="text-xs text-text-secondary dark:text-neutral-400 mt-1 font-ui">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-neutral-800 rounded-none bg-surface-background dark:bg-[#1C1C1F] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-neutral-900/50 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-neutral-400 uppercase tracking-wide font-ui">
              Today
            </CardTitle>
            <div className="p-2 bg-ui-border-light dark:bg-neutral-800 rounded-none">
              <Users className="h-5 w-5 text-text-secondary dark:text-neutral-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary dark:text-white font-headings">
              {metricsLoading ? "..." : metrics?.closed_chats || 0}
            </div>
            <p className="text-xs text-text-secondary dark:text-neutral-400 mt-1 font-ui">
              Closed chats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vectura Labs Professional Status Bar */}
      <div className="flex items-center justify-between p-4 bg-ui-border-light dark:bg-neutral-900 border border-ui-border dark:border-neutral-800 rounded-none mx-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-text-secondary dark:text-neutral-400 font-ui">
              Real-time updates enabled
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-none font-ui"
          >
            Live
          </Badge>
        </div>
      </div>

      {/* Vectura Labs Professional Chat Sessions Management */}
      <div className="space-y-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-headings font-bold text-text-primary dark:text-white">
              Chat Sessions
            </h3>
            <p className="text-sm text-text-secondary dark:text-neutral-400 mt-1 font-ui">
              Manage and monitor customer chat conversations
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-ui-border-light dark:bg-neutral-800 border border-ui-border dark:border-neutral-700 rounded-none">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[#1C1C1F] data-[state=active]:text-text-primary dark:data-[state=active]:text-white rounded-none border-r border-ui-border dark:border-neutral-700 font-ui"
            >
              Active Chats
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[#1C1C1F] data-[state=active]:text-text-primary dark:data-[state=active]:text-white rounded-none border-r border-ui-border dark:border-neutral-700 font-ui"
            >
              All Sessions
            </TabsTrigger>
            <TabsTrigger
              value="unassigned"
              className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[#1C1C1F] data-[state=active]:text-text-primary dark:data-[state=active]:text-white rounded-none border-r border-ui-border dark:border-neutral-700 font-ui"
            >
              Unassigned
            </TabsTrigger>
            <TabsTrigger
              value="ended"
              className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[#1C1C1F] data-[state=active]:text-text-primary dark:data-[state=active]:text-white rounded-none font-ui"
            >
              Ended
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Single Active Chats View - Removed redundant components */}
            <PaginatedChatSessions
              title="Active Chat Sessions"
              description="Currently active customer chat sessions"
              defaultLimit={20}
              statusFilter="active"
            />
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <PaginatedChatSessions
              title="All Chat Sessions"
              description="Complete history of customer chat sessions"
              defaultLimit={50}
            />
          </TabsContent>

          <TabsContent value="unassigned" className="space-y-4">
            <PaginatedChatSessions
              title="Unassigned Chat Sessions"
              description="Chat sessions that need admin assignment"
              defaultLimit={20}
              statusFilter="unassigned"
              showFilters={false}
            />
          </TabsContent>

          <TabsContent value="ended" className="space-y-4">
            <PaginatedChatSessions
              title="Ended Chat Sessions"
              description="Previously completed chat sessions"
              defaultLimit={30}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
