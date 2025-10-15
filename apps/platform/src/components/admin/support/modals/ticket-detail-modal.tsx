"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Edit,
  MessageSquare,
  Clock,
  User,
  Mail,
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
import { toast } from "sonner";

interface TicketDetailModalProps {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
}

export function TicketDetailModal({
  ticketId,
  open,
  onClose,
}: TicketDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ticket details using tRPC
  const {
    data: ticket,
    isLoading,
    error,
  } = api.support.getAdminTicket.useQuery(
    { id: ticketId! },
    { enabled: !!ticketId && open },
  );

  // Extract messages from ticket data (tRPC returns ticket with messages)
  const messages = ticket?.messages || [];
  const messagesLoading = isLoading;

  // tRPC mutation for updating ticket
  const updateTicketMutation = api.support.updateTicket.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
    },
    onError: (error) => {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket");
    },
  });

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticketId) return;

    try {
      await updateTicketMutation.mutateAsync({
        id: ticketId,
        status: newStatus as
          | "open"
          | "in_progress"
          | "waiting"
          | "resolved"
          | "closed",
      });
      toast.success("Ticket status updated successfully");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!ticketId) return;

    try {
      await updateTicketMutation.mutateAsync({
        id: ticketId,
        priority: newPriority as "low" | "medium" | "high" | "urgent",
      });
      toast.success("Ticket priority updated successfully");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // tRPC mutation for sending replies
  const sendReplyMutation = api.support.sendAdminTicketMessage.useMutation({
    onSuccess: () => {
      setReplyMessage("");
      toast.success("Reply sent successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "ticket", ticketId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
      setIsSubmittingReply(false);
    },
    onError: (error) => {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
      setIsSubmittingReply(false);
    },
  });

  const handleReplySubmit = async () => {
    if (!ticketId || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    sendReplyMutation.mutate({
      ticketId,
      content: replyMessage.trim(),
      isInternal: false,
    });
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
                  `Ticket #${ticket?.ticket_number || "Loading..."}`
                )}
              </DialogTitle>
              {isLoading ? (
                <div className="mt-1">
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : (
                <DialogDescription className="mt-1">
                  {ticket?.subject || "Loading ticket details..."}
                </DialogDescription>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
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
              <h3 className="text-lg font-medium mb-2">
                Failed to Load Ticket
              </h3>
              <p className="text-muted-foreground">
                There was an error loading the ticket details.
              </p>
            </div>
          ) : ticket ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Main Content */}
              <div className="lg:col-span-2 flex flex-col">
                {/* Ticket Info */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ticket.customer?.picture} />
                        <AvatarFallback>
                          {(ticket.customer?.name || ticket.customer_email)
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {ticket.customer?.name || ticket.customer_email}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {ticket.customer_email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: getPriorityColor(ticket.priority),
                          color: getPriorityColor(ticket.priority),
                        }}
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge
                        variant={
                          ticket.status === "open" ? "destructive" : "secondary"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
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
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="p-6 border-t">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach File
                      </Button>
                      <Button
                        onClick={handleReplySubmit}
                        disabled={!replyMessage.trim() || isSubmittingReply}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingReply ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="border-l p-6 bg-muted/10">
                <div className="space-y-6">
                  {/* Status Control */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status
                    </label>
                    <Select
                      value={ticket.status}
                      onValueChange={handleStatusUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting">
                          Waiting for Customer
                        </SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Control */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Priority
                    </label>
                    <Select
                      value={ticket.priority}
                      onValueChange={handlePriorityUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ticket Info */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatTimeAgo(ticket.created_at)}</span>
                    </div>

                    {ticket.category && (
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Category:</span>
                        <Badge
                          variant="outline"
                          style={{ borderColor: ticket.category.color }}
                        >
                          {ticket.category.name}
                        </Badge>
                      </div>
                    )}

                    {ticket.assigned_admin && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned:</span>
                        <span>
                          {ticket.assigned_admin.name ||
                            ticket.assigned_admin.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
