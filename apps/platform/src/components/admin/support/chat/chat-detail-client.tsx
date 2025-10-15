"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Clock,
  User,
  Send,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Circle,
  RefreshCw,
} from "lucide-react";
import {
  ChatSession,
  SupportMessage,
  formatTimeAgo,
} from "@/lib/supportService";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc-client";

interface ChatDetailClientProps {
  sessionId: string;
  initialChatSession?: any;
}

export function ChatDetailClient({
  sessionId,
  initialChatSession,
}: ChatDetailClientProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch chat session details using tRPC
  const {
    data: chatSession,
    isLoading,
    error,
    refetch,
  } = api.support.getAdminChatSession.useQuery(
    { sessionId },
    {
      initialData: initialChatSession,
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (
          error?.message?.includes("UNAUTHORIZED") ||
          error?.message?.includes("FORBIDDEN")
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  );

  // Fetch chat messages using tRPC
  const { data: messagesData, isLoading: messagesLoading } =
    api.support.getAdminChatMessages.useQuery(
      { sessionId },
      {
        refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
        retry: (failureCount, error) => {
          // Don't retry on auth errors
          if (
            error?.message?.includes("UNAUTHORIZED") ||
            error?.message?.includes("FORBIDDEN")
          ) {
            return false;
          }
          return failureCount < 3;
        },
      },
    );

  // Extract messages from the API response
  const messages = useMemo(
    () => messagesData?.messages || [],
    [messagesData?.messages],
  );

  // Send message mutation using tRPC (admin procedure)
  const sendMessageMutation = api.support.sendAdminChatMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      // Refetch messages to get the latest
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "chat", sessionId, "messages"],
      });
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSubmittingMessage) return;

    setIsSubmittingMessage(true);
    try {
      await sendMessageMutation.mutateAsync({
        sessionId,
        content: newMessage.trim(),
      });
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <Circle className="h-3 w-3 mr-1 fill-current" />
            Active
          </Badge>
        );
      case "ended":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 border-gray-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      case "waiting":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Waiting
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Failed to Load Chat Session
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message || "There was an error loading the chat session."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/admin/support/chat">
              <Button variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat Management
              </Button>
            </Link>
            {error.message.includes("Authentication required") && (
              <Button
                onClick={() => (window.location.href = "/auth/signin")}
                variant="destructive"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chat Session Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested chat session could not be found.
          </p>
          <Link href="/admin/support/chat">
            <Button variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat Management
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return React.createElement(
    "div",
    { className: "w-full min-h-screen bg-background" },
    React.createElement(
      "div",
      { className: "border-b bg-card" },
      React.createElement(
        "div",
        { className: "w-full px-6 py-4" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between" },
          React.createElement(
            "div",
            { className: "flex items-center gap-4" },
            React.createElement(
              Link,
              { href: "/admin/support/chat" },
              React.createElement(
                Button,
                { variant: "ghost", size: "sm", className: "gap-2" },
                React.createElement(ArrowLeft, { className: "h-4 w-4" }),
                "Back to Chats",
              ),
            ),
            React.createElement(
              "div",
              { className: "flex items-center gap-3" },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "h1",
                  { className: "text-xl font-semibold" },
                  "Chat Session",
                ),
                React.createElement(
                  "p",
                  { className: "text-sm text-muted-foreground" },
                  chatSession.customer_name || chatSession.customer_email,
                ),
              ),
            ),
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            getStatusBadge(chatSession.status),
            React.createElement(
              Button,
              {
                onClick: () => refetch(),
                variant: "outline",
                size: "sm",
                className: "gap-2",
              },
              React.createElement(RefreshCw, { className: "h-4 w-4" }),
              "Refresh",
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "w-full px-6 py-6" },
      React.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-4 gap-6 w-full" },
        React.createElement(
          "div",
          { className: "lg:col-span-3 w-full" },
          React.createElement(
            Card,
            { className: "h-[calc(100vh-200px)] flex flex-col shadow-sm" },
            React.createElement(
              CardHeader,
              { className: "pb-3 border-b" },
              React.createElement(
                CardTitle,
                { className: "flex items-center gap-2 text-base font-medium" },
                React.createElement(MessageSquare, { className: "h-4 w-4" }),
                "Conversation",
              ),
            ),
            React.createElement(
              CardContent,
              { className: "flex-1 flex flex-col p-0" },
              React.createElement(
                "div",
                { className: "flex-1 overflow-y-auto p-6 space-y-4" },
                messagesLoading
                  ? React.createElement(
                      "div",
                      { className: "space-y-4" },
                      [...Array(3)].map((_, i) =>
                        React.createElement(
                          "div",
                          { key: i, className: "flex gap-3" },
                          React.createElement(Skeleton, {
                            className: "h-8 w-8 rounded-full",
                          }),
                          React.createElement(
                            "div",
                            { className: "space-y-2 flex-1" },
                            React.createElement(Skeleton, {
                              className: "h-4 w-24",
                            }),
                            React.createElement(Skeleton, {
                              className: "h-16 w-full",
                            }),
                          ),
                        ),
                      ),
                    )
                  : messages && messages.length > 0
                    ? messages.map((message: SupportMessage) =>
                        React.createElement(
                          "div",
                          {
                            key: message.id,
                            className: `flex gap-3 ${message.sender_type === "admin" ? "flex-row-reverse" : ""}`,
                          },
                          React.createElement(
                            Avatar,
                            { className: "h-8 w-8 flex-shrink-0" },
                            React.createElement(AvatarImage, {
                              src: message.sender?.image,
                            }),
                            React.createElement(
                              AvatarFallback,
                              {
                                className: `text-xs ${message.sender_type === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"}`,
                              },
                              message.sender_type === "admin" ? "A" : "C",
                            ),
                          ),
                          React.createElement(
                            "div",
                            {
                              className: `flex-1 max-w-md ${message.sender_type === "admin" ? "text-right" : ""}`,
                            },
                            React.createElement(
                              "div",
                              {
                                className: `text-xs text-muted-foreground mb-2 ${message.sender_type === "admin" ? "text-right" : ""}`,
                              },
                              React.createElement(
                                "span",
                                { className: "font-medium" },
                                message.sender?.name ||
                                  message.sender?.email ||
                                  (message.sender_type === "admin"
                                    ? "Admin"
                                    : "Customer"),
                              ),
                              React.createElement(
                                "span",
                                { className: "ml-2" },
                                formatTimeAgo(message.created_at),
                              ),
                            ),
                            React.createElement(
                              "div",
                              {
                                className: `inline-block p-3 rounded-2xl shadow-sm ${message.sender_type === "admin" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md"}`,
                              },
                              React.createElement(
                                "p",
                                {
                                  className:
                                    "text-sm leading-relaxed whitespace-pre-wrap break-words",
                                },
                                message.content,
                              ),
                            ),
                          ),
                        ),
                      )
                    : React.createElement(
                        "div",
                        { className: "text-center py-8 text-muted-foreground" },
                        React.createElement(MessageSquare, {
                          className: "h-12 w-12 mx-auto mb-4 opacity-50",
                        }),
                        React.createElement("p", null, "No messages yet"),
                      ),
                React.createElement("div", { ref: messagesEndRef }),
              ),
              chatSession.status === "active" &&
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(Separator),
                  React.createElement(
                    "div",
                    { className: "p-4 bg-muted/30" },
                    React.createElement(
                      "div",
                      { className: "flex gap-3" },
                      React.createElement(Textarea, {
                        value: newMessage,
                        onChange: (e: any) => setNewMessage(e.target.value),
                        onKeyPress: handleKeyPress,
                        placeholder: "Type your message...",
                        className:
                          "flex-1 min-h-[60px] max-h-32 resize-none border-0 bg-background shadow-sm",
                        disabled: isSubmittingMessage,
                      }),
                      React.createElement(
                        Button,
                        {
                          onClick: handleSendMessage,
                          disabled: !newMessage.trim() || isSubmittingMessage,
                          className: "self-end gap-2",
                          size: "sm",
                        },
                        React.createElement(Send, { className: "h-4 w-4" }),
                        "Send",
                      ),
                    ),
                  ),
                ),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "lg:col-span-1 space-y-4" },
          React.createElement(
            Card,
            { className: "shadow-sm" },
            React.createElement(
              CardHeader,
              { className: "pb-3" },
              React.createElement(
                CardTitle,
                { className: "text-base font-medium flex items-center gap-2" },
                React.createElement(User, { className: "h-4 w-4" }),
                "Customer",
              ),
            ),
            React.createElement(
              CardContent,
              { className: "space-y-4" },
              React.createElement(
                "div",
                { className: "flex items-start gap-3" },
                React.createElement(
                  Avatar,
                  { className: "h-10 w-10 flex-shrink-0" },
                  React.createElement(AvatarImage, {
                    src: chatSession.customer?.image,
                  }),
                  React.createElement(
                    AvatarFallback,
                    { className: "text-xs" },
                    chatSession.customer?.name?.[0] ||
                      chatSession.customer_name?.[0] ||
                      "C",
                  ),
                ),
                React.createElement(
                  "div",
                  { className: "flex-1 min-w-0" },
                  React.createElement(
                    "p",
                    { className: "font-medium text-sm leading-tight" },
                    chatSession.customer?.name ||
                      chatSession.customer_name ||
                      "Unknown Customer",
                  ),
                  React.createElement(
                    "p",
                    {
                      className: "text-xs text-muted-foreground mt-1 break-all",
                    },
                    chatSession.customer?.email || chatSession.customer_email,
                  ),
                ),
              ),
            ),
          ),
          React.createElement(
            Card,
            { className: "shadow-sm" },
            React.createElement(
              CardHeader,
              { className: "pb-3" },
              React.createElement(
                CardTitle,
                { className: "text-base font-medium flex items-center gap-2" },
                React.createElement(Clock, { className: "h-4 w-4" }),
                "Session Info",
              ),
            ),
            React.createElement(
              CardContent,
              { className: "space-y-4" },
              React.createElement(
                "div",
                { className: "space-y-3" },
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "p",
                    {
                      className:
                        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                    },
                    "Status",
                  ),
                  React.createElement(
                    "div",
                    { className: "mt-1" },
                    getStatusBadge(chatSession.status),
                  ),
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "p",
                    {
                      className:
                        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                    },
                    "Started",
                  ),
                  React.createElement(
                    "p",
                    { className: "text-sm" },
                    formatTimeAgo(chatSession.started_at),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
