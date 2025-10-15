"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  MessageSquare,
  Ticket,
  Clock,
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
  ChatSession,
} from "@/lib/supportService";
import { SearchResults } from "./search-results";
import { DateRangePicker } from "./date-range-picker";

interface SearchFilters {
  query: string;
  type: "all" | "tickets" | "messages" | "customers" | "chats";
  status?: string;
  priority?: string;
  category_id?: string;
  assigned_to?: string;
  date_range?: {
    from: Date;
    to: Date;
  };
  customer_email?: string;
}

interface SearchData {
  tickets: any[];
  chats: any[];
  messages: any[];
  customers: any[];
  total: number;
}

export function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "all",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);

  // Fetch categories for filters using tRPC
  const { data: categoriesData } = api.support.getCategories.useQuery();
  const categories = categoriesData?.categories || [];

  // Fetch admin users for filters using tRPC
  const { data: adminUsers } = api.admin.getTeam.useQuery();

  // Use tRPC query for search with manual trigger
  const [searchParams, setSearchParams] = useState<any>(null);

  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = api.support.search.useQuery(searchParams, {
    enabled: !!searchParams,
  });

  // Handle search results
  useEffect(() => {
    if (searchData) {
      // Transform the data to match SearchResults component expectations
      const transformedResults = {
        tickets: searchData.tickets || [],
        chats: searchData.chats || [],
        messages: [], // Not returned by our tRPC endpoint
        customers: [], // Not returned by our tRPC endpoint
        total: searchData.total || 0,
      };
      setSearchResults(transformedResults);
      setIsSearching(false);
    }
  }, [searchData]);

  // Handle search errors
  useEffect(() => {
    if (searchError) {
      console.error("Search failed:", searchError);
      setIsSearching(false);
    }
  }, [searchError]);

  const handleSearch = async () => {
    if (!filters.query.trim()) return;

    setIsSearching(true);

    setSearchParams({
      query: filters.query,
      type: filters.type as "all" | "tickets" | "chats",
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.category_id && { category_id: filters.category_id }),
      ...(filters.assigned_to && { assigned_to: filters.assigned_to }),
      ...(filters.customer_email && { customer_email: filters.customer_email }),
      ...(filters.date_range && {
        date_range: {
          from: filters.date_range.from.toISOString(),
          to: filters.date_range.to.toISOString(),
        },
      }),
    });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      type: "all",
    });
    setSearchResults(null);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "query" || key === "type") return false;
    return value !== undefined && value !== "" && value !== "all";
  }).length;

  return (
    <div className="w-full space-y-6 bg-surface-background dark:bg-[var(--bg-primary)] min-h-screen">
      {/* Header - Vectura Labs Theme */}
      <div className="px-6 py-6 border-b border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)]">
        <h1 className="text-3xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
          Advanced Search
        </h1>
        <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
          Search across tickets, messages, customers, and chat sessions
        </p>
      </div>

      {/* Search Form - Vectura Labs Theme */}
      <Card className="mx-6 border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader className="border-b border-ui-border dark:border-[var(--border-primary)]">
          <CardTitle className="text-lg font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
            Search Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Main Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary dark:text-[var(--text-secondary)]" />
              <Input
                placeholder="Search for tickets, messages, customers..."
                value={filters.query}
                onChange={(e) => handleFilterChange("query", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui"
              />
            </div>

            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-40 border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] rounded-none">
                <SelectItem
                  value="all"
                  className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
                >
                  All Types
                </SelectItem>
                <SelectItem
                  value="tickets"
                  className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
                >
                  Tickets
                </SelectItem>
                <SelectItem
                  value="messages"
                  className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
                >
                  Messages
                </SelectItem>
                <SelectItem
                  value="customers"
                  className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
                >
                  Customers
                </SelectItem>
                <SelectItem
                  value="chats"
                  className="font-ui text-text-primary dark:text-[var(--text-primary)] hover:bg-ui-border-light dark:hover:bg-[var(--bg-hover)]"
                >
                  Chat Sessions
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSearch}
              disabled={!filters.query.trim() || isSearching}
              className="bg-brand-accent text-white hover:bg-[var(--brand-accent-hover)] dark:bg-brand-accent dark:text-white dark:hover:bg-[var(--brand-accent-hover)] rounded-none font-ui font-medium disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Advanced Filters */}
          <Tabs defaultValue="filters" className="w-full">
            <TabsList>
              <TabsTrigger value="filters">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="date">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "status",
                        value === "all" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
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
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={filters.priority || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "priority",
                        value === "all" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={filters.category_id || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "category_id",
                        value === "all" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignment Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned To</label>
                  <Select
                    value={filters.assigned_to || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "assigned_to",
                        value === "all" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Assignments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignments</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {adminUsers?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer Email Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Email</label>
                <Input
                  placeholder="Filter by customer email..."
                  value={filters.customer_email || ""}
                  onChange={(e) =>
                    handleFilterChange("customer_email", e.target.value)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="date" className="space-y-4">
              <DateRangePicker
                value={filters.date_range}
                onChange={(range) => handleFilterChange("date_range", range)}
              />
            </TabsContent>
          </Tabs>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
              <span className="text-sm font-medium">Active filters:</span>

              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange("status", undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.priority && (
                <Badge variant="secondary" className="gap-1">
                  Priority: {filters.priority}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange("priority", undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.category_id && (
                <Badge variant="secondary" className="gap-1">
                  Category:{" "}
                  {categories?.find((c: any) => c.id === filters.category_id)
                    ?.name || "Unknown"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange("category_id", undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="mx-6">
          <SearchResults
            results={searchResults}
            searchQuery={filters.query}
            searchType={filters.type}
          />
        </div>
      )}
    </div>
  );
}
