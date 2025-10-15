"use client";

import { useState, useEffect } from "react";
import { keepPreviousData } from "@tanstack/react-query";
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
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import {
  SupportTicket,
  formatTimeAgo,
  getPriorityColor,
  getStatusColor,
  getPriorityLabel,
  getStatusLabel,
  ticketNeedsAttention,
} from "@/lib/supportService";
import Link from "next/link";

interface PaginatedTicketsTableProps {
  title?: string;
  description?: string;
  showFilters?: boolean;
  defaultLimit?: number;
}

interface TicketsResponse {
  tickets: SupportTicket[];
  total: number;
  limit: number;
  offset: number;
}

export function PaginatedTicketsTable({
  title = "Support Tickets",
  description = "Manage and track customer support tickets",
  showFilters = true,
  defaultLimit = 20,
}: PaginatedTicketsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(defaultLimit);

  // Calculate offset
  const offset = (currentPage - 1) * limit;

  // Build query parameters
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  if (searchQuery) queryParams.set("search", searchQuery);
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (priorityFilter !== "all") queryParams.set("priority", priorityFilter);
  if (categoryFilter !== "all") queryParams.set("category_id", categoryFilter);
  if (assignedToFilter !== "all") {
    if (assignedToFilter === "unassigned") {
      queryParams.set("assigned_to", "unassigned");
    } else {
      queryParams.set("assigned_to", assignedToFilter);
    }
  }

  // Fetch tickets with server-side pagination and filtering using tRPC
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
  } = api.support.getAllTickets.useQuery(
    {
      page: currentPage,
      limit: limit,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      priority: priorityFilter !== "all" ? (priorityFilter as any) : undefined,
      assignedTo: assignedToFilter !== "all" ? assignedToFilter : undefined,
    },
    {
      placeholderData: keepPreviousData, // Keep previous data while loading new data
    },
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    assignedToFilter,
  ]);

  const tickets = ticketsData?.tickets || [];
  const total = ticketsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Failed to load support tickets. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            {title}
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {total} total tickets
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={assignedToFilter}
              onValueChange={setAssignedToFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {/* TODO: Add actual admin users */}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
                setAssignedToFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sort by:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("created_at")}
            className={`h-6 px-2 ${sortBy === "created_at" ? "bg-muted" : ""}`}
          >
            Created{" "}
            {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("updated_at")}
            className={`h-6 px-2 ${sortBy === "updated_at" ? "bg-muted" : ""}`}
          >
            Updated{" "}
            {sortBy === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("priority")}
            className={`h-6 px-2 ${sortBy === "priority" ? "bg-muted" : ""}`}
          >
            Priority{" "}
            {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
        </div>

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
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tickets.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium">No tickets found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters"
                : "No support tickets have been created yet"}
            </p>
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && tickets.length > 0 && (
          <div className="space-y-2">
            {tickets.map((ticket: SupportTicket) => {
              const needsAttention = ticketNeedsAttention(ticket);

              return (
                <div
                  key={ticket.id}
                  className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    needsAttention ? "border-orange-200 bg-orange-50/50" : ""
                  }`}
                >
                  {/* Customer Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={ticket.customer?.image}
                      alt={
                        ticket.customer?.name ||
                        ticket.customer_name ||
                        "Customer"
                      }
                    />
                    <AvatarFallback>
                      {(
                        ticket.customer?.name ||
                        ticket.customer_name ||
                        ticket.customer_email
                      )
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Ticket Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      {needsAttention && (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      )}
                    </div>

                    <h4 className="text-sm font-medium truncate">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {ticket.customer?.name ||
                          ticket.customer_name ||
                          ticket.customer_email}
                      </span>
                      {ticket.category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: ticket.category.color }}
                        >
                          {ticket.category.name}
                        </Badge>
                      )}
                      {ticket.message_count && ticket.message_count > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {ticket.message_count}
                        </div>
                      )}
                    </div>

                    {/* Assignment Info */}
                    {ticket.assigned_admin && (
                      <div className="flex items-center mt-1">
                        <User className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {ticket.assigned_admin.name ||
                            ticket.assigned_admin.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Priority Badge */}
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: getPriorityColor(ticket.priority),
                      color: getPriorityColor(ticket.priority),
                    }}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </Badge>

                  {/* Status Badge */}
                  <Badge
                    variant={
                      ticket.status === "open"
                        ? "destructive"
                        : ticket.status === "resolved"
                          ? "default"
                          : "secondary"
                    }
                    style={{
                      backgroundColor:
                        ticket.status === "resolved"
                          ? getStatusColor(ticket.status)
                          : undefined,
                    }}
                  >
                    {getStatusLabel(ticket.status)}
                  </Badge>

                  {/* Time Info */}
                  <div className="text-right">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(ticket.created_at)}
                    </div>
                    {ticket.last_admin_reply_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last reply: {formatTimeAgo(ticket.last_admin_reply_at)}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link href={`/admin/support/tickets/${ticket.id}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
              {total} tickets
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
                    // Show pages around current page
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
