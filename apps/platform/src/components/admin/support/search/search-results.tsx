"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  MessageSquare,
  User,
  Clock,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  SupportTicket,
  SupportMessage,
  ChatSession,
  formatTimeAgo,
  getPriorityColor,
  getStatusColor,
  getPriorityLabel,
  getStatusLabel,
} from "@/lib/supportService";
import Link from "next/link";

interface SearchResultsProps {
  results: {
    tickets: SupportTicket[];
    messages: SupportMessage[];
    customers: any[];
    chats: ChatSession[];
    total: number;
  };
  searchQuery: string;
  searchType: string;
}

export function SearchResults({
  results,
  searchQuery,
  searchType,
}: SearchResultsProps) {
  const { tickets, messages, customers, chats, total } = results;

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  if (total === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No results found for "{searchQuery}". Try adjusting your search
            terms or filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Search Results
          <Badge variant="secondary" className="ml-2">
            {total} result{total !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Results for "{searchQuery}"{" "}
          {searchType !== "all" && `in ${searchType}`}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={searchType === "all" ? "tickets" : searchType}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customers ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chats ({chats.length})
            </TabsTrigger>
          </TabsList>

          {/* Tickets Results */}
          <TabsContent value="tickets" className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tickets found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {ticket.ticket_number}
                          </span>
                          <Badge
                            variant={
                              ticket.status === "open"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getPriorityColor(ticket.priority),
                              color: getPriorityColor(ticket.priority),
                            }}
                          >
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>

                        <h4 className="font-medium mb-1">
                          {highlightText(ticket.subject, searchQuery)}
                        </h4>

                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {highlightText(ticket.description, searchQuery)}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{ticket.customer_email}</span>
                          <span>{formatTimeAgo(ticket.created_at)}</span>
                          {ticket.category && (
                            <Badge variant="outline" className="text-xs">
                              {ticket.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Link href={`/admin/support/tickets/${ticket.id}`}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Results */}
          <TabsContent value="messages" className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No messages found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.sender?.image}
                          alt={
                            message.sender?.name ||
                            message.sender_name ||
                            "User"
                          }
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sender?.name ||
                              message.sender_name ||
                              "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.sender_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(message.created_at)}
                          </span>
                        </div>

                        <p className="text-sm mb-2">
                          {highlightText(message.content, searchQuery)}
                        </p>

                        {message.ticket_id && (
                          <Link
                            href={`/admin/support/tickets/${message.ticket_id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View in ticket →
                          </Link>
                        )}

                        {message.chat_session_id && (
                          <Link
                            href={`/admin/support/chat/${message.chat_session_id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View in chat →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Customers Results */}
          <TabsContent value="customers" className="space-y-4">
            {customers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No customers found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={customer.picture}
                            alt={customer.name || "Customer"}
                          />
                          <AvatarFallback>
                            {(customer.name || customer.email)
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h4 className="font-medium">
                            {highlightText(
                              customer.name || "Anonymous",
                              searchQuery,
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {highlightText(customer.email, searchQuery)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {customer.ticket_count || 0} tickets
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {customer.chat_count || 0} chats
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/support/tickets?customer_email=${encodeURIComponent(customer.email)}`}
                        >
                          <Button size="sm" variant="outline">
                            View Tickets
                          </Button>
                        </Link>

                        {customer.id && (
                          <Link href={`/admin/accounts?user_id=${customer.id}`}>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Profile
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chat Sessions Results */}
          <TabsContent value="chats" className="space-y-4">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No chat sessions found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={chat.customer?.image}
                            alt={
                              chat.customer?.name ||
                              chat.customer_name ||
                              "Customer"
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {(
                              chat.customer?.name ||
                              chat.customer_name ||
                              chat.customer_email
                            )
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h4 className="font-medium">
                            {highlightText(
                              chat.customer?.name ||
                                chat.customer_name ||
                                "Anonymous",
                              searchQuery,
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {highlightText(chat.customer_email, searchQuery)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                chat.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {chat.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(chat.started_at)}
                            </span>
                            {chat.admin && (
                              <span className="text-xs text-muted-foreground">
                                with {chat.admin.name || chat.admin.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link href={`/admin/support/chat/${chat.session_id}`}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
