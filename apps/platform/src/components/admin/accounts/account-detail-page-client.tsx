"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Settings, Mail, UserCog } from "lucide-react";
import { UserProfileCard } from "./user-profile-card";
import { PurchaseSummaryCards } from "./purchase-summary-cards";
import { UserOrdersTable } from "./user-orders-table";
import {
  EditProfileModal,
  ResetPasswordDialog,
  SuspendAccountDialog,
  SpamFlagDialog,
} from "./account-action-modals";
import { api } from "@/lib/trpc-client";

interface AccountData {
  user: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    custom_picture?: string;
    role: string;
    email_verified: boolean;
    has_active_membership: boolean;
    newsletter_subscribed: boolean;
    manually_unsubscribed: boolean;
    provider?: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    login_count?: number;
    suspended?: boolean;
    suspended_at?: string;
    suspended_by?: string;
    suspension_reason?: string;
    suspension_expires_at?: string;
    spam_score?: number;
    is_spam_flagged?: boolean;
    spam_flagged_at?: string;
    spam_flagged_by?: string;
  };
  summary: {
    customer_email: string;
    customer_name?: string;
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
    last_order_date?: string;
    unique_services_purchased: number;
    preferred_service_type?: string;
    preferred_category?: string;
  };
  recentOrders: Array<{
    id: string;
    order_number?: string;
    customer_name?: string;
    customer_email: string;
    total_amount: number;
    currency: string;
    status: string;
    created_at: string;
    paid_at?: string;
    completed_at?: string;
    service?: {
      id: string;
      title: string;
      slug: string;
      service_type: string;
      category?: {
        name: string;
      };
    };
    pricing_tier?: {
      name: string;
      price: number;
    };
  }>;
}

interface AccountDetailPageClientProps {
  accountData: AccountData;
}

export function AccountDetailPageClient({
  accountData,
}: AccountDetailPageClientProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [suspendAccountOpen, setSuspendAccountOpen] = useState(false);
  const [spamFlagOpen, setSpamFlagOpen] = useState(false);

  // Query client for invalidating queries
  const utils = api.useUtils();

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Refresh the page to get latest data
    window.location.reload();
  };

  const handleProfileUpdateSuccess = () => {
    // Invalidate the account details query to refresh the data
    utils.admin.getUser.invalidate({ userId: accountData.user.id });
  };

  const handleSuspensionSuccess = () => {
    // Invalidate the account details query to refresh the data
    utils.admin.getUser.invalidate({ userId: accountData.user.id });
  };

  const handleSpamFlagSuccess = () => {
    // Invalidate the account details query to refresh the data
    utils.admin.getUser.invalidate({ userId: accountData.user.id });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/accounts">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Accounts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {accountData.user.name || "Account Details"}
            </h1>
            <p className="text-muted-foreground">
              Comprehensive view of user account and activity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            Contact User
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <UserCog className="h-4 w-4" />
            Manage Account
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserProfileCard user={accountData.user} />
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative actions for this user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                asChild
              >
                <a
                  href={`mailto:${accountData.user.email}?subject=Account Support`}
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setEditProfileOpen(true)}
              >
                <UserCog className="h-4 w-4" />
                Edit Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={!accountData.user.email_verified}
                onClick={() => setResetPasswordOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Reset Password
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setSpamFlagOpen(true)}
              >
                <Settings className="h-4 w-4" />
                {accountData.user.is_spam_flagged
                  ? "Remove Spam Flag"
                  : "Flag as Spam"}
              </Button>

              <div className="pt-2 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setSuspendAccountOpen(true)}
                >
                  <UserCog className="h-4 w-4" />
                  {accountData.user.suspended
                    ? "Unsuspend Account"
                    : "Suspend Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Summary */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Purchase Summary</h2>
          <p className="text-muted-foreground">
            Overview of customer's purchase history and spending patterns
          </p>
        </div>
        <PurchaseSummaryCards summary={accountData.summary} />
      </div>

      {/* Recent Orders */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Recent orders placed by this customer
                </CardDescription>
              </div>
              <Link
                href={`/admin/sales/orders?customerEmail=${encodeURIComponent(accountData.user.email)}`}
              >
                <Button variant="outline" size="sm" className="text-xs">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <UserOrdersTable orders={accountData.recentOrders} title="" />
          </CardContent>
        </Card>
      </div>

      {/* Action Modals */}
      <EditProfileModal
        user={{
          ...accountData.user,
          name: accountData.user.name ?? null,
        }}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSuccess={handleProfileUpdateSuccess}
      />

      <ResetPasswordDialog
        user={{
          ...accountData.user,
          name: accountData.user.name ?? null,
        }}
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
      />

      <SuspendAccountDialog
        user={{
          ...accountData.user,
          name: accountData.user.name ?? null,
        }}
        open={suspendAccountOpen}
        onOpenChange={setSuspendAccountOpen}
        onSuccess={handleSuspensionSuccess}
      />

      <SpamFlagDialog
        user={{
          ...accountData.user,
          name: accountData.user.name ?? null,
        }}
        open={spamFlagOpen}
        onOpenChange={setSpamFlagOpen}
        onSuccess={handleSpamFlagSuccess}
      />
    </div>
  );
}
