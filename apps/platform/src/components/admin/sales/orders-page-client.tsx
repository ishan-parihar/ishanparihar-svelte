"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
} from "lucide-react";
import { OrderFilters } from "./order-filters";
import { OrdersTable } from "./orders-table";
import { api } from "@/lib/trpc-client";

interface DateRange {
  from: string;
  to: string;
}

interface OrderFiltersState {
  status: string;
  search: string;
  dateRange?: DateRange;
  serviceId: string;
  categoryId: string;
  serviceType: string;
}

export function OrdersPageClient() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: "all",
    search: "",
    serviceId: "all",
    categoryId: "all",
    serviceType: "all",
  });

  // Handle URL parameters on component mount
  useEffect(() => {
    const customerEmail = searchParams.get("customerEmail");
    if (customerEmail) {
      setFilters((prev) => ({
        ...prev,
        search: customerEmail,
      }));
    }
  }, [searchParams]);

  // Build query parameters for tRPC
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: 20,
    };

    // Add filters only if they're not "all" or empty
    if (filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.search.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.dateRange) {
      params.dateRange = filters.dateRange;
    }

    if (filters.serviceId !== "all") {
      params.serviceId = filters.serviceId;
    }

    if (filters.categoryId !== "all") {
      params.categoryId = filters.categoryId;
    }

    if (filters.serviceType !== "all") {
      params.serviceType = filters.serviceType;
    }

    return params;
  }, [currentPage, filters]);

  // Fetch orders data
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = api.payments.getAllOrdersAdmin.useQuery(queryParams, {
    staleTime: 30000, // 30 seconds
  });

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<OrderFiltersState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setCurrentPage(1); // Reset to first page when filters change
    },
    [],
  );

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (ordersData && currentPage < ordersData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate pagination info
  const totalOrders = ordersData?.total || 0;
  const totalPages = ordersData?.totalPages || 0;
  const startItem = totalOrders > 0 ? (currentPage - 1) * 20 + 1 : 0;
  const endItem = Math.min(currentPage * 20, totalOrders);

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
            Orders Management
          </h1>
          <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
            Manage customer orders, track payments, and handle billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-ui-border dark:border-[var(--border-primary)]"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Orders Table Section */}
      <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {totalOrders > 0
                    ? `Showing ${startItem}-${endItem} of ${totalOrders} orders`
                    : "No orders found"}
                </CardDescription>
              </div>
              {totalOrders > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalOrders}
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
                Error loading orders
              </h3>
              <p className="text-muted-foreground mb-4">
                {error.message || "Failed to load orders. Please try again."}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <OrdersTable
              orders={ordersData?.orders || []}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination Section */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}
