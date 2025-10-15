"use client";

import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  MoreVertical,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportTicket, SupportTicketCategory } from "@/lib/supportService";
import { TicketsTable } from "./tickets-table";
import { TicketFilters } from "./ticket-filters";
import { BulkActions } from "./bulk-actions";
import Link from "next/link";

interface TicketsListClientProps {
  initialTickets?: SupportTicket[];
  initialCategories?: SupportTicketCategory[];
}

export function TicketsListClient({
  initialTickets,
  initialCategories,
}: TicketsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category_id: "all",
    assigned_to: "all",
    customer_email: "",
  });
  const [sorting, setSorting] = useState({
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  });

  const queryClient = useQueryClient();

  // Fetch tickets with filters using tRPC
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
  } = api.support.getAllTickets.useQuery(
    {
      page: Math.floor(pagination.offset / pagination.limit) + 1,
      limit: pagination.limit,
      search: searchQuery || undefined,
      status: filters.status !== "all" ? (filters.status as any) : undefined,
      priority:
        filters.priority !== "all" ? (filters.priority as any) : undefined,
      assignedTo:
        filters.assigned_to !== "all" ? filters.assigned_to : undefined,
    },
    {
      initialData: initialTickets
        ? {
            tickets: initialTickets,
            total: initialTickets.length,
            page: 1,
            limit: pagination.limit,
            totalPages: Math.ceil(initialTickets.length / pagination.limit),
          }
        : undefined,
    },
  );

  // Fetch categories using tRPC
  const { data: categoriesData } = api.support.getCategories.useQuery();
  const categories = categoriesData?.categories || [];

  // Fetch admin users for assignment using tRPC
  const { data: adminUsers } = api.admin.getTeam.useQuery();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleSortChange = (sort_by: string) => {
    setSorting((prev) => ({
      sort_by,
      sort_order:
        prev.sort_by === sort_by && prev.sort_order === "desc" ? "asc" : "desc",
    }));
  };

  const handlePageChange = (newOffset: number) => {
    setPagination((prev) => ({ ...prev, offset: newOffset }));
  };

  const handleTicketSelect = (ticketId: string, selected: boolean) => {
    setSelectedTickets((prev) =>
      selected ? [...prev, ticketId] : prev.filter((id) => id !== ticketId),
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedTickets(
      selected ? ticketsData?.tickets.map((t: any) => t.id) || [] : [],
    );
  };

  // tRPC mutation for bulk operations
  const bulkUpdateMutation = api.support.bulkUpdateTickets.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedTickets([]);
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
    },
    onError: (error) => {
      console.error("Bulk action failed:", error);
    },
  });

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedTickets.length === 0) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        ticketIds: selectedTickets,
        action: action as any,
        value:
          data?.value ||
          data?.assigned_to ||
          data?.status ||
          data?.priority ||
          data?.category_id ||
          "",
      });
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  // tRPC mutation for export
  const exportMutation = api.support.exportTickets.useMutation({
    onError: (error) => {
      console.error("Export failed:", error);
    },
  });

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        format: "csv",
        search: searchQuery || undefined,
        status: filters.status !== "all" ? (filters.status as any) : undefined,
        priority:
          filters.priority !== "all" ? (filters.priority as any) : undefined,
        category_id:
          filters.category_id !== "all" ? filters.category_id : undefined,
        assigned_to:
          filters.assigned_to !== "all" ? filters.assigned_to : undefined,
        customer_email: filters.customer_email || undefined,
      });

      if (result.format === "csv") {
        // Create and download CSV file
        const blob = new Blob([result.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="w-full space-y-6 bg-surface-background dark:bg-[#1C1C1F] min-h-screen">
      {/* Header with Vectura Labs Theme */}
      <div className="flex items-center justify-between p-6 bg-surface-background dark:bg-[#1C1C1F] border border-ui-border dark:border-neutral-800 rounded-none mx-6">
        <div>
          <h1 className="text-3xl font-headings font-bold text-text-primary dark:text-white">
            Support Tickets
          </h1>
          <p className="text-text-secondary dark:text-neutral-400 font-ui">
            Manage and track customer support tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-ui-border dark:border-neutral-700 hover:bg-ui-border-light dark:hover:bg-neutral-800 text-text-primary dark:text-white rounded-none font-ui"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-ui-border dark:border-neutral-700 hover:bg-ui-border-light dark:hover:bg-neutral-800 text-text-primary dark:text-white rounded-none font-ui"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/support/tickets/new">
            <Button
              size="sm"
              className="bg-text-primary text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none font-ui font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search with Vectura Labs Theme */}
      <Card className="border-ui-border dark:border-neutral-800 rounded-none bg-surface-background dark:bg-[#1C1C1F] shadow-none mx-6">
        <CardHeader className="pb-4 border-b border-ui-border dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-headings font-bold text-text-primary dark:text-white">
              Filters
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-ui-border-light dark:bg-neutral-800 text-text-primary dark:text-white rounded-none font-ui"
            >
              {ticketsData?.total || 0} tickets
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary dark:text-neutral-400" />
              <Input
                placeholder="Search tickets by subject, number, or customer..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-ui-border dark:border-neutral-700 bg-surface-background dark:bg-[#1C1C1F] text-text-primary dark:text-white rounded-none font-ui"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <TicketFilters
            filters={filters}
            categories={categories || []}
            adminUsers={adminUsers || []}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="mx-6">
          <BulkActions
            selectedCount={selectedTickets.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedTickets([])}
            categories={categories || []}
            adminUsers={adminUsers || []}
          />
        </div>
      )}

      {/* Tickets Table with Vectura Labs Theme */}
      <Card className="border-ui-border dark:border-neutral-800 rounded-none bg-surface-background dark:bg-[#1C1C1F] shadow-none mx-6">
        <CardContent className="p-0">
          <TicketsTable
            tickets={ticketsData?.tickets || []}
            isLoading={isLoading}
            selectedTickets={selectedTickets}
            onTicketSelect={handleTicketSelect}
            onSelectAll={handleSelectAll}
            onSort={handleSortChange}
            sorting={sorting}
            pagination={{
              ...pagination,
              total: ticketsData?.total || 0,
            }}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
