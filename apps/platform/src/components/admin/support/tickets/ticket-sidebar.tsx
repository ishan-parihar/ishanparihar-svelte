"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  MessageSquare,
  ShoppingCart,
  Edit,
  Save,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SupportTicket,
  SupportTicketCategory,
  formatTimeAgo,
} from "@/lib/supportService";
import Link from "next/link";

interface TicketSidebarProps {
  ticket: SupportTicket;
  categories: SupportTicketCategory[];
  adminUsers: any[];
  onUpdate: (updates: Partial<SupportTicket>) => void;
}

export function TicketSidebar({
  ticket,
  categories,
  adminUsers,
  onUpdate,
}: TicketSidebarProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState(
    ticket.internal_notes || "",
  );

  const handleSaveNotes = () => {
    onUpdate({ internal_notes: internalNotes });
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setInternalNotes(ticket.internal_notes || "");
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-4">
      {/* Customer Information */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={ticket.customer?.image}
                alt={
                  ticket.customer?.name || ticket.customer_name || "Customer"
                }
              />
              <AvatarFallback className="text-xs">
                {(
                  ticket.customer?.name ||
                  ticket.customer_name ||
                  ticket.customer_email
                )
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-tight">
                {ticket.customer?.name ||
                  ticket.customer_name ||
                  "Anonymous Customer"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 break-all">
                {ticket.customer_email}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs break-all">{ticket.customer_email}</span>
            </div>

            {(() => {
              const customer = ticket.customer;
              if (customer && "created_at" in customer && customer.created_at) {
                return (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs">
                      Customer since{" "}
                      {formatTimeAgo(customer.created_at as string)}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2 border-t">
            <Link
              href={`/admin/support/tickets?customer_email=${encodeURIComponent(ticket.customer_email)}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8"
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                View All Tickets
              </Button>
            </Link>

            {(() => {
              const customer = ticket.customer;
              return customer && "id" in customer && customer.id ? (
                <Link href={`/admin/accounts?user_id=${customer.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <User className="h-3 w-3 mr-2" />
                    View Profile
                  </Button>
                </Link>
              ) : null;
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Properties */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </label>
            <Select
              value={ticket.status}
              onValueChange={(value) => onUpdate({ status: value as any })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting for Customer</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Priority
            </label>
            <Select
              value={ticket.priority}
              onValueChange={(value) => onUpdate({ priority: value as any })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <Select
              value={ticket.category_id || "none"}
              onValueChange={(value) =>
                onUpdate({ category_id: value === "none" ? undefined : value })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
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

          {/* Assigned To */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <Select
              value={ticket.assigned_to || "unassigned"}
              onValueChange={(value) =>
                onUpdate({
                  assigned_to: value === "unassigned" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {adminUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Related Information */}
      {(ticket.order_id || ticket.service_id) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticket.order_id && (
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Order ID: {ticket.order_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Related order
                    </p>
                  </div>
                </div>
                <Link href={`/admin/orders/${ticket.order_id}`}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>
              </div>
            )}

            {ticket.service_id && (
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Service ID: {ticket.service_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Related service
                    </p>
                  </div>
                </div>
                <Link href={`/admin/services/${ticket.service_id}`}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Internal Notes</CardTitle>
            {!isEditingNotes && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingNotes(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes (not visible to customer)..."
                rows={4}
              />
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleSaveNotes}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelNotes}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              {ticket.internal_notes ? (
                <p className="whitespace-pre-wrap">{ticket.internal_notes}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  No internal notes
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Created {formatTimeAgo(ticket.created_at)}</span>
          </div>

          {ticket.updated_at !== ticket.created_at && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Updated {formatTimeAgo(ticket.updated_at)}</span>
            </div>
          )}

          {ticket.assigned_at && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Assigned {formatTimeAgo(ticket.assigned_at)}</span>
            </div>
          )}

          {ticket.resolved_at && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <span>Resolved {formatTimeAgo(ticket.resolved_at)}</span>
            </div>
          )}

          {ticket.closed_at && (
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-muted-foreground" />
              <span>Closed {formatTimeAgo(ticket.closed_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
