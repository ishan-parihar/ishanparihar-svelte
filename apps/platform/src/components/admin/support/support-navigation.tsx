"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Ticket,
  MessageSquare,
  Search,
  Bell,
  RefreshCw,
  Plus,
} from "lucide-react";
import { api } from "@/lib/trpc-client";
import { cn } from "@/lib/utils";

interface SupportMetrics {
  total_tickets: number;
  open_tickets: number;
  urgent_tickets: number;
  active_chat_sessions: number;
  unread_notifications: number;
}

export function SupportNavigation() {
  const pathname = usePathname();

  // Fetch support metrics for badges using tRPC
  const { data: metrics } = api.support.getChatMetrics.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const navigationItems = [
    {
      href: "/admin/support",
      label: "Dashboard",
      icon: TrendingUp,
      badge: null,
      exact: true,
    },
    {
      href: "/admin/support/tickets",
      label: "Tickets",
      icon: Ticket,
      badge: metrics?.open_tickets || 0,
      exact: false,
    },
    {
      href: "/admin/support/chat",
      label: "Chat",
      icon: MessageSquare,
      badge: metrics?.active_chats || 0,
      exact: false,
    },
    {
      href: "/admin/support/search",
      label: "Search",
      icon: Search,
      badge: null,
      exact: false,
    },
    {
      href: "/admin/support/notifications",
      label: "Notifications",
      icon: Bell,
      badge: metrics?.unread_notifications || 0,
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
        <nav className="flex space-x-8" aria-label="Support Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 font-ui",
                  active
                    ? "border-brand-accent dark:border-brand-accent text-text-primary dark:text-[var(--text-primary)]"
                    : "border-transparent text-text-secondary dark:text-[var(--text-secondary)] hover:text-text-primary dark:hover:text-[var(--text-primary)] hover:border-brand-accent/50 dark:hover:border-brand-accent/50",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <Badge
                    variant={active ? "default" : "secondary"}
                    className={cn(
                      "ml-1 h-5 min-w-[20px] text-xs rounded-none font-ui",
                      active
                        ? "bg-brand-accent text-white dark:bg-brand-accent dark:text-white"
                        : "bg-[var(--bg-tertiary)] text-text-secondary dark:bg-[var(--bg-tertiary)] dark:text-[var(--text-secondary)] border border-[var(--border-primary)]",
                    )}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons - Vectura Labs Theme */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-[var(--border-primary)] dark:border-[var(--border-primary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)] text-text-primary dark:text-[var(--text-primary)] rounded-none font-ui"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {pathname.includes("/tickets") && (
            <Button
              size="sm"
              className="bg-brand-accent text-white hover:bg-[var(--brand-accent-hover)] dark:bg-brand-accent dark:text-white dark:hover:bg-[var(--brand-accent-hover)] rounded-none font-ui font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          )}

          {pathname.includes("/chat") && (
            <Button
              size="sm"
              className="bg-brand-accent text-white hover:bg-[var(--brand-accent-hover)] dark:bg-brand-accent dark:text-white dark:hover:bg-[var(--brand-accent-hover)] rounded-none font-ui font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
