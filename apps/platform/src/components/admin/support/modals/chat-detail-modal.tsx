"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  MessageSquare,
  Clock,
  User,
  Send,
  Circle,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  ChatSession,
  SupportMessage,
  formatTimeAgo,
} from "@/lib/supportService";
import { toast } from "sonner";

interface ChatDetailModalProps {
  chatId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ChatDetailModal({
  chatId,
  open,
  onClose,
}: ChatDetailModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat session details using tRPC
  const {
    data: chatSession,
    isLoading,
    error,
  } = api.support.getAdminChatSession.useQuery(
    { sessionId: chatId! },
    { enabled: !!chatId && open },
  );

  // Fetch chat messages using tRPC
  const { data: messagesData, isLoading: messagesLoading } =
    api.support.getAdminChatMessages.useQuery(
      { sessionId: chatId! },
      {
        enabled: !!chatId && open,
        refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
      },
    );

  const messages = useMemo(
    () => messagesData?.messages || [],
    [messagesData?.messages],
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // tRPC mutations
  const sendMessageMutation = api.support.sendAdminChatMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      toast.success("Message sent successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "chat", chatId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
      setIsSubmittingMessage(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsSubmittingMessage(false);
    },
  });

  const endChatMutation = api.support.endChatSession.useMutation({
    onSuccess: () => {
      toast.success("Chat session ended");
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
      onClose();
    },
    onError: (error) => {
      console.error("Error ending chat:", error);
      toast.error("Failed to end chat");
    },
  });

  const handleSendMessage = async () => {
    if (!chatId || !newMessage.trim()) return;

    setIsSubmittingMessage(true);
    sendMessageMutation.mutate({
      sessionId: chatId,
      content: newMessage.trim(),
      isInternal: false,
    });
  };

  const handleEndChat = async () => {
    if (!chatId) return;

    endChatMutation.mutate({
      sessionId: chatId,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "waiting":
        return "text-yellow-600 dark:text-yellow-400";
      case "ended":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Circle className="h-2 w-2 fill-current" />;
      case "waiting":
        return <Clock className="h-3 w-3" />;
      case "ended":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Circle className="h-2 w-2 fill-current" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  `Chat Session #${chatSession?.id?.slice(-8) || "Loading..."}`
                )}
              </DialogTitle>
              {isLoading ? (
                <div className="mt-1">
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : (
                <DialogDescription className="mt-1 flex items-center gap-2">
                  {chatSession ? (
                    <>
                      <span className={getStatusColor(chatSession.status)}>
                        {getStatusIcon(chatSession.status)}
                      </span>
                      <span>
                        {chatSession.status === "active"
                          ? "Active conversation"
                          : chatSession.status === "waiting"
                            ? "Waiting for response"
                            : "Chat ended"}
                      </span>
                      <span>•</span>
                      <span>
                        Started {formatTimeAgo(chatSession.created_at)}
                      </span>
                    </>
                  ) : (
                    "Loading chat details..."
                  )}
                </DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {chatSession?.status === "active" && (
                <Button variant="outline" size="sm" onClick={handleEndChat}>
                  End Chat
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Chat</h3>
              <p className="text-muted-foreground">
                There was an error loading the chat session.
              </p>
            </div>
          ) : chatSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
              {/* Main Chat Area */}
              <div className="lg:col-span-3 flex flex-col">
                {/* Customer Info */}
                <div className="p-4 border-b bg-muted/10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chatSession.customer?.picture} />
                      <AvatarFallback>
                        {(
                          chatSession.customer?.name ||
                          chatSession.customer_email
                        )
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {chatSession.customer?.name || "Anonymous Customer"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {chatSession.customer_email}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(chatSession.status)} border-current`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(chatSession.status)}
                          {chatSession.status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                        >
                          <Skeleton className="h-16 w-64" />
                        </div>
                      ))
                    ) : messages && messages.length > 0 ? (
                      messages.map((message: SupportMessage) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender_type === "admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {message.sender_type !== "admin" && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={chatSession.customer?.picture}
                              />
                              <AvatarFallback className="text-xs">
                                {(
                                  chatSession.customer?.name ||
                                  chatSession.customer_email
                                )
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender_type === "admin"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className="text-xs opacity-70 mt-2">
                              {formatTimeAgo(message.created_at)}
                            </p>
                          </div>

                          {message.sender_type === "admin" && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                AD
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                {chatSession.status === "active" && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[60px]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSubmittingMessage}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Info Sidebar */}
              <div className="border-l p-4 bg-muted/10">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Chat Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(chatSession.status)} border-current`}
                        >
                          {chatSession.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{formatTimeAgo(chatSession.created_at)}</span>
                      </div>
                      {chatSession.ended_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ended:</span>
                          <span>{formatTimeAgo(chatSession.ended_at)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Messages:</span>
                        <span>{messages?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {chatSession.customer && (
                    <div>
                      <h4 className="font-medium mb-2">Customer Info</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p>{chatSession.customer.name || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p>{chatSession.customer_email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
