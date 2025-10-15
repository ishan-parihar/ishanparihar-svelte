"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search, Calendar } from "lucide-react";
import { api } from "@/lib/trpc-client";

interface DateRange {
  from: string;
  to: string;
}

interface OrderFiltersProps {
  filters: {
    status: string;
    search: string;
    dateRange?: DateRange;
    serviceId: string;
    categoryId: string;
    serviceType: string;
  };
  onFilterChange: (filters: Partial<OrderFiltersProps["filters"]>) => void;
}

export function OrderFilters({ filters, onFilterChange }: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [fromDate, setFromDate] = useState(filters.dateRange?.from || "");
  const [toDate, setToDate] = useState(filters.dateRange?.to || "");

  // Fetch services and categories for dropdowns
  const { data: servicesData } = api.services.getServices.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: categories } = api.services.getServiceCategories.useQuery();

  // Update searchInput when filters.search changes (e.g., from URL parameters)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  // Handle date range changes
  useEffect(() => {
    if (fromDate && toDate) {
      onFilterChange({
        dateRange: {
          from: new Date(fromDate).toISOString(),
          to: new Date(toDate).toISOString(),
        },
      });
    } else if (!fromDate && !toDate) {
      onFilterChange({ dateRange: undefined });
    }
  }, [fromDate, toDate, onFilterChange]);

  // Quick date presets
  const setPresetRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    setFromDate(fromStr);
    setToDate(toStr);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput("");
    setFromDate("");
    setToDate("");
    onFilterChange({
      status: "all",
      search: "",
      dateRange: undefined,
      serviceId: "all",
      categoryId: "all",
      serviceType: "all",
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.status !== "all",
    filters.search !== "",
    filters.dateRange !== undefined,
    filters.serviceId !== "all",
    filters.categoryId !== "all",
    filters.serviceType !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 p-4 bg-card dark:bg-card border border-border rounded-none">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2 space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer email, or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Service</label>
          <Select
            value={filters.serviceId}
            onValueChange={(value) => onFilterChange({ serviceId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {servicesData?.services?.map((service: any) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={filters.categoryId}
            onValueChange={(value) => onFilterChange({ categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={filters.serviceType}
            onValueChange={(value) => onFilterChange({ serviceType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <label className="text-sm font-medium">Date Range</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">From Date</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || undefined}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">To Date</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || undefined}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs text-muted-foreground">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange(7)}
                className="text-xs"
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange(30)}
                className="text-xs"
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange(90)}
                className="text-xs"
              >
                Last 3 months
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters and Clear Button */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {activeFiltersCount > 0
              ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} active`
              : "No filters active"}
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
