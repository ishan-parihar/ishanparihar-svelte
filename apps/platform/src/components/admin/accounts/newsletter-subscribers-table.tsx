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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Check, X } from "lucide-react";
import { api } from "@/lib/trpc-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NewsletterSubscribersTableProps {
  accounts: UserAccount[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function NewsletterSubscribersTable({
  accounts,
  isLoading,
  onRefresh,
}: NewsletterSubscribersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // tRPC mutation for updating newsletter status
  const updateNewsletterMutation =
    api.admin.updateUserNewsletterStatus.useMutation();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleSubscriptionToggle = async (account: UserAccount) => {
    setUpdatingId(account.id);

    // Show loading toast
    const toastId = toast.loading(
      `${!account.newsletter_subscribed ? "Subscribing" : "Unsubscribing"} ${account.email}...`,
    );

    try {
      // Use tRPC mutation to update newsletter status
      await updateNewsletterMutation.mutateAsync({
        userId: account.id,
        subscribed: !account.newsletter_subscribed,
      });

      // Show success toast
      toast.success(
        `${!account.newsletter_subscribed ? "Subscribed" : "Unsubscribed"} ${account.email} successfully`,
        { id: toastId },
      );

      // Refresh the accounts list
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

  const handleVerificationToggle = async (account: UserAccount) => {
    setVerifyingId(account.id);

    // Show loading toast
    const toastId = toast.loading(
      `${!account.email_verified ? "Verifying" : "Unverifying"} ${account.email}...`,
    );

    try {
      const response = await fetch(
        `/api/admin/accounts/${account.id}/verification-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verified: !account.email_verified,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to update verification status",
        );
      }

      // Show success toast
      toast.success(
        `${!account.email_verified ? "Verified" : "Unverified"} ${account.email} successfully`,
        { id: toastId },
      );

      // Refresh the accounts list
      onRefresh();
    } catch (error) {
      console.error("Error updating verification status:", error);

      // Show error toast
      toast.error(
        `Failed to ${!account.email_verified ? "verify" : "unverify"} ${account.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: toastId },
      );
    } finally {
      setVerifyingId(null);
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

  // Filter accounts to only show those subscribed to the newsletter
  const newsletterAccounts = accounts.filter(
    (account) => account.newsletter_subscribed === true,
  );

  if (newsletterAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">
          No newsletter subscribers found.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
          {accounts.length > 0
            ? `There are ${accounts.length} accounts in the system, but none are subscribed to the newsletter.`
            : "No accounts found in the system."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Subscribed Since</TableHead>
            <TableHead>Unsubscribe Type</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newsletterAccounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.email}</TableCell>
              <TableCell>{account.name || "-"}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {account.provider === "google"
                    ? "Google"
                    : account.provider || "Email"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {account.email_verified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="inactive">Unverified</Badge>
                  )}
                  <Switch
                    checked={account.email_verified}
                    disabled={verifyingId === account.id}
                    onCheckedChange={() => handleVerificationToggle(account)}
                    className="ml-2"
                  />
                </div>
              </TableCell>
              <TableCell>
                {formatDate(account.subscribed_at || account.created_at)}
              </TableCell>
              <TableCell>
                {!account.newsletter_subscribed &&
                  account.manually_unsubscribed && (
                    <Badge variant="warning">Manual</Badge>
                  )}
                {!account.newsletter_subscribed &&
                  !account.manually_unsubscribed && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-4">
                  <Switch
                    checked={account.newsletter_subscribed}
                    disabled={updatingId === account.id}
                    onCheckedChange={() => handleSubscriptionToggle(account)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleVerificationToggle(account)}
                      >
                        {account.email_verified ? (
                          <>
                            <X className="mr-2 h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                            <span>Mark as Unverified</span>
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                            <span>Mark as Verified</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSubscriptionToggle(account)}
                      >
                        {account.newsletter_subscribed ? (
                          <span>Unsubscribe from Newsletter</span>
                        ) : (
                          <span>Subscribe to Newsletter</span>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
