"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { SupportTicketCategory } from "@/lib/supportService";
import Link from "next/link";

interface QuickActionsPanelProps {
  onCreateTicket: () => void;
  onStartChat: () => void;
  categories: SupportTicketCategory[];
}

export function QuickActionsPanel({
  onCreateTicket,
  onStartChat,
  categories,
}: QuickActionsPanelProps) {
  return (
    <Card className="h-fit border-0 bg-card">
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Primary Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Create New
          </h4>
          <div className="space-y-2">
            <Button
              onClick={onCreateTicket}
              className="w-full justify-start text-sm h-10 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-3" />
              Create Ticket
            </Button>

            <Button
              onClick={onStartChat}
              variant="outline"
              className="w-full justify-start text-sm h-10 border-2 hover:bg-muted/50"
            >
              <MessageSquare className="h-4 w-4 mr-3" />
              Start Chat
            </Button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Navigation
          </h4>

          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <Link href="/admin/support/tickets" className="block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-9 flex-col gap-1 hover:bg-muted/50"
              >
                <FileText className="h-4 w-4" />
                <span>Tickets</span>
              </Button>
            </Link>

            <Link href="/admin/support/chat" className="block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-9 flex-col gap-1 hover:bg-muted/50"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chats</span>
              </Button>
            </Link>

            <Link href="/admin/support/analytics" className="block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-9 flex-col gap-1 hover:bg-muted/50"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Button>
            </Link>

            <Link href="/admin/support/settings" className="block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-9 flex-col gap-1 hover:bg-muted/50"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Filters
          </h4>

          <div className="space-y-2">
            <Link href="/admin/support/tickets?status=open" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/30"
              >
                <Filter className="h-3 w-3 mr-2" />
                Open Tickets
              </Button>
            </Link>

            <Link
              href="/admin/support/tickets?priority=urgent"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 justify-start border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <Filter className="h-3 w-3 mr-2" />
                Urgent Priority
              </Button>
            </Link>

            <Link
              href="/admin/support/tickets?assigned_to=unassigned"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 justify-start border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
              >
                <Filter className="h-3 w-3 mr-2" />
                Unassigned
              </Button>
            </Link>

            <Link href="/admin/support/chat?status=active" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 justify-start border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/30"
              >
                <Filter className="h-3 w-3 mr-2" />
                Active Chats
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Categories
            </h4>

            <div className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/admin/support/tickets?category_id=${category.id}`}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8 hover:bg-muted/50"
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-3 border border-border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="truncate">{category.name}</span>
                  </Button>
                </Link>
              ))}

              {categories.length > 4 && (
                <Link href="/admin/support/categories">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground h-8 hover:bg-muted/50"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    View all categories...
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Search & Team */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Search & Team
          </h4>

          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <Link href="/admin/support/search?type=customer">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-9 flex-col gap-1 hover:bg-muted/50"
              >
                <Search className="h-4 w-4" />
                <span>Customers</span>
              </Button>
            </Link>

            <Link href="/admin/support/search?type=ticket">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-9 flex-col gap-1 hover:bg-muted/50"
              >
                <FileText className="h-4 w-4" />
                <span>Tickets</span>
              </Button>
            </Link>
          </div>

          <Link href="/admin/support/team" className="block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-8 hover:bg-muted/50"
            >
              <Users className="h-3 w-3 mr-2" />
              Support Team
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="pt-4 border-t border-border">
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Need help?</p>
              <Link
                href="/admin/support/help"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                View documentation
                <Search className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
