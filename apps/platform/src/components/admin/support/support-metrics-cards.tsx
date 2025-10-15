"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ticket,
  Clock,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface SupportMetrics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  urgent_tickets: number;
  active_chat_sessions: number;
}

interface SupportMetricsCardsProps {
  metrics?: SupportMetrics;
  isLoading?: boolean;
}

export function SupportMetricsCards({
  metrics,
  isLoading,
}: SupportMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-4 w-4 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-3 w-24 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Tickets",
      value: metrics?.total_tickets || 0,
      icon: Ticket,
      description: "All time tickets",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Open Tickets",
      value: metrics?.open_tickets || 0,
      icon: AlertTriangle,
      description: "Awaiting response",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
      urgent: true,
    },
    {
      title: "In Progress",
      value: metrics?.in_progress_tickets || 0,
      icon: Clock,
      description: "Being worked on",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      title: "Urgent Tickets",
      value: metrics?.urgent_tickets || 0,
      icon: AlertTriangle,
      description: "High priority",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
      urgent: true,
    },
    {
      title: "Active Chats",
      value: metrics?.active_chat_sessions || 0,
      icon: MessageSquare,
      description: "Live conversations",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isUrgent = card.urgent && card.value > 0;

        return (
          <Card
            key={index}
            className={`relative transition-all duration-200 border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)] ${
              isUrgent
                ? "border-red-200 dark:border-red-600 bg-red-50/30 dark:bg-red-900/10"
                : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-none transition-all duration-200 ${
                  index === 0
                    ? "bg-ui-border-light dark:bg-[var(--bg-tertiary)]"
                    : index === 1 || index === 3
                      ? "bg-red-100 dark:bg-red-900/20"
                      : index === 2
                        ? "bg-brand-accent/10 dark:bg-brand-accent/20"
                        : "bg-green-100 dark:bg-green-900/20"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    index === 0
                      ? "text-text-secondary dark:text-[var(--text-secondary)]"
                      : index === 1 || index === 3
                        ? "text-red-600 dark:text-red-400"
                        : index === 2
                          ? "text-brand-accent dark:text-brand-accent"
                          : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div
                    className={`text-3xl font-bold font-headings ${
                      index === 0
                        ? "text-text-primary dark:text-[var(--text-primary)]"
                        : index === 1 || index === 3
                          ? "text-red-600 dark:text-red-400"
                          : index === 2
                            ? "text-brand-accent dark:text-brand-accent"
                            : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {card.value.toLocaleString()}
                  </div>
                  {isUrgent && (
                    <Badge
                      variant="destructive"
                      className="ml-2 text-xs animate-pulse rounded-none font-ui"
                    >
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] font-medium font-ui">
                  {card.description}
                </p>
                {card.value > 0 ? (
                  <div className="flex items-center text-xs">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                    <span className="text-green-600 dark:text-green-400 font-medium font-ui">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-xs">
                    <CheckCircle className="h-3 w-3 text-text-secondary dark:text-[var(--text-secondary)] mr-1" />
                    <span className="text-text-secondary dark:text-[var(--text-secondary)] font-medium font-ui">
                      None
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
