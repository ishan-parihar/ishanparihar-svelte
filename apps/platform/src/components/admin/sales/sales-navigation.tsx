"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Users,
  RefreshCw,
  Plus,
} from "lucide-react";
// import { api } from "@/lib/trpc-client"; // TODO: Uncomment when sales API is implemented
import { cn } from "@/lib/utils";

interface SalesMetrics {
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  monthly_revenue: number;
}

export function SalesNavigation() {
  const pathname = usePathname();

  // TODO: Fetch sales metrics for navigation badges when API is implemented
  // const { data: metrics } = api.admin.sales.getMetrics.useQuery(undefined, {
  //   refetchInterval: 30000, // Refetch every 30 seconds
  //   staleTime: 25000, // Consider data stale after 25 seconds
  // });

  // Placeholder metrics for now
  const metrics = {
    total_orders: 0,
    pending_orders: 0,
    total_customers: 0,
    monthly_revenue: 0,
  };

  const navigationItems = [
    {
      href: "/admin/sales",
      label: "Dashboard",
      icon: TrendingUp,
      badge: null,
      exact: true,
    },
    {
      href: "/admin/sales/orders",
      label: "Orders",
      icon: ShoppingCart,
      badge: metrics?.pending_orders || 0,
      exact: false,
    },
    {
      href: "/admin/sales/analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
      exact: false,
    },
    {
      href: "/admin/sales/customers",
      label: "Customers",
      icon: Users,
      badge: metrics?.total_customers || 0,
      exact: false,
    },
  ];

  const isActive = (item: (typeof navigationItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="border-b border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between py-2 px-6">
        {/* Navigation Tabs - Horizontal Layout */}
        <nav className="flex space-x-8" aria-label="Sales Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "bg-ui-accent dark:bg-[var(--bg-accent)] text-text-primary dark:text-[var(--text-primary)] border-b-2 border-ui-accent dark:border-[var(--border-accent)]"
                    : "text-text-secondary dark:text-[var(--text-secondary)] hover:text-text-primary dark:hover:text-[var(--text-primary)] hover:bg-ui-muted dark:hover:bg-[var(--bg-muted)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-ui-accent dark:bg-[var(--bg-accent)] text-text-primary dark:text-[var(--text-primary)] text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-ui-border dark:border-[var(--border-primary)] text-text-secondary dark:text-[var(--text-secondary)] hover:text-text-primary dark:hover:text-[var(--text-primary)]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
