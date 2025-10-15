"use client";

import React from "react";
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
import {
  Ticket,
  Clock,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  Plus,
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
import Link from "next/link";
import {
  SupportErrorBoundary,
  SupportDataError,
  SupportLoadingState,
  useSupportErrorHandler,
} from "./support-error-boundary";

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

interface SupportMainDashboardProps {
  initialData?: SupportDashboardData;
}

export function SupportMainDashboard({
  initialData,
}: SupportMainDashboardProps) {
  const queryClient = useQueryClient();
  const { handleError } = useSupportErrorHandler();

  // Fetch dashboard data using tRPC
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = api.support.getDashboard.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
  };

  if (error) {
    return <SupportDataError error={error as any} onRetry={refetch} />;
  }

  if (isLoading && !dashboardData) {
    return <SupportLoadingState />;
  }

  const stats = dashboardData?.stats || {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    urgentTickets: 0,
    activeChatSessions: 0,
  };
  const recentTickets = dashboardData?.recentTickets || [];
  const activeChats = dashboardData?.activeChats || [];

  return (
    <div className="w-full space-y-6 bg-background">
      {/* Quick Actions Header */}
      <div className="flex justify-between items-center py-6 border-b border-border px-6 bg-background">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-headings font-bold text-foreground">
              Support Dashboard
            </h2>
            <span className="text-sm text-muted-foreground font-ui">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="font-ui"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Link href="/admin/support/tickets/new">
            <Button size="sm" className="font-ui font-medium">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
        <Card className="hover:bg-muted/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide font-ui">
                  Total Tickets
                </p>
                <p className="text-3xl font-bold text-card-foreground font-headings">
                  {stats?.totalTickets || 0}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Ticket className="h-7 w-7 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide font-ui">
                  Open Tickets
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 font-headings">
                  {stats?.openTickets || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
                <AlertTriangle className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide font-ui">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-accent font-headings">
                  {stats?.inProgressTickets || 0}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Clock className="h-7 w-7 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-green-50/30 dark:hover:bg-green-950/20 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide font-ui">
                  Active Chats
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 font-headings">
                  {stats?.activeChatSessions || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <MessageSquare className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 mb-6 bg-surface-background dark:bg-[var(--bg-primary)]">
        {/* Recent Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
                Recent Tickets
              </h3>
              <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] mt-1 font-ui">
                Latest support requests requiring attention
              </p>
            </div>
            <Link href="/admin/support/tickets">
              <Button
                variant="outline"
                size="sm"
                className="font-ui border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)]"
              >
                View All Tickets
              </Button>
            </Link>
          </div>
          <Card className="h-[750px] border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none overflow-hidden">
            <CardContent className="p-6 h-full overflow-y-auto">
              <RecentTicketsTable
                tickets={recentTickets}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Active Chats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
                Active Chats
              </h3>
              <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] mt-1 font-ui">
                Live customer conversations in progress
              </p>
            </div>
            <Link href="/admin/support/chat">
              <Button
                variant="outline"
                size="sm"
                className="font-ui border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)]"
              >
                View All Chats
              </Button>
            </Link>
          </div>
          <Card className="h-[750px] border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none overflow-hidden">
            <CardContent className="p-6 h-full overflow-y-auto">
              <ActiveChatsPanel
                chatSessions={activeChats}
                isLoading={isLoading}
                showActions={true}
                maxSessions={5}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="border-t border-border pt-8 pb-4 px-6 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-headings font-bold text-foreground">
              Quick Actions
            </h3>
            <p className="text-sm text-muted-foreground mt-1 font-ui">
              Common support management tasks
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:bg-muted/50 transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-accent/10 rounded-lg w-fit mx-auto mb-4">
                <Plus className="h-8 w-8 text-accent" />
              </div>
              <h4 className="font-headings font-bold text-card-foreground mb-2">
                Create New Ticket
              </h4>
              <p className="text-sm text-muted-foreground mb-4 font-ui">
                Start a new support ticket for a customer
              </p>
              <Link href="/admin/support/tickets/new">
                <Button className="w-full font-ui font-medium">
                  Create Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-green-100 dark:bg-green-950/30 rounded-lg w-fit mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-headings font-bold text-card-foreground mb-2">
                Start Live Chat
              </h4>
              <p className="text-sm text-muted-foreground mb-4 font-ui">
                Begin a new chat session with a customer
              </p>
              <Link href="/admin/support/chat/new">
                <Button className="w-full font-ui font-medium">
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-950/30 rounded-lg w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-headings font-bold text-card-foreground mb-2">
                View Analytics
              </h4>
              <p className="text-sm text-muted-foreground mb-4 font-ui">
                Access detailed support performance metrics
              </p>
              <Link href="/admin/support/analytics">
                <Button className="w-full font-ui font-medium">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
