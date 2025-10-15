"use client";

import { UserAccount } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ExternalLink,
  Flag,
  UserX,
  UserCheck,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToggleUserNewsletterMutation } from "@/queries/adminQueries";
import Link from "next/link";
import { SuspendAccountDialog, SpamFlagDialog } from "./account-action-modals";
import { api } from "@/lib/trpc-client";

interface AllAccountsTableProps {
  accounts: UserAccount[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AllAccountsTable({
  accounts,
  isLoading,
  onRefresh,
}: AllAccountsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal state
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [spamDialogOpen, setSpamDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // tRPC utils for invalidating queries
  const utils = api.useUtils();

  // Mutation hooks for user management actions
  const toggleNewsletterMutation = useToggleUserNewsletterMutation();

  // Modal handlers
  const handleSuspendClick = (user: UserAccount) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleSpamFlagClick = (user: UserAccount) => {
    setSelectedUser(user);
    setSpamDialogOpen(true);
  };

  const handleModalSuccess = () => {
    utils.admin.getUsers.invalidate();
    onRefresh();
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount || amount === 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSubscriptionToggle = async (account: UserAccount) => {
    setUpdatingId(account.id);

    // Show loading toast
    const toastId = toast.loading(
      `${!account.newsletter_subscribed ? "Subscribing" : "Unsubscribing"} ${account.email}...`,
    );

    try {
      await toggleNewsletterMutation.mutateAsync({
        userId: account.id,
        subscribed: !account.newsletter_subscribed,
      });

      // Show success toast
      toast.success(
        `${!account.newsletter_subscribed ? "Subscribed" : "Unsubscribed"} ${account.email} successfully`,
        { id: toastId },
      );

      // Refresh the accounts list (cache invalidation is handled by the mutation hook)
      onRefresh();
    } catch (error) {
      console.error("Error updating subscription status:", error);

      // Show error toast
      toast.error(
        `Failed to ${!account.newsletter_subscribed ? "subscribe" : "unsubscribe"} ${account.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: toastId },
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">No accounts found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Newsletter</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {account.email}
                      {account.is_spam_flagged && (
                        <span title="Spam Flagged">
                          <Flag className="h-4 w-4 text-red-500" />
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.name || "No name"}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {account.provider === "google"
                        ? "Google"
                        : account.provider || "Email"}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={account.suspended ? "destructive" : "success"}>
                  {account.suspended ? "Suspended" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={account.role === "admin" ? "default" : "secondary"}
                >
                  {account.role === "admin" ? "Admin" : "User"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(account.total_spent)}
              </TableCell>
              <TableCell>{formatDate(account.created_at)}</TableCell>
              <TableCell>
                {account.newsletter_subscribed ? (
                  <Badge variant="active">Subscribed</Badge>
                ) : (
                  <Badge variant="inactive">Not Subscribed</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-1">
                    <div className="flex flex-col">
                      <Link href={`/admin/accounts/${account.id}`}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm font-normal"
                        >
                          <ExternalLink className="mr-2 h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                          View Full Profile
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-normal"
                        onClick={() => handleSuspendClick(account)}
                      >
                        {account.suspended ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                            Unsuspend User
                          </>
                        ) : (
                          <>
                            <UserX className="mr-2 h-4 w-4 text-red-600" />
                            Suspend User
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-normal"
                        onClick={() => handleSpamFlagClick(account)}
                      >
                        <Flag className="mr-2 h-4 w-4 text-orange-600" />
                        {account.is_spam_flagged
                          ? "Remove Spam Flag"
                          : "Flag as Spam"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-normal"
                        onClick={() => handleSubscriptionToggle(account)}
                      >
                        {account.newsletter_subscribed
                          ? "Unsubscribe from Newsletter"
                          : "Subscribe to Newsletter"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modals */}
      {selectedUser && (
        <>
          <SuspendAccountDialog
            user={selectedUser}
            open={suspendDialogOpen}
            onOpenChange={setSuspendDialogOpen}
            onSuccess={handleModalSuccess}
          />
          <SpamFlagDialog
            user={selectedUser}
            open={spamDialogOpen}
            onOpenChange={setSpamDialogOpen}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  );
}
