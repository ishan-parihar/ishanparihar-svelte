"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/trpc-client";
import {
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  X,
  Minimize2,
  Maximize2,
  Circle,
} from "lucide-react";
import {
  ChatSession,
  SupportMessage,
  formatTimeAgo,
} from "@/lib/supportService";
import { useChatSSE } from "@/hooks/useChatSSE";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { CustomerInfoPanel } from "./customer-info-panel";
import { ChatActions } from "./chat-actions";

interface ChatWindowProps {
  session: ChatSession;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
  className?: string;
}

export function ChatWindow({
  session,
  onClose,
  onMinimize,
  onMaximize,
  isMinimized = false,
  isMaximized = false,
  className = "",
}: ChatWindowProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // SSE connection for real-time updates
  const { connected, error: sseError } = useChatSSE({
    sessionId: session.session_id,
    onMessage: (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    },
    onStatusUpdate: (status) => {
      // Handle session status updates
      console.log("Session status updated:", status);
    },
    onUserTyping: (userId, isTyping) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    },
  });

  // Fetch initial messages using tRPC
  const { data: chatData, isLoading: chatLoading } =
    api.support.getAdminChatSession.useQuery(
      { sessionId: session.session_id },
      {
        refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      },
    );

  // Update messages when data changes
  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages);
    }
  }, [chatData?.messages]);

  // Set loading state
  useEffect(() => {
    setIsLoading(chatLoading);
  }, [chatLoading]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // tRPC mutation for sending messages
  const sendMessageMutation = api.support.sendAdminChatMessage.useMutation({
    onSuccess: () => {
      // Message sent successfully, SSE will handle adding it to the UI
      setIsSending(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      // TODO: Show error toast
      setIsSending(false);
    },
  });

  // Send message
  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate({
      sessionId: session.session_id,
      content: content.trim(),
      isInternal: false,
    });
  };

  // End chat session
  const handleEndSession = async () => {
    try {
      await fetch(`/api/admin/support/chat/${session.session_id}/messages`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_status",
          status: "ended",
        }),
      });
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  if (isMinimized) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-sm font-medium">
                {session.customer?.name || session.customer_name || "Customer"}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" onClick={onMaximize}>
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className={`flex flex-col ${isMaximized ? "h-full" : "h-96"} ${className}`}
    >
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.customer?.image}
                alt={
                  session.customer?.name || session.customer_name || "Customer"
                }
              />
              <AvatarFallback className="text-xs">
                {(
                  session.customer?.name ||
                  session.customer_name ||
                  session.customer_email
                )
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium">
                  {session.customer?.name ||
                    session.customer_name ||
                    "Anonymous Customer"}
                </h3>
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                {session.customer_email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Badge
              variant={connected ? "default" : "destructive"}
              className="text-xs"
            >
              {connected ? "Connected" : "Disconnected"}
            </Badge>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>

            {onMinimize && (
              <Button size="sm" variant="ghost" onClick={onMinimize}>
                <Minimize2 className="h-3 w-3" />
              </Button>
            )}

            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MessageList
                messages={messages}
                typingUsers={typingUsers}
                currentUserId={session.admin_id}
              />
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Composer */}
          <div className="border-t p-3">
            <MessageComposer
              onSendMessage={handleSendMessage}
              disabled={isSending || !connected}
              placeholder="Type your message..."
            />
          </div>
        </div>

        {/* Customer Info Panel */}
        {showCustomerInfo && (
          <div className="w-64 border-l">
            <CustomerInfoPanel
              session={session}
              onClose={() => setShowCustomerInfo(false)}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t p-2">
        <ChatActions
          session={session}
          onEndSession={handleEndSession}
          onCreateTicket={() => {
            // Navigate to create ticket with pre-filled customer info
            window.location.href = `/admin/support/tickets/new?customer_email=${session.customer_email}&customer_name=${session.customer_name || ""}`;
          }}
        />
      </div>
    </Card>
  );
}
