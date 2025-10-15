"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Check, CheckCheck, Bot } from "lucide-react";
import { SupportMessage, formatTimeAgo } from "@/lib/supportService";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: SupportMessage[];
  typingUsers: Set<string>;
  currentUserId?: string;
}

export function MessageList({
  messages,
  typingUsers,
  currentUserId,
}: MessageListProps) {
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                {formatDateSeparator(date)}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {dayMessages.map((message, index) => {
                const isCurrentUser = message.sender_id === currentUserId;
                const isSystem = message.sender_type === "system";
                const isInternal = message.is_internal;
                const showAvatar = !isCurrentUser && !isSystem;
                const nextMessage = dayMessages[index + 1];
                const isLastInGroup =
                  !nextMessage ||
                  nextMessage.sender_id !== message.sender_id ||
                  nextMessage.sender_type !== message.sender_type;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    isSystem={isSystem}
                    isInternal={isInternal}
                    showAvatar={showAvatar && isLastInGroup}
                    showTimestamp={isLastInGroup}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span className="text-xs">
              {typingUsers.size === 1
                ? "Someone is typing..."
                : `${typingUsers.size} people are typing...`}
            </span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface MessageBubbleProps {
  message: SupportMessage;
  isCurrentUser: boolean;
  isSystem: boolean;
  isInternal: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

function MessageBubble({
  message,
  isCurrentUser,
  isSystem,
  isInternal,
  showAvatar,
  showTimestamp,
}: MessageBubbleProps) {
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground max-w-xs text-center">
          <Bot className="inline h-3 w-3 mr-1" />
          {message.content}
        </div>
      </div>
    );
  }

  if (isInternal) {
    return (
      <div className="flex justify-end">
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-2 rounded-lg max-w-xs">
          <div className="flex items-center space-x-1 mb-1">
            <Badge
              variant="outline"
              className="text-xs border-yellow-400 text-yellow-700 dark:text-yellow-300"
            >
              Internal Note
            </Badge>
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {message.content}
          </p>
          {showTimestamp && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              {formatTimeAgo(message.created_at)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end space-x-2",
        isCurrentUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar for other users */}
      {showAvatar && !isCurrentUser && (
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={message.sender?.image}
            alt={message.sender?.name || message.sender_name || "User"}
          />
          <AvatarFallback className="text-xs">
            {(
              message.sender?.name ||
              message.sender_name ||
              message.sender_email
            )
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "max-w-xs lg:max-w-md",
          isCurrentUser ? "order-1" : "order-2",
        )}
      >
        {/* Sender name for non-current users */}
        {!isCurrentUser && !isSystem && (
          <p className="text-xs text-muted-foreground mb-1 px-1">
            {message.sender?.name || message.sender_name || "Customer"}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "px-3 py-2 rounded-lg",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-xs"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>{attachment.name || "Attachment"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and read status */}
        {showTimestamp && (
          <div
            className={cn(
              "flex items-center space-x-1 mt-1 px-1",
              isCurrentUser ? "justify-end" : "justify-start",
            )}
          >
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(message.created_at)}
            </span>

            {/* Read status for current user messages */}
            {isCurrentUser && (
              <div className="text-muted-foreground">
                {message.read_at ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spacer for current user messages */}
      {isCurrentUser && <div className="w-6" />}
    </div>
  );
}

// Helper functions
function groupMessagesByDate(
  messages: SupportMessage[],
): Record<string, SupportMessage[]> {
  return messages.reduce(
    (groups, message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, SupportMessage[]>,
  );
}

function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
