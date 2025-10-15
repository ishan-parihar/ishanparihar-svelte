"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Ticket,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Headphones,
} from "lucide-react";
import {
  SupportTicket,
  ChatSession,
  formatTimeAgo,
} from "@/lib/supportService";
import { CreateTicketModal } from "./create-ticket-modal";
import Link from "next/link";

export function CustomerSupportWidget() {
  const { data: session } = useSession();
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  // Fetch customer's tickets using tRPC
  const {
    data: ticketsData,
    refetch: refetchTickets,
    error: ticketsError,
  } = api.support.getMyTickets.useQuery(
    {
      page: 1,
      limit: 10,
    },
    {
      enabled: !!session?.user,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  );

  // Fetch customer's chat sessions using tRPC
  const { data: chatData, refetch: refetchChats } =
    api.support.getMyChatSessions.useQuery(
      {
        page: 1,
        limit: 10,
      },
      {
        enabled: !!session?.user,
        refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
      },
    );

  const tickets = ticketsData?.tickets || [];
  const chats = chatData?.sessions || [];

  // Debug logging
  console.log("Tickets data:", ticketsData);
  console.log("Tickets error:", ticketsError);
  console.log("Tickets array:", tickets);

  // Get counts for different ticket statuses
  const openTickets = tickets.filter(
    (t: SupportTicket) => t.status === "open",
  ).length;
  const inProgressTickets = tickets.filter(
    (t: SupportTicket) => t.status === "in_progress",
  ).length;
  const resolvedTickets = tickets.filter(
    (t: SupportTicket) => t.status === "resolved",
  ).length;
  const activeChats = chats.filter(
    (c: ChatSession) => c.status === "active",
  ).length;

  // Get recent activity
  const recentTickets = tickets.slice(0, 3);
  const recentChats = chats.slice(0, 2);

  const handleTicketCreated = () => {
    setShowCreateTicket(false);
    refetchTickets();
  };

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Support Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-lg font-bold">{openTickets}</p>
                  <p className="text-xs text-muted-foreground">Open Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-lg font-bold">{inProgressTickets}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-lg font-bold">{resolvedTickets}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold">{activeChats}</p>
                  <p className="text-xs text-muted-foreground">Active Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowCreateTicket(true)}
                className="flex items-center justify-center gap-2 h-12 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
              >
                <Ticket className="h-4 w-4" />
                Create Support Ticket
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 h-12 rounded-none border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  // This will trigger the floating chat bubble
                  const chatEvent = new CustomEvent("openChat");
                  window.dispatchEvent(chatEvent);
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Start Live Chat</span>
                {activeChats > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {activeChats} active
                  </Badge>
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              Our support team is here to help you with any questions or issues
              you may have.
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {(recentTickets.length > 0 || recentChats.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Tickets</CardTitle>
                    <Link href="/account/support/tickets">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTickets.map((ticket: SupportTicket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                ticket.status === "open"
                                  ? "destructive"
                                  : ticket.status === "resolved"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {ticket.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(ticket.created_at)}
                            </span>
                          </div>
                        </div>
                        <Link href={`/account/support/tickets/${ticket.id}`}>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Chats */}
            {recentChats.length > 0 && (
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Chats</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Access via chat bubble in bottom right
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentChats.map((chat: ChatSession) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                chat.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {chat.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(chat.started_at)}
                            </span>
                          </div>
                          {chat.admin && (
                            <p className="text-xs text-muted-foreground mt-1">
                              with {chat.admin.name || chat.admin.email}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Use chat bubble →
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTicketModal
        open={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onTicketCreated={handleTicketCreated}
      />
    </>
  );
}
