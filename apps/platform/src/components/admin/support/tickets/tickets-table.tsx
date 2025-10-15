"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
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
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TicketsTableProps {
  tickets: SupportTicket[];
  isLoading: boolean;
  selectedTickets: string[];
  onTicketSelect: (ticketId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSort: (field: string) => void;
  sorting: {
    sort_by: string;
    sort_order: string;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  onPageChange: (offset: number) => void;
}

export function TicketsTable({
  tickets,
  isLoading,
  selectedTickets,
  onTicketSelect,
  onSelectAll,
  onSort,
  sorting,
  pagination,
  onPageChange,
}: TicketsTableProps) {
  const allSelected =
    tickets.length > 0 && selectedTickets.length === tickets.length;
  const someSelected =
    selectedTickets.length > 0 && selectedTickets.length < tickets.length;

  const getSortIcon = (field: string) => {
    if (sorting.sort_by !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sorting.sort_order === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 bg-surface-background dark:bg-[var(--bg-primary)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border border-ui-border dark:border-[var(--border-primary)] rounded-lg bg-surface-background dark:bg-[var(--bg-secondary)]"
          >
            <Skeleton className="h-4 w-4 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
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

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-background dark:bg-[var(--bg-primary)]">
        <MessageSquare className="h-12 w-12 text-text-secondary dark:text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary dark:text-[var(--text-primary)]">
          No tickets found
        </h3>
        <p className="text-sm text-text-secondary dark:text-[var(--text-secondary)] mt-2">
          No support tickets match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-surface-background dark:bg-[var(--bg-primary)]">
      {/* Table Header */}
      <div className="border-b border-ui-border dark:border-[var(--border-primary)] bg-ui-border-light/30 dark:bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all tickets"
            className={cn(
              "border-ui-border dark:border-[var(--border-primary)] data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent",
              someSelected
                ? "data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                : "",
            )}
          />

          <div className="flex-1 grid grid-cols-12 gap-4 items-center text-sm font-medium text-text-primary dark:text-[var(--text-primary)]">
            <div className="col-span-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("subject")}
                className="h-auto p-0 font-medium text-text-primary dark:text-[var(--text-primary)] hover:text-brand-accent dark:hover:text-brand-accent"
              >
                Ticket
                {getSortIcon("subject")}
              </Button>
            </div>

            <div className="col-span-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("customer_email")}
                className="h-auto p-0 font-medium text-text-primary dark:text-[var(--text-primary)] hover:text-brand-accent dark:hover:text-brand-accent"
              >
                Customer
                {getSortIcon("customer_email")}
              </Button>
            </div>

            <div className="col-span-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("priority")}
                className="h-auto p-0 font-medium text-text-primary dark:text-[var(--text-primary)] hover:text-brand-accent dark:hover:text-brand-accent"
              >
                Priority
                {getSortIcon("priority")}
              </Button>
            </div>

            <div className="col-span-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("status")}
                className="h-auto p-0 font-medium text-text-primary dark:text-[var(--text-primary)] hover:text-brand-accent dark:hover:text-brand-accent"
              >
                Status
                {getSortIcon("status")}
              </Button>
            </div>

            <div className="col-span-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("assigned_to")}
                className="h-auto p-0 font-medium text-text-primary dark:text-[var(--text-primary)] hover:text-brand-accent dark:hover:text-brand-accent"
              >
                Assigned
                {getSortIcon("assigned_to")}
              </Button>
            </div>

            <div className="col-span-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("created_at")}
                className="h-auto p-0 font-medium text-text-primary dark:text-[var(--text-primary)] hover:text-brand-accent dark:hover:text-brand-accent"
              >
                Created
                {getSortIcon("created_at")}
              </Button>
            </div>

            <div className="col-span-1 text-center text-text-primary dark:text-[var(--text-primary)]">
              Actions
            </div>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="space-y-2 p-4 bg-surface-background dark:bg-[var(--bg-primary)]">
        {tickets.map((ticket) => {
          const isSelected = selectedTickets.includes(ticket.id);
          const needsAttention = ticketNeedsAttention(ticket);

          return (
            <div
              key={ticket.id}
              className={cn(
                "flex items-center space-x-4 p-4 border rounded-lg transition-colors",
                "border-ui-border dark:border-[var(--border-primary)]",
                "bg-surface-background dark:bg-[var(--bg-secondary)]",
                "hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)]",
                needsAttention &&
                  "border-orange-300 dark:border-orange-600 bg-orange-50/50 dark:bg-orange-900/20",
                isSelected &&
                  "bg-brand-accent/10 dark:bg-brand-accent/20 border-brand-accent dark:border-brand-accent",
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onTicketSelect(ticket.id, !!checked)
                }
                aria-label={`Select ticket ${ticket.ticket_number}`}
                className="border-ui-border dark:border-[var(--border-primary)] data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent"
              />

              <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                {/* Ticket Info */}
                <div className="col-span-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      {needsAttention && (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      )}
                    </div>

                    <h4 className="text-sm font-medium line-clamp-1 text-text-primary dark:text-[var(--text-primary)]">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center gap-2">
                      {ticket.category && (
                        <Badge
                          variant="outline"
                          className="text-xs border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-tertiary)] text-text-secondary dark:text-[var(--text-secondary)]"
                          style={{ borderColor: ticket.category.color }}
                        >
                          {ticket.category.name}
                        </Badge>
                      )}
                      {ticket.message_count && ticket.message_count > 0 && (
                        <div className="flex items-center text-xs text-text-secondary dark:text-[var(--text-secondary)]">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {ticket.message_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
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
                      <p className="text-sm font-medium truncate text-text-primary dark:text-[var(--text-primary)]">
                        {ticket.customer?.name ||
                          ticket.customer_name ||
                          "Anonymous"}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] truncate">
                        {ticket.customer_email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="col-span-1">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: getPriorityColor(ticket.priority),
                      color: getPriorityColor(ticket.priority),
                    }}
                    className="text-xs"
                  >
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </div>

                {/* Status */}
                <div className="col-span-1">
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
                </div>

                {/* Assigned */}
                <div className="col-span-2">
                  {ticket.assigned_admin ? (
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3 text-text-secondary dark:text-[var(--text-secondary)]" />
                      <span className="text-sm truncate text-text-primary dark:text-[var(--text-primary)]">
                        {ticket.assigned_admin.name ||
                          ticket.assigned_admin.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-secondary dark:text-[var(--text-secondary)]">
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Created */}
                <div className="col-span-1">
                  <div className="text-xs text-text-secondary dark:text-[var(--text-secondary)]">
                    {formatTimeAgo(ticket.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 text-center">
                  <Link href={`/admin/support/tickets/${ticket.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)]">
          <div className="text-sm text-text-secondary dark:text-[var(--text-secondary)]">
            Showing {pagination.offset + 1} to{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            of {pagination.total} tickets
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(0)}
              disabled={currentPage === 1}
              className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.offset - pagination.limit)}
              disabled={currentPage === 1}
              className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-text-primary dark:text-[var(--text-primary)] px-3">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.offset + pagination.limit)}
              disabled={currentPage === totalPages}
              className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((totalPages - 1) * pagination.limit)}
              disabled={currentPage === totalPages}
              className="border-ui-border dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
