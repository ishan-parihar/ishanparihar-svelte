"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface CustomerInfoCardProps {
  order: any; // TODO: Type this properly based on the tRPC response
}

export function CustomerInfoCard({ order }: CustomerInfoCardProps) {
  const customer = order.customer;
  const customerEmail = order.customer_email;
  const customerName = order.customer_name;
  const customerPhone = order.customer_phone;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Avatar and Basic Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={customer?.picture || ""}
              alt={customerName || customerEmail || "Customer"}
            />
            <AvatarFallback>
              {customerName
                ? getInitials(customerName)
                : customerEmail?.charAt(0).toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">
              {customerName || "Unknown Customer"}
            </div>
            <div className="text-sm text-muted-foreground">{customerEmail}</div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <a
              href={`mailto:${customerEmail}`}
              className="text-primary hover:underline"
            >
              {customerEmail}
            </a>
          </div>

          {customerPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <a
                href={`tel:${customerPhone}`}
                className="text-primary hover:underline"
              >
                {customerPhone}
              </a>
            </div>
          )}

          {customer?.id && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {customer.id.slice(0, 8)}
              </span>
            </div>
          )}
        </div>

        {/* Customer Account Status */}
        {customer ? (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-3">
            <p className="font-semibold text-green-800 dark:text-green-300">
              Registered User
            </p>
            <p className="text-sm text-muted-foreground">
              This customer has an account.
            </p>
            <Link
              href={`/admin/accounts/${customer.id}`}
              className="text-sm text-blue-500 hover:underline mt-1 block"
            >
              View Full Profile
            </Link>
          </div>
        ) : (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300">
              Guest Customer
            </p>
            <p className="text-sm text-muted-foreground">
              This customer made a purchase without creating an account.
            </p>
          </div>
        )}

        {/* Customer Actions */}
        <div className="space-y-2">
          {customer?.id && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/admin/accounts/${customer.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Customer Profile
              </Link>
            </Button>
          )}

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link
              href={`/admin/sales/orders?customerEmail=${encodeURIComponent(customerEmail)}`}
            >
              View All Orders
            </Link>
          </Button>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={`mailto:${customerEmail}?subject=Regarding Order ${order.order_number || order.id?.slice(0, 8)}`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </a>
          </Button>
        </div>

        {/* Order History Summary */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Quick Stats</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted p-2 rounded text-center">
              <div className="font-medium">First Order</div>
              <div className="text-muted-foreground">
                {format(new Date(order.created_at), "MMM yyyy")}
              </div>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <div className="font-medium">Order Value</div>
              <div className="text-muted-foreground">
                {order.currency} {order.total_amount}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
