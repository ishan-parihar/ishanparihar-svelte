"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronUp,
  ChevronDown,
  Package,
  ExternalLink,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/trpc-client";
import Link from "next/link";

interface ServicePerformanceTableProps {
  period: "7d" | "30d" | "90d" | "1y";
}

type SortField =
  | "service_title"
  | "category_name"
  | "total_orders"
  | "total_revenue"
  | "avg_order_value";
type SortDirection = "asc" | "desc";

export function ServicePerformanceTable({
  period,
}: ServicePerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("total_revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const {
    data: performanceData,
    isLoading,
    error,
  } = api.payments.getServiceSalesPerformance.useQuery({
    period,
    limit: 100, // Fetch more data for client-side pagination and sorting
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 90 days";
      case "1y":
        return "Last year";
      default:
        return "Last 30 days";
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedData = useMemo(() => {
    if (!performanceData?.services) return [];

    const sorted = [...performanceData.services].sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string sorting for title and category
      if (sortField === "service_title" || sortField === "category_name") {
        aValue = (aValue || "").toLowerCase();
        bValue = (bValue || "").toLowerCase();
      } else {
        // Handle numeric sorting
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sorted;
  }, [performanceData?.services, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-foreground" />
    ) : (
      <ChevronDown className="h-4 w-4 text-foreground" />
    );
  };

  if (error) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Failed to load service data
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Service Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {getPeriodLabel(period)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-muted-foreground">
              {sortedData.length} services
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              No service data available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              No service performance data found for the selected period
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("service_title")}
                    >
                      <div className="flex items-center gap-2">
                        Service
                        <SortIcon field="service_title" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("category_name")}
                    >
                      <div className="flex items-center gap-2">
                        Category
                        <SortIcon field="category_name" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                      onClick={() => handleSort("total_orders")}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Orders
                        <SortIcon field="total_orders" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                      onClick={() => handleSort("total_revenue")}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Revenue
                        <SortIcon field="total_revenue" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                      onClick={() => handleSort("avg_order_value")}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Avg Order Value
                        <SortIcon field="avg_order_value" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((service: any, index: number) => (
                    <TableRow
                      key={service.service_id || index}
                      className="border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          {service.service_slug ? (
                            <Link
                              href={`/admin/services/edit/${service.service_slug}`}
                              className="hover:underline font-medium text-foreground"
                            >
                              {service.service_title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground italic font-medium">
                              {service.service_title}{" "}
                              {/* This will now display '[Deleted Service]' */}
                            </span>
                          )}
                          {service.service_id && (
                            <span className="text-xs text-muted-foreground">
                              ID: {service.service_id}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.category_name ? (
                          <Badge variant="secondary" className="text-xs">
                            {service.category_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(service.total_orders || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(service.total_revenue || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(service.avg_order_value || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {service.service_slug ? (
                          <Link
                            href={`/admin/services/edit/${service.service_slug}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Service"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
                  {sortedData.length} services
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant={
                            currentPage === totalPages ? "default" : "outline"
                          }
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
