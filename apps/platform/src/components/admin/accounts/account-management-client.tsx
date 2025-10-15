"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AllAccountsTable } from "./all-accounts-table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter } from "lucide-react";
import { UserAccount } from "@/lib/types";
import { api } from "@/lib/trpc-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function AccountManagementClient() {
  const queryClient = useQueryClient();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [spamFlagFilter, setSpamFlagFilter] = useState(false);

  // Build query parameters - only include defined values
  const queryParams: any = {
    page: 1,
    limit: 100,
  };

  if (statusFilter !== "all") {
    queryParams.status = statusFilter as "active" | "suspended";
  }

  if (roleFilter !== "all") {
    queryParams.role = roleFilter as "user" | "admin";
  }

  if (spamFlagFilter) {
    queryParams.isFlagged = true;
  }

  // tRPC query for users
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = api.admin.getUsers.useQuery(queryParams);

  // Convert to UserAccount format
  const accounts: UserAccount[] = (usersData?.users || []).map(
    (user: any): UserAccount => ({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture || null,
      provider: user.provider || "email",
      email_verified: true, // All users shown are considered verified since we removed the redundant column
      newsletter_subscribed: user.newsletter_subscribed || false,
      created_at: user.created_at,
      updated_at: user.updated_at,
      suspended: user.suspended || false,
      suspended_at: user.suspended_at,
      suspended_by: user.suspended_by,
      suspension_reason: user.suspension_reason,
      suspension_expires_at: user.suspension_expires_at,
      spam_score: user.spam_score || 0,
      is_spam_flagged: user.is_spam_flagged || false,
      spam_flagged_at: user.spam_flagged_at,
      spam_flagged_by: user.spam_flagged_by,
      total_spent: user.total_spent || 0,
      role: user.role,
    }),
  );

  const handleRefresh = () => {
    refetch();
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setRoleFilter("all");
    setSpamFlagFilter(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Accounts</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500 dark:text-slate-400 mr-2">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} total
            {accounts.filter((a) => a.newsletter_subscribed).length > 0 &&
              `, ${accounts.filter((a) => a.newsletter_subscribed).length} subscribed`}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error instanceof Error ? error.message : "Failed to load accounts"}
        </div>
      )}

      {/* Filter Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">
                Status:
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "active" | "suspended") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="role-filter" className="text-sm">
                Role:
              </Label>
              <Select
                value={roleFilter}
                onValueChange={(value: "all" | "user" | "admin") =>
                  setRoleFilter(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="spam-filter"
                checked={spamFlagFilter}
                onCheckedChange={setSpamFlagFilter}
              />
              <Label htmlFor="spam-filter" className="text-sm">
                Show only spam flagged
              </Label>
            </div>

            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <AllAccountsTable
        accounts={accounts}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
