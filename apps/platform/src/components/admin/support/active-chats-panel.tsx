"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Clock,
  User,
  ExternalLink,
  Circle,
  RefreshCw,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import { ChatSession, formatTimeAgo } from "@/lib/supportService";
import { ChatDetailModal } from "./modals/chat-detail-modal";
import Link from "next/link";
import { api } from "@/lib/trpc-client";

interface ActiveChatsPanelProps {
  chatSessions?: ChatSession[];
  isLoading?: boolean;
  showActions?: boolean;
  maxSessions?: number;
}

export function ActiveChatsPanel({
  chatSessions: initialChatSessions,
  isLoading: initialLoading,
  showActions = true,
  maxSessions = 10,
}: ActiveChatsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch active chat sessions with real-time updates using tRPC
  const {
    data: chatData,
    isLoading,
    error,
    refetch,
  } = api.support.getActiveChatSessions.useQuery(
    { limit: maxSessions },
    {
      initialData: initialChatSessions
        ? { chat_sessions: initialChatSessions }
        : undefined,
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      refetchIntervalInBackground: true,
    },
  );

  const chatSessions = chatData?.chat_sessions || [];
  const loading = isLoading || initialLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleStartNewChat = () => {
    // TODO: Implement start new chat functionality
    console.log("Start new chat");
  };

  const handleOpenChatModal = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedChatId(null);
  };

  if (error) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between text-text-primary dark:text-[var(--text-primary)]">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Active Chats
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
              Failed to load chats
            </h3>
            <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] mt-1">
              Unable to fetch active chat sessions
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-3 border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)]"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-text-primary dark:text-[var(--text-primary)]">
            <MessageSquare className="h-5 w-5 mr-2" />
            Active Chats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 border border-ui-border dark:border-[var(--border-primary)] rounded-lg bg-surface-background dark:bg-[var(--bg-primary)]"
            >
              <Skeleton className="h-10 w-10 rounded-full bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                <Skeleton className="h-3 w-32 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              </div>
              <Skeleton className="h-8 w-16 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-fit">
      <div className="pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">
              {chatSessions.length}
            </Badge>
            {chatSessions.length > 0 && (
              <div className="flex items-center gap-1">
                <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Live
                </span>
              </div>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="flex-1 h-8"
            >
              <RefreshCw
                className={`h-3 w-3 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={handleStartNewChat}
              variant="outline"
              size="sm"
              className="flex-1 h-8"
            >
              <Plus className="h-3 w-3 mr-2" />
              New Chat
            </Button>
          </div>
        )}
      </div>
      <div className="pt-4">
        {chatSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-muted/20 rounded-lg w-fit mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No active chats</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All chat sessions are currently inactive
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chatSessions.map((session: any) => (
              <div
                key={session.id}
                className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm bg-card"
              >
                {/* Customer Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-9 w-9 border-2 border-background">
                    <AvatarImage
                      src={session.customer?.picture}
                      alt={
                        session.customer?.name ||
                        session.customer_name ||
                        "Customer"
                      }
                    />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {(
                        session.customer?.name ||
                        session.customer_name ||
                        session.customer_email
                      )
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate text-card-foreground">
                        {session.customer?.name ||
                          session.customer_name ||
                          "Anonymous"}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-medium">
                        {formatTimeAgo(session.last_activity_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {session.customer_email}
                      </p>
                      {session.message_count && session.message_count > 0 && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs flex-shrink-0"
                        >
                          {session.message_count}
                        </Badge>
                      )}
                    </div>

                    {/* Last Message Preview */}
                    {session.last_message && (
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="font-medium">
                          {session.last_message.sender_type === "customer"
                            ? "Customer"
                            : "Admin"}
                          :
                        </span>{" "}
                        {session.last_message.content}
                      </p>
                    )}

                    {/* Admin Assignment */}
                    {session.admin && (
                      <div className="flex items-center">
                        <User className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground truncate">
                          {session.admin.name || session.admin.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1"
                      onClick={() => handleOpenChatModal(session.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Link href={`/admin/support/chat/${session.session_id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 py-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  {!session.admin && showActions && (
                    <Button
                      size="sm"
                      className="text-xs px-2 py-1 bg-primary hover:bg-primary/90"
                      variant="default"
                      onClick={() => {
                        // TODO: Implement quick join functionality
                        window.open(
                          `/admin/support/chat/${session.session_id}`,
                          "_blank",
                        );
                      }}
                    >
                      Quick Join
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* View All Link */}
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/admin/support/chat">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Chats
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Chat Detail Modal */}
      <ChatDetailModal
        chatId={selectedChatId}
        open={isChatModalOpen}
        onClose={handleCloseChatModal}
      />
    </div>
  );
}
