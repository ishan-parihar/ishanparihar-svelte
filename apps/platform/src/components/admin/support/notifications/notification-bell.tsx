"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  MessageSquare,
  Ticket,
  User,
  Clock,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupportNotification, formatTimeAgo } from "@/lib/supportService";
import Link from "next/link";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications using tRPC
  const { data: notificationsData, refetch } =
    api.support.getNotifications.useQuery(
      {
        limit: 20,
        unread_only: false,
      },
      {
        refetchInterval: 30000, // Refetch every 30 seconds
      },
    );

  // Fetch unread count using tRPC
  const { data: unreadData } = api.support.getNotifications.useQuery(
    {
      limit: 100,
      unread_only: true,
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    },
  );

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadData?.total || 0;

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
        return <Ticket className="h-4 w-4" />;
      case "new_message":
      case "chat_started":
      case "chat_ended":
        return <MessageSquare className="h-4 w-4" />;
      case "user_mentioned":
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-1">
              {notifications.map((notification: SupportNotification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-0 ${!notification.is_read ? "bg-blue-50" : ""}`}
                  asChild
                >
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead([notification.id]);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start space-x-3 p-3 w-full">
                      <div
                        className={`p-1 rounded-full ${!notification.is_read ? "bg-blue-100" : "bg-muted"}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm ${!notification.is_read ? "font-medium" : ""}`}
                          >
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/admin/support/notifications"
            className="w-full text-center p-3"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
