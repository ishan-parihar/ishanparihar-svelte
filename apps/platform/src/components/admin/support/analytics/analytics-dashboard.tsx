"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Users,
  Star,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Activity,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    total_tickets: number;
    resolved_tickets: number;
    avg_resolution_time: number;
    customer_satisfaction: number;
    total_chat_sessions: number;
    avg_response_time: number;
  };
  trends: {
    tickets_trend: number;
    resolution_trend: number;
    satisfaction_trend: number;
    chat_trend: number;
  };
  performance: {
    tickets_by_status: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    tickets_by_priority: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
    tickets_by_category: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    resolution_times: Array<{ period: string; avg_time: number }>;
    chat_metrics: Array<{
      period: string;
      sessions: number;
      avg_response: number;
    }>;
  };
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data using tRPC
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = api.support.getAnalytics.useQuery(
    {
      range: timeRange as "7d" | "30d" | "90d" | "1y",
    },
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    },
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export analytics data");
  };

  if (error) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)]">
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-text-secondary dark:text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary dark:text-[var(--text-primary)]">
              Failed to load analytics
            </h3>
            <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] mt-1">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button
              onClick={handleRefresh}
              className="mt-4 bg-brand-accent text-white hover:bg-[var(--brand-accent-hover)] dark:bg-brand-accent dark:text-white dark:hover:bg-[var(--brand-accent-hover)]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6 bg-surface-background dark:bg-[var(--bg-primary)]">
      {/* Controls - Vectura Labs Theme */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface-background dark:bg-[var(--bg-primary)] border-b border-ui-border dark:border-[var(--border-primary)]">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] rounded-none">
              <SelectItem
                value="7d"
                className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
              >
                Last 7 days
              </SelectItem>
              <SelectItem
                value="30d"
                className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
              >
                Last 30 days
              </SelectItem>
              <SelectItem
                value="90d"
                className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
              >
                Last 90 days
              </SelectItem>
              <SelectItem
                value="1y"
                className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
              >
                Last year
              </SelectItem>
            </SelectContent>
          </Select>

          <Badge
            variant="outline"
            className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-900/20 rounded-none font-ui"
          >
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing || isLoading}
            className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics - Vectura Labs Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
              Total Tickets
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-text-secondary dark:text-[var(--text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary dark:text-[var(--text-primary)] font-headings">
              {isLoading ? "..." : analyticsData?.overview.total_tickets || 0}
            </div>
            <div className="flex items-center text-xs text-text-secondary dark:text-[var(--text-secondary)] font-ui">
              {!isLoading && analyticsData?.trends.tickets_trend && (
                <>
                  {analyticsData.trends.tickets_trend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
                  )}
                  {Math.abs(analyticsData.trends.tickets_trend)}% from last
                  period
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
              Resolution Rate
            </CardTitle>
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-headings">
              {isLoading
                ? "..."
                : analyticsData?.overview.resolved_tickets || 0}
            </div>
            <div className="flex items-center text-xs text-text-secondary dark:text-[var(--text-secondary)] font-ui">
              {!isLoading && analyticsData?.trends.resolution_trend && (
                <>
                  {analyticsData.trends.resolution_trend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
                  )}
                  {Math.abs(analyticsData.trends.resolution_trend)}% from last
                  period
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-brand-accent/10 dark:hover:bg-brand-accent/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
              Avg Resolution Time
            </CardTitle>
            <Clock className="h-5 w-5 text-brand-accent dark:text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent dark:text-brand-accent font-headings">
              {isLoading
                ? "..."
                : `${analyticsData?.overview.avg_resolution_time || 0}h`}
            </div>
            <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] font-ui">
              Average time to resolve
            </p>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-yellow-50/30 dark:hover:bg-yellow-900/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
              Satisfaction Score
            </CardTitle>
            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-headings">
              {isLoading
                ? "..."
                : `${analyticsData?.overview.customer_satisfaction || 0}/5`}
            </div>
            <div className="flex items-center text-xs text-text-secondary dark:text-[var(--text-secondary)] font-ui">
              {!isLoading && analyticsData?.trends.satisfaction_trend && (
                <>
                  {analyticsData.trends.satisfaction_trend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
                  )}
                  {Math.abs(analyticsData.trends.satisfaction_trend)}% from last
                  period
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="tickets" className="space-y-4 px-6">
        <TabsList className="grid w-full grid-cols-3 bg-ui-border-light dark:bg-[var(--bg-tertiary)] border border-ui-border dark:border-[var(--border-primary)] rounded-none">
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[var(--bg-primary)] data-[state=active]:text-text-primary dark:data-[state=active]:text-[var(--text-primary)] text-text-secondary dark:text-[var(--text-secondary)] rounded-none font-ui"
          >
            Ticket Analytics
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[var(--bg-primary)] data-[state=active]:text-text-primary dark:data-[state=active]:text-[var(--text-primary)] text-text-secondary dark:text-[var(--text-secondary)] rounded-none font-ui"
          >
            Chat Analytics
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[var(--bg-primary)] data-[state=active]:text-text-primary dark:data-[state=active]:text-[var(--text-primary)] text-text-secondary dark:text-[var(--text-secondary)] rounded-none font-ui"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Status</CardTitle>
                <CardDescription>
                  Distribution of ticket statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData?.performance.tickets_by_status?.map(
                      (item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${Math.round((item.value / (analyticsData?.overview.total_tickets || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">
                              {item.value}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
                <CardDescription>Priority distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData?.performance.tickets_by_priority?.map(
                      (item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${Math.round((item.value / (analyticsData?.overview.total_tickets || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">
                              {item.value}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chat Session Metrics</CardTitle>
              <CardDescription>
                Real-time chat performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? "..."
                      : analyticsData?.overview.total_chat_sessions || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Sessions
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? "..."
                      : `${analyticsData?.overview.avg_response_time || 0}m`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg Response Time
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : "95%"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Resolution Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Key performance indicators and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Performance Charts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Advanced charts and visualizations will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
