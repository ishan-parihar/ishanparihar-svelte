"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import {
  FileText,
  MessageSquare,
  Mail,
  Users,
  Shield,
  Image,
  Headphones,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissionService";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import { api } from "@/lib/trpc-client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminDashboardClientProps {
  serverPermissions?: string[];
}

interface AnalyticsData {
  totalEvents: number;
  uniqueVisitors: number;
  topEvents: { event_name: string; count: number }[];
}

export function AdminDashboardClient({
  serverPermissions = [],
}: AdminDashboardClientProps) {
  // Get the current session to check permissions
  const { data: session } = useSession();
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Helper function to check if the user has a specific permission
  // Uses both server-fetched permissions and session permissions
  const hasPermission = (permission: string) => {
    // First check if the permission is in the server-fetched permissions
    if (serverPermissions.includes(permission)) {
      return true;
    }

    // Fall back to client-side permission check
    return hasPermissionFromSession(session, permission);
  };

  // Check specific permissions
  const hasManageAdminsPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_ADMINS,
  );
  const hasManageUsersPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_USERS,
  );
  const hasManageBlogPermission = hasPermission(PERMISSION_SCOPES.MANAGE_BLOG);
  const hasManageCommentsPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_COMMENTS,
  );
  const hasManageNewsletterPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_NEWSLETTER,
  );

  const hasManageServicesPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_SERVICES,
  );
  const hasManageSupportPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_SUPPORT,
  );
  const hasViewSupportPermission = hasPermission(
    PERMISSION_SCOPES.VIEW_SUPPORT_TICKETS,
  );
  const hasManageSalesPermission = hasPermission(
    PERMISSION_SCOPES.MANAGE_SALES,
  );
  const hasViewAnalyticsPermission = hasPermission(
    PERMISSION_SCOPES.VIEW_ANALYTICS,
  );

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        // In a real implementation, you would fetch this data from your API
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          totalEvents: 1242,
          uniqueVisitors: 842,
          topEvents: [
            { event_name: "page_view", count: 420 },
            { event_name: "click_cta", count: 210 },
            { event_name: "form_submit", count: 180 },
            { event_name: "video_play", count: 150 },
            { event_name: "download", count: 95 },
          ],
        };
        setAnalyticsData(mockData);
      } catch (error) {
        toast.error("Failed to load analytics data");
        console.error("Analytics fetch error:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    if (hasViewAnalyticsPermission) {
      fetchAnalytics();
    }
  }, [hasViewAnalyticsPermission]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Team Management Card - Only visible to admins with MANAGE_ADMINS permission */}
      {hasManageAdminsPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Manage admin team members and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add or remove admin team members and assign specific permissions
              to control access to different parts of the admin dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
            >
              <LinkLoadingWrapper href="/admin/team" showIndicator={true}>
                <Shield className="mr-2 h-4 w-4" />
                Manage Team
              </LinkLoadingWrapper>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Analytics Dashboard Card - Available to admins with VIEW_ANALYTICS permission */}
      {hasViewAnalyticsPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Overview of site activity and user engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : analyticsData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{analyticsData.totalEvents}</div>
                    <div className="text-xs text-muted-foreground">Total Events</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{analyticsData.uniqueVisitors}</div>
                    <div className="text-xs text-muted-foreground">Unique Visitors</div>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analyticsData.topEvents}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="event_name" 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                      />
                      <YAxis hide={true} />
                      <Tooltip 
                        formatter={(value) => [value, "Events"]}
                        labelFormatter={(value) => `Event: ${value}`}
                      />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No analytics data available at the moment.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
            >
              <LinkLoadingWrapper href="/admin/analytics" showIndicator={true}>
                <BarChart className="mr-2 h-4 w-4" />
                View Full Dashboard
              </LinkLoadingWrapper>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Blog Management Card - Only visible to admins with MANAGE_BLOG permission */}
      {hasManageBlogPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Blog Management</CardTitle>
            <CardDescription>
              Create, edit, and manage blog posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access the blog management interface to create new posts, edit
              existing ones, and manage your blog content.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/blog"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <FileText className="mr-2 h-4 w-4" />
                Manage Blog
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}

      {/* Services Management Card - Only visible to admins with MANAGE_SERVICES permission */}
      {hasManageServicesPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Services & Products</CardTitle>
            <CardDescription>
              Create, edit, and manage services and products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access the services management interface to create new services,
              edit existing ones, and manage your service offerings.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/services"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <FileText className="mr-2 h-4 w-4" />
                Manage Services
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}

      {/* Customer Support Card - Only visible to admins with support permissions */}
      {(hasManageSupportPermission || hasViewSupportPermission) && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Customer Support</CardTitle>
            <CardDescription>
              Manage tickets, chat with customers, and track support metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access the customer support interface to handle tickets, engage in
              live chat with customers, and monitor support performance.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/support"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <Headphones className="mr-2 h-4 w-4" />
                Manage Support
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}

      {/* Sales & Revenue Card - Only visible to admins with MANAGE_SALES permission */}
      {hasManageSalesPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Sales & Revenue</CardTitle>
            <CardDescription>
              Manage orders, track revenue, and analyze customer billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access the sales dashboard to manage orders, track revenue
              metrics, analyze customer billing, and handle payment disputes.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/sales"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <TrendingUp className="mr-2 h-4 w-4" />
                Manage Sales
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}

      {/* Comments Management Card - Only visible to admins with MANAGE_COMMENTS permission */}
      {hasManageCommentsPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Comments Management</CardTitle>
            <CardDescription>Moderate and manage user comments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review, approve, edit, or delete user comments on blog posts.
              Manage community discussions and maintain content quality.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/comments"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <MessageSquare className="mr-2 h-4 w-4" />
                Manage Comments
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}

      {/* Newsletter Management Card - Only visible to admins with MANAGE_NEWSLETTER permission */}
      {hasManageNewsletterPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Newsletter Management</CardTitle>
            <CardDescription>Manage subscribers and campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage newsletter subscribers, create and send email campaigns,
              and track engagement metrics.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/newsletter"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <Mail className="mr-2 h-4 w-4" />
                Manage Newsletter
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}

      {/* Account Management Card - Only visible to admins with MANAGE_USERS permission */}
      {hasManageUsersPermission && (
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage user accounts and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage user accounts and track which accounts are subscribed to
              the newsletter. View and update subscription status.
            </p>
          </CardContent>
          <CardFooter>
            <LinkLoadingWrapper
              href="/admin/accounts"
              showIndicator={true}
              className="w-full"
            >
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                <Users className="mr-2 h-4 w-4" />
                Manage Accounts
              </Button>
            </LinkLoadingWrapper>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
