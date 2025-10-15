"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
} from "lucide-react";
import { CustomersTable } from "./customers-table";
import { api } from "@/lib/trpc-client";

export function CustomersPageClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const itemsPerPage = 25;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Prepare query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch.trim() || undefined,
    }),
    [currentPage, debouncedSearch],
  );

  // Fetch customers data
  const {
    data: customersData,
    isLoading,
    error,
    refetch,
  } = api.payments.getCustomerPurchaseSummaries.useQuery(queryParams, {
    staleTime: 30000, // 30 seconds
  });

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (customersData && currentPage < customersData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate pagination info
  const totalCustomers = customersData?.total || 0;
  const totalPages = customersData?.totalPages || 0;
  const startItem =
    totalCustomers > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalCustomers);

  return (
    <div className="w-full space-y-6 bg-surface-background dark:bg-[var(--bg-primary)]">
      {/* Search Section */}
      <div className="px-6">
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Customers
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Search by customer name or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table Section */}
      <div className="px-6">
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customers
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {totalCustomers > 0
                      ? `Showing ${startItem}-${endItem} of ${totalCustomers} customers`
                      : "No customers found"}
                  </CardDescription>
                </div>
                {totalCustomers > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalCustomers}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Error loading customers
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error.message ||
                    "Failed to load customer data. Please try again."}
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <CustomersTable
                customers={customersData?.customers || []}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {/* Show page numbers around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
