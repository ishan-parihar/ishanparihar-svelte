"use client";

import { NewsletterSubscriber } from "@/lib/newsletterService";
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

interface SubscribersTableProps {
  subscribers: NewsletterSubscriber[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function SubscribersTable({
  subscribers,
  isLoading,
  onRefresh,
}: SubscribersTableProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
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

  if (subscribers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">
          No subscribers found.
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
            <TableHead>Account Status</TableHead>
            <TableHead>Newsletter Status</TableHead>
            <TableHead>Subscribed</TableHead>
            <TableHead>Unsubscribed</TableHead>
            <TableHead>Unsubscribe Type</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">{subscriber.email}</TableCell>
              <TableCell>
                {subscriber.name || subscriber.user_name || "-"}
              </TableCell>
              <TableCell>
                {subscriber.has_user_account ? (
                  <Badge variant="default">Has Account</Badge>
                ) : (
                  <Badge variant="secondary">Newsletter Only</Badge>
                )}
              </TableCell>
              <TableCell>
                {subscriber.newsletter_subscribed ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  >
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
              <TableCell>{formatDate(subscriber.unsubscribed_at)}</TableCell>
              <TableCell>
                {!subscriber.newsletter_subscribed &&
                  (subscriber.manually_unsubscribed ? (
                    <Badge
                      variant="outline"
                      className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300"
                    >
                      Manual
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
                    >
                      Admin
                    </Badge>
                  ))}
              </TableCell>
              <TableCell>{formatDate(subscriber.updated_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
