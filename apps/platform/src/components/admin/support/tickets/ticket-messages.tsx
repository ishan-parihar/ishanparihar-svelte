"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, User, Bot, Eye, EyeOff } from "lucide-react";
import { SupportMessage, formatTimeAgo } from "@/lib/supportService";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc-client";

interface TicketMessagesProps {
  ticketId: string;
}

export function TicketMessages({ ticketId }: TicketMessagesProps) {
  // Use tRPC to fetch ticket with messages (includes internal messages for admin)
  const {
    data: ticketData,
    isLoading,
    error,
  } = api.support.getAdminTicket.useQuery(
    { id: ticketId },
    {
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    },
  );

  // Extract messages from ticket data
  const messagesData = { messages: ticketData?.messages || [] };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Failed to load messages
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const messages = messagesData?.messages || [];

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Messages</CardTitle>
          <Badge variant="secondary">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-6">
            {messages.map((message: SupportMessage, index: number) => (
              <MessageItem
                key={message.id}
                message={message}
                isFirst={index === 0}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface MessageItemProps {
  message: SupportMessage;
  isFirst: boolean;
}

function MessageItem({ message, isFirst }: MessageItemProps) {
  const isSystem = message.sender_type === "system";
  const isInternal = message.is_internal;
  const isCustomer = message.sender_type === "customer";
  const isAdmin = message.sender_type === "admin";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-muted px-3 py-2 rounded-lg text-xs text-muted-foreground max-w-md text-center">
          <Bot className="inline h-3 w-3 mr-1" />
          {message.content}
          <div className="mt-1 text-xs opacity-75">
            {formatTimeAgo(message.created_at)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex space-x-3",
        isInternal &&
          "bg-yellow-50 border border-yellow-200 rounded-lg p-3 -m-3",
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={message.sender?.image}
          alt={message.sender?.name || message.sender_name || "User"}
        />
        <AvatarFallback className="text-xs">
          {(message.sender?.name || message.sender_name || message.sender_email)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium">
            {message.sender?.name || message.sender_name || "Unknown"}
          </span>

          <Badge
            variant={isCustomer ? "default" : isAdmin ? "secondary" : "outline"}
            className="text-xs"
          >
            {isCustomer ? "Customer" : isAdmin ? "Admin" : message.sender_type}
          </Badge>

          {isInternal && (
            <Badge
              variant="outline"
              className="text-xs bg-yellow-100 border-yellow-300"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Internal
            </Badge>
          )}

          {isFirst && (
            <Badge variant="outline" className="text-xs">
              Initial Message
            </Badge>
          )}
        </div>

        {/* Message Body */}
        <div
          className={cn(
            "text-sm whitespace-pre-wrap",
            isInternal && "text-yellow-800",
          )}
        >
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-xs text-muted-foreground"
              >
                <MessageSquare className="h-3 w-3" />
                <span>{attachment.name || "Attachment"}</span>
                <span>
                  (
                  {attachment.size
                    ? `${Math.round(attachment.size / 1024)}KB`
                    : "Unknown size"}
                  )
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(message.created_at)}</span>

          {message.read_at && (
            <>
              <span>•</span>
              <Eye className="h-3 w-3" />
              <span>Read {formatTimeAgo(message.read_at)}</span>
            </>
          )}

          {message.is_automated && (
            <>
              <span>•</span>
              <Bot className="h-3 w-3" />
              <span>Automated</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
