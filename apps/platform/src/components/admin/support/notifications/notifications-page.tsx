"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  Ticket,
  User,
  Clock,
  Mail,
  MailOpen,
  Filter,
} from "lucide-react";
import { SupportNotification, formatTimeAgo } from "@/lib/supportService";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api } from "@/lib/trpc-client";

export function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const queryClient = useQueryClient();

  // Fetch notifications using tRPC
  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = api.support.getNotifications.useQuery({
    limit: 100,
    unread_only: filter === "unread",
  });

  // Fetch unread notifications
  const { data: unreadData } = useQuery({
    queryKey: ["admin", "support", "notifications", "unread"],
    queryFn: async () => {
      const response = await fetch(
        "/api/admin/support/notifications?unread_only=true&limit=100",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch unread notifications");
      }
      return response.json();
    },
  });

  const allNotifications = notificationsData?.notifications || [];
  const unreadNotifications = unreadData?.notifications || [];
  const readNotifications = allNotifications.filter(
    (n: SupportNotification) => n.is_read,
  );

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return unreadNotifications;
      case "read":
        return readNotifications;
      default:
        return allNotifications;
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/admin/support/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_ids: notificationIds,
        }),
      });

      if (response.ok) {
        refetch();
        queryClient.invalidateQueries({
          queryKey: ["admin", "support", "notifications"],
        });
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/support/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mark_all: true,
        }),
      });

      if (response.ok) {
        refetch();
        queryClient.invalidateQueries({
          queryKey: ["admin", "support", "notifications"],
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_ticket":
      case "ticket_updated":
      case "ticket_assigned":
      case "urgent_ticket":
        return <Ticket className="h-5 w-5" />;
      case "new_message":
      case "chat_started":
      case "chat_ended":
      case "chat_assigned":
        return <MessageSquare className="h-5 w-5" />;
      case "user_mentioned":
        return <User className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "urgent_ticket":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "new_ticket":
      case "ticket_assigned":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      case "new_message":
      case "chat_started":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "ticket_updated":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-800/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getNotificationLink = (notification: SupportNotification) => {
    if (notification.ticket_id) {
      return `/admin/support/tickets/${notification.ticket_id}`;
    }
    if (notification.chat_session_id) {
      return `/admin/support/chat/${notification.chat_session_id}`;
    }
    return "/admin/support";
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="w-full space-y-6 bg-surface-background dark:bg-[var(--bg-primary)] min-h-screen">
      {/* Header - Vectura Labs Theme */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)]">
        <div>
          <h1 className="text-3xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
            Notifications
          </h1>
          <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
            Stay updated with support activities and important events
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadNotifications.length > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Vectura Labs Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)] transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-accent/10 dark:bg-brand-accent/20 rounded-none">
                <Bell className="h-5 w-5 text-brand-accent dark:text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary dark:text-[var(--text-primary)] font-headings">
                  {allNotifications.length}
                </p>
                <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] font-ui">
                  Total Notifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-none">
                <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-headings">
                  {unreadNotifications.length}
                </p>
                <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] font-ui">
                  Unread
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-none">
                <MailOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-headings">
                  {readNotifications.length}
                </p>
                <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] font-ui">
                  Read
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List - Vectura Labs Theme */}
      <Card className="mx-6 border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader className="border-b border-ui-border dark:border-[var(--border-primary)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
              All Notifications
            </CardTitle>
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as any)}
            >
              <TabsList className="bg-ui-border-light dark:bg-[var(--bg-tertiary)] border border-ui-border dark:border-[var(--border-primary)] rounded-none">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[var(--bg-primary)] data-[state=active]:text-text-primary dark:data-[state=active]:text-[var(--text-primary)] text-text-secondary dark:text-[var(--text-secondary)] rounded-none font-ui"
                >
                  All ({allNotifications.length})
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[var(--bg-primary)] data-[state=active]:text-text-primary dark:data-[state=active]:text-[var(--text-primary)] text-text-secondary dark:text-[var(--text-secondary)] rounded-none font-ui"
                >
                  Unread ({unreadNotifications.length})
                </TabsTrigger>
                <TabsTrigger
                  value="read"
                  className="data-[state=active]:bg-surface-background dark:data-[state=active]:bg-[var(--bg-primary)] data-[state=active]:text-text-primary dark:data-[state=active]:text-[var(--text-primary)] text-text-secondary dark:text-[var(--text-secondary)] rounded-none font-ui"
                >
                  Read ({readNotifications.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-text-secondary dark:text-[var(--text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary dark:text-[var(--text-primary)]">
                No notifications
              </h3>
              <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] mt-2">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : filter === "read"
                    ? "No read notifications yet."
                    : "No notifications to display."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(
                (notification: SupportNotification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start space-x-4 p-4 border rounded-lg transition-colors",
                      "border-ui-border dark:border-[var(--border-primary)]",
                      "hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)]",
                      !notification.is_read &&
                        "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-600",
                    )}
                  >
                    <div
                      className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`text-sm ${!notification.is_read ? "font-semibold" : "font-medium"}`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(notification.created_at)}
                            </div>

                            {notification.email_sent && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Email sent
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead([notification.id])}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}

                          <Link href={getNotificationLink(notification)}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
