"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  Bot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  SupportTicket,
  SupportMessage,
  formatTimeAgo,
} from "@/lib/supportService";
import Link from "next/link";

interface CustomerTicketDetailProps {
  ticketId: string;
}

export function CustomerTicketDetail({ ticketId }: CustomerTicketDetailProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ticket details using tRPC
  const {
    data: ticketData,
    isLoading,
    error,
  } = api.support.getTicket.useQuery(
    { id: ticketId },
    {
      enabled: !!session?.user && !!ticketId,
      refetchInterval: 30000, // Refetch every 30 seconds for updates
    },
  );

  const ticket = ticketData?.ticket;
  const messages = ticketData?.messages || [];

  // tRPC mutation for sending messages
  const sendMessageMutation = api.support.sendTicketMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");

      // Refetch ticket data to get the new message
      queryClient.invalidateQueries({
        queryKey: ["customer", "support", "ticket", ticketId],
      });

      toast.success("Message sent successfully");
      setIsSending(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
      setIsSending(false);
    },
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate({
      ticketId,
      content: newMessage.trim(),
      isInternal: false,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Ticket Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The ticket you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link href="/account/support/tickets">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/account/support/tickets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">#{ticket.ticket_number}</h1>
            <p className="text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {getStatusIcon(ticket.status)}
            <span className="ml-1">{ticket.status}</span>
          </Badge>
          <Badge variant="outline">
            {getPriorityIcon(ticket.priority)}
            <span className="ml-1">{ticket.priority}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm">
                {ticket.description}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-8 w-8 mx-auto mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message: SupportMessage) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender_type === "customer"
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.sender_type === "customer" ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                            <span className="text-xs font-medium">
                              {message.sender?.name ||
                                (message.sender_type === "customer"
                                  ? "You"
                                  : "Support Agent")}
                            </span>
                            <span className="text-xs opacity-70">
                              {formatTimeAgo(message.created_at)}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              {ticket.status !== "closed" && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">{formatTimeAgo(ticket.created_at)}</p>
              </div>

              {ticket.category && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <Badge
                    variant="outline"
                    className="mt-1"
                    style={{
                      backgroundColor: ticket.category.color + "20",
                      borderColor: ticket.category.color,
                      color: ticket.category.color,
                    }}
                  >
                    {ticket.category.name}
                  </Badge>
                </div>
              )}

              {ticket.assigned_admin && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Assigned Agent
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {ticket.assigned_admin.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {ticket.assigned_admin.name ||
                        ticket.assigned_admin.email}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
