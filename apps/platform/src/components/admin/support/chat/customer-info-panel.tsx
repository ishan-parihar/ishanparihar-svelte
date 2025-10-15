"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Globe,
  ShoppingCart,
  Ticket,
  MessageSquare,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  ChatSession,
  SupportTicket,
  formatTimeAgo,
} from "@/lib/supportService";
import Link from "next/link";
import { api } from "@/lib/trpc-client";

interface CustomerInfoPanelProps {
  session: ChatSession;
  onClose: () => void;
}

interface CustomerData {
  user?: {
    id: string;
    name?: string;
    email: string;
    picture?: string;
    created_at: string;
    last_sign_in_at?: string;
    provider?: string;
  };
  tickets: SupportTicket[];
  orders: any[];
  chatSessions: ChatSession[];
}

export function CustomerInfoPanel({
  session,
  onClose,
}: CustomerInfoPanelProps) {
  // Use tRPC queries to fetch customer data
  const { data: userData, isLoading: userLoading } =
    api.admin.getUserByEmail.useQuery(
      { email: session.customer_email },
      { retry: false },
    );

  const { data: ticketsData, isLoading: ticketsLoading } =
    api.support.getAllTickets.useQuery(
      {
        customerEmail: session.customer_email,
        limit: 10,
        page: 1,
      },
      { retry: false },
    );

  const { data: ordersData, isLoading: ordersLoading } =
    api.payments.getOrdersAdmin.useQuery(
      {
        customerEmail: session.customer_email,
        limit: 5,
        page: 1,
      },
      { retry: false },
    );

  const { data: chatsData, isLoading: chatsLoading } =
    api.support.getActiveChatSessions.useQuery(
      {
        customerEmail: session.customer_email,
        limit: 5,
      },
      { retry: false },
    );

  const isLoading =
    userLoading || ticketsLoading || ordersLoading || chatsLoading;

  const customerData: CustomerData = {
    user: userData?.user || undefined,
    tickets: ticketsData?.tickets || [],
    orders: ordersData?.orders || [],
    chatSessions: chatsData?.chat_sessions || [],
  };

  if (isLoading) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const customer = customerData?.user || {
    email: session.customer_email,
    name: session.customer_name,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Customer Info</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Customer Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={"picture" in customer ? customer.picture : undefined}
                    alt={customer.name || "Customer"}
                  />
                  <AvatarFallback>
                    {(customer.name || customer.email)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {customer.name || "Anonymous Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {"created_at" in customer && customer.created_at && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatTimeAgo(customer.created_at)}</span>
                  </div>
                )}

                {"last_sign_in_at" in customer && customer.last_sign_in_at && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Last seen {formatTimeAgo(customer.last_sign_in_at)}
                    </span>
                  </div>
                )}

                {"provider" in customer && customer.provider && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Signed up via {customer.provider}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Tickets</CardTitle>
                <Badge variant="secondary">
                  {customerData?.tickets.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {customerData?.tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No previous tickets
                </p>
              ) : (
                <div className="space-y-2">
                  {customerData?.tickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ticket.subject}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={
                              ticket.status === "open"
                                ? "destructive"
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
                      <Link href={`/admin/support/tickets/${ticket.id}`}>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}

                  {customerData && customerData.tickets.length > 3 && (
                    <Link
                      href={`/admin/support/tickets?customer_email=${encodeURIComponent(session.customer_email)}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                      >
                        View all {customerData.tickets.length} tickets
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          {customerData?.orders && customerData.orders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Recent Orders</CardTitle>
                  <Badge variant="secondary">
                    {customerData.orders.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customerData.orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          #{order.order_number}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ${order.total_amount}
                          </span>
                        </div>
                      </div>
                      <Link href={`/admin/orders/${order.id}`}>
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

          {/* Other Chat Sessions */}
          {customerData?.chatSessions &&
            customerData.chatSessions.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Previous Chats</CardTitle>
                    <Badge variant="secondary">
                      {customerData.chatSessions.length - 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {customerData.chatSessions
                      .filter((chat) => chat.id !== session.id)
                      .slice(0, 3)
                      .map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
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
                          <Link href={`/admin/support/chat/${chat.session_id}`}>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/admin/support/tickets/new?customer_email=${encodeURIComponent(session.customer_email)}&customer_name=${encodeURIComponent(session.customer_name || "")}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </Link>

              {"id" in customer && customer.id && (
                <Link href={`/admin/accounts?user_id=${customer.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Account
                  </Button>
                </Link>
              )}

              <Link
                href={`/admin/support/tickets?customer_email=${encodeURIComponent(session.customer_email)}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
