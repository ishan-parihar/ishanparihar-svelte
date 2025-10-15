"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import { ChatSession, formatTimeAgo } from "@/lib/supportService";
import Link from "next/link";

interface PaginatedChatSessionsProps {
  title?: string;
  description?: string;
  showFilters?: boolean;
  defaultLimit?: number;
  statusFilter?: string;
}

interface ChatSessionsResponse {
  chat_sessions: ChatSession[];
  total: number;
  limit: number;
  offset: number;
}

export function PaginatedChatSessions({
  title = "Chat Sessions",
  description = "Manage customer chat sessions",
  showFilters = true,
  defaultLimit = 20,
  statusFilter: initialStatusFilter = "all",
}: PaginatedChatSessionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [sortBy, setSortBy] = useState<string>("last_activity_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(defaultLimit);

  // Calculate offset
  const offset = (currentPage - 1) * limit;

  // Build query parameters
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (searchQuery) queryParams.set("search", searchQuery);
  if (statusFilter !== "all") queryParams.set("status", statusFilter);

  // Fetch chat sessions with server-side pagination and filtering using tRPC
  const {
    data: chatData,
    isLoading,
    error,
    refetch,
  } = api.support.getAllChatSessions.useQuery(
    {
      page: currentPage,
      limit: limit,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    },
    {
      placeholderData: keepPreviousData,
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    },
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const chatSessions = chatData?.chat_sessions || [];
  const total = chatData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "abandoned":
        return "bg-red-100 text-red-800 border-red-200";
      case "transferred":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "ended":
        return "Ended";
      case "abandoned":
        return "Abandoned";
      case "transferred":
        return "Transferred";
      default:
        return status;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Chat Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Failed to load chat sessions. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border rounded-none bg-card dark:bg-card shadow-none">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="text-foreground">{title}</span>
            <CardDescription className="mt-1 text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {total} total sessions
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border bg-background dark:bg-background"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && chatSessions.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium">No chat sessions found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No chat sessions have been started yet"}
            </p>
          </div>
        )}

        {/* Chat Sessions List */}
        {!isLoading && chatSessions.length > 0 && (
          <div className="space-y-2">
            {chatSessions.map((session: any) => (
              <div
                key={session.id}
                className="flex items-center space-x-4 p-4 border border-border rounded-none hover:bg-muted/30 transition-colors"
              >
                {/* Customer Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.customer?.image}
                    alt={
                      session.customer?.name ||
                      session.customer_name ||
                      "Customer"
                    }
                  />
                  <AvatarFallback>
                    {(
                      session.customer?.name ||
                      session.customer_name ||
                      session.customer_email
                    )
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {session.session_id}
                    </span>
                  </div>

                  <h4 className="text-sm font-medium">
                    {session.customer?.name ||
                      session.customer_name ||
                      session.customer_email}
                  </h4>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {session.customer_email}
                    </span>
                    {session.message_count && session.message_count > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {session.message_count} messages
                      </div>
                    )}
                  </div>

                  {/* Admin Info */}
                  {session.admin && (
                    <div className="flex items-center mt-1">
                      <User className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {session.admin.name || session.admin.email}
                      </span>
                    </div>
                  )}

                  {/* Last Message Preview */}
                  {session.last_message && (
                    <div className="mt-1 text-xs text-muted-foreground truncate">
                      <span className="font-medium">
                        {session.last_message.sender_name}:
                      </span>{" "}
                      {session.last_message.content}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <Badge className={getStatusColor(session.status)}>
                  {getStatusLabel(session.status)}
                </Badge>

                {/* Time Info */}
                <div className="text-right">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(
                      session.last_activity_at || session.started_at,
                    )}
                  </div>
                  {session.started_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Started: {formatTimeAgo(session.started_at)}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Link href={`/admin/support/chat/${session.session_id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border hover:bg-muted/50"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
              {total} sessions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else {
                    const start = Math.max(1, currentPage - 2);
                    page = start + i;
                  }

                  if (page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
