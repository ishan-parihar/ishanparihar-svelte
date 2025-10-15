"use client";

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
import { X, Filter } from "lucide-react";
import { SupportTicketCategory } from "@/lib/supportService";

interface TicketFiltersProps {
  filters: {
    status: string;
    priority: string;
    category_id: string;
    assigned_to: string;
    customer_email: string;
  };
  categories: SupportTicketCategory[];
  adminUsers: any[];
  onFilterChange: (filters: Partial<TicketFiltersProps["filters"]>) => void;
}

export function TicketFilters({
  filters,
  categories,
  adminUsers,
  onFilterChange,
}: TicketFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "all" && value !== "",
  ).length;

  const clearAllFilters = () => {
    onFilterChange({
      status: "all",
      priority: "all",
      category_id: "all",
      assigned_to: "all",
      customer_email: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting">Waiting for Customer</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={filters.priority}
            onValueChange={(value) => onFilterChange({ priority: value })}
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
            value={filters.category_id}
            onValueChange={(value) => onFilterChange({ category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
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
            value={filters.assigned_to}
            onValueChange={(value) => onFilterChange({ assigned_to: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {adminUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Customer Email Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer Email</label>
          <Input
            placeholder="Filter by customer email..."
            value={filters.customer_email}
            onChange={(e) => onFilterChange({ customer_email: e.target.value })}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Active filters:</span>
          </div>

          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => onFilterChange({ status: "all" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.priority !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => onFilterChange({ priority: "all" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.category_id !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Category:{" "}
              {categories.find((c) => c.id === filters.category_id)?.name ||
                "Unknown"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => onFilterChange({ category_id: "all" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.assigned_to !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Assigned:{" "}
              {filters.assigned_to === "unassigned"
                ? "Unassigned"
                : adminUsers.find((u) => u.id === filters.assigned_to)?.name ||
                  "Unknown"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => onFilterChange({ assigned_to: "all" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.customer_email && (
            <Badge variant="secondary" className="gap-1">
              Customer: {filters.customer_email}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => onFilterChange({ customer_email: "" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Quick filters:</span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange({ status: "open", priority: "all" })}
          className="text-xs"
        >
          Open Tickets
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange({ priority: "urgent", status: "all" })}
          className="text-xs"
        >
          Urgent Priority
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFilterChange({ assigned_to: "unassigned", status: "all" })
          }
          className="text-xs"
        >
          Unassigned
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFilterChange({
              status: "open",
              assigned_to: "unassigned",
              priority: "all",
            })
          }
          className="text-xs"
        >
          Needs Assignment
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange({ status: "waiting", priority: "all" })}
          className="text-xs"
        >
          Waiting for Customer
        </Button>
      </div>
    </div>
  );
}
