"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Eye,
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
import { TicketDetailModal } from "./modals/ticket-detail-modal";
import Link from "next/link";

interface RecentTicketsTableProps {
  tickets: SupportTicket[];
  isLoading?: boolean;
  searchQuery?: string;
  statusFilter?: string;
  priorityFilter?: string;
}

export function RecentTicketsTable({
  tickets,
  isLoading,
  searchQuery = "",
  statusFilter = "all",
  priorityFilter = "all",
}: RecentTicketsTableProps) {
  const [sortBy, setSortBy] = useState<
    "created_at" | "updated_at" | "priority"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets.filter((ticket) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          ticket.subject.toLowerCase().includes(query) ||
          ticket.ticket_number.toLowerCase().includes(query) ||
          ticket.customer_email.toLowerCase().includes(query) ||
          (ticket.customer_name &&
            ticket.customer_name.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && ticket.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) {
        return false;
      }

      return true;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleOpenTicketModal = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border border-ui-border dark:border-[var(--border-primary)] rounded-lg bg-surface-background dark:bg-[var(--bg-primary)]"
          >
            <Skeleton className="h-10 w-10 rounded-full bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-3 w-32 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </div>
            <Skeleton className="h-6 w-16 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            <Skeleton className="h-6 w-20 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            <Skeleton className="h-8 w-16 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredAndSortedTickets.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-text-secondary dark:text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="text-sm font-medium text-text-primary dark:text-[var(--text-primary)]">
          No tickets found
        </h3>
        <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] mt-1">
          {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
            ? "Try adjusting your filters"
            : "No support tickets have been created yet"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sort by:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("created_at")}
            className={`h-6 px-2 ${sortBy === "created_at" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            Created{" "}
            {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("updated_at")}
            className={`h-6 px-2 ${sortBy === "updated_at" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            Updated{" "}
            {sortBy === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("priority")}
            className={`h-6 px-2 ${sortBy === "priority" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            Priority{" "}
            {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto border border-border rounded-lg bg-card">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ticket
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredAndSortedTickets.map((ticket) => {
                const needsAttention = ticketNeedsAttention(ticket);

                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-muted/50 transition-colors ${
                      needsAttention ? "bg-destructive/10" : ""
                    }`}
                  >
                    {/* Ticket Column */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {ticket.ticket_number}
                        </span>
                        {needsAttention && (
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                      <div className="mt-1">
                        <h4 className="text-sm font-medium text-card-foreground truncate max-w-xs">
                          {ticket.subject}
                        </h4>
                        {ticket.category && (
                          <Badge
                            variant="outline"
                            className="text-xs mt-1"
                            style={{
                              borderColor: ticket.category.color,
                              color: ticket.category.color,
                            }}
                          >
                            {ticket.category.name}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Customer Column */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={ticket.customer?.image}
                            alt={
                              ticket.customer?.name ||
                              ticket.customer_name ||
                              "Customer"
                            }
                          />
                          <AvatarFallback className="text-xs">
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
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-card-foreground truncate">
                            {ticket.customer?.name ||
                              ticket.customer_name ||
                              "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {ticket.customer_email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Priority Column */}
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: getPriorityColor(ticket.priority),
                          color: getPriorityColor(ticket.priority),
                          backgroundColor: `${getPriorityColor(ticket.priority)}10`,
                        }}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </td>

                    {/* Status Column */}
                    <td className="p-3">
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
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </td>

                    {/* Assigned Column */}
                    <td className="p-3">
                      {ticket.assigned_admin ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3" />
                          <span className="truncate max-w-24">
                            {ticket.assigned_admin.name ||
                              ticket.assigned_admin.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Created Column */}
                    <td className="p-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(ticket.created_at)}
                      </div>
                      {ticket.message_count && ticket.message_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.message_count}
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => handleOpenTicketModal(ticket.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Link href={`/admin/support/tickets/${ticket.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Show More Button */}
        {filteredAndSortedTickets.length >= 10 && (
          <div className="pt-4 border-t">
            <Link href="/admin/support/tickets">
              <Button variant="ghost" size="sm" className="w-full">
                View All Tickets
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
