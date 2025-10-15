"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle,
  Send,
  Paperclip,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SupportTicket,
  SupportMessage,
  formatTimeAgo,
  getPriorityColor,
  getStatusColor,
} from "@/lib/supportService";
import { TicketMessages } from "./ticket-messages";
import { TicketSidebar } from "./ticket-sidebar";
import Link from "next/link";

interface TicketDetailClientProps {
  ticketId: string;
  initialTicket?: SupportTicket;
}

export function TicketDetailClient({
  ticketId,
  initialTicket,
}: TicketDetailClientProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ticket details using tRPC
  const {
    data: ticket,
    isLoading,
    error,
    refetch,
  } = api.support.getAdminTicket.useQuery(
    { id: ticketId },
    {
      initialData: initialTicket,
      refetchInterval: 30000, // Refetch every 30 seconds for updates
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

  // Fetch categories for editing using tRPC
  const { data: categoriesData } = api.support.getCategories.useQuery();
  const categories = categoriesData?.categories || [];

  // Fetch admin users for assignment using tRPC
  const { data: adminUsers } = api.admin.getTeam.useQuery();

  // Use tRPC mutation for sending messages (admin procedure)
  const sendMessageMutation = api.support.sendAdminTicketMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      setIsInternal(false);
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "ticket", ticketId, "messages"],
      });
      setIsSending(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsSending(false);
    },
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate({
      ticketId,
      content: newMessage.trim(),
      isInternal: isInternal,
    });
  };

  // Use tRPC mutation for updating tickets
  const updateTicketMutation = api.support.updateTicket.useMutation({
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
    },
    onError: (error) => {
      console.error("Error updating ticket:", error);
    },
  });

  const handleTicketUpdate = async (updates: Partial<SupportTicket>) => {
    updateTicketMutation.mutate({
      id: ticketId,
      ...updates,
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Failed to load ticket</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          {error.message || "There was an error loading the ticket details."}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
          {error.message.includes("Authentication required") && (
            <Button
              onClick={() => (window.location.href = "/auth/signin")}
              variant="default"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading || !ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-surface-background dark:bg-[#1C1C1F]">
      {/* Header - Vectura Labs Theme */}
      <div className="border-b border-ui-border dark:border-neutral-800 bg-surface-background dark:bg-[#1C1C1F]">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/support/tickets">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-text-primary dark:text-white hover:bg-ui-border-light dark:hover:bg-neutral-800 rounded-none font-ui"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tickets
                </Button>
              </Link>

              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-headings font-bold text-text-primary dark:text-white">
                      {ticket.ticket_number}
                    </h1>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "destructive"
                          : ticket.status === "resolved"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs rounded-none font-ui"
                    >
                      {ticket.status.toUpperCase()}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs rounded-none border-ui-border dark:border-neutral-700 font-ui"
                      style={{
                        borderColor: getPriorityColor(ticket.priority),
                        color: getPriorityColor(ticket.priority),
                      }}
                    >
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <h2 className="text-sm text-text-secondary dark:text-neutral-400 mt-2 max-w-md truncate font-ui">
                    {ticket.subject}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-ui-border dark:border-neutral-700 hover:bg-ui-border-light dark:hover:bg-neutral-800 text-text-primary dark:text-white rounded-none font-ui"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>

              {ticket.status !== "closed" && (
                <Button
                  onClick={() => handleTicketUpdate({ status: "closed" })}
                  variant="destructive"
                  size="sm"
                  className="rounded-none font-ui"
                >
                  Close Ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Vectura Labs Theme */}
      <div className="w-full px-6 py-6 bg-surface-background dark:bg-[#1C1C1F]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
          {/* Left Column - Messages */}
          <div className="lg:col-span-3 space-y-6 w-full">
            {/* Ticket Description */}
            <Card className="shadow-none border-ui-border dark:border-neutral-800 rounded-none bg-surface-background dark:bg-[#1C1C1F]">
              <CardHeader className="pb-4 border-b border-ui-border dark:border-neutral-800">
                <CardTitle className="text-lg font-headings font-bold flex items-center gap-2 text-text-primary dark:text-white">
                  <MessageSquare className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary dark:text-white font-ui">
                    {ticket.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <TicketMessages ticketId={ticketId} />

            {/* Reply Form */}
            {ticket.status !== "closed" && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Reply to Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded border-input"
                        />
                        <span className="text-sm text-muted-foreground">
                          Internal note (not visible to customer)
                        </span>
                      </label>
                    </div>

                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="gap-2"
                    >
                      {isSending ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            <TicketSidebar
              ticket={ticket}
              categories={categories || []}
              adminUsers={adminUsers || []}
              onUpdate={handleTicketUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
