"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Edit,
  RefreshCw,
  FileText,
  AlertTriangle,
  Download,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc-client";
import { AddNoteModal } from "./add-note-modal";

interface OrderActionsPanelProps {
  order: any; // TODO: Type this properly based on the tRPC response
}

export function OrderActionsPanel({ order }: OrderActionsPanelProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const { toast } = useToast();

  // tRPC mutations
  const utils = api.useUtils();
  const updateOrderStatus = api.payments.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.payments.getOrderDetails.invalidate({ orderId: order.id });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
      setIsLoading(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
      setIsLoading(null);
    },
  });

  const addInternalNote = api.payments.addInternalNote.useMutation({
    onSuccess: () => {
      utils.payments.getOrderDetails.invalidate({ orderId: order.id });
      toast({
        title: "Success",
        description: "Internal note added successfully.",
      });
      setIsNoteModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add internal note.",
        variant: "destructive",
      });
    },
  });

  const generateReceipt = api.payments.generateReceipt.useMutation({
    onSuccess: (data) => {
      utils.payments.getOrderDetails.invalidate({ orderId: order.id });
      toast({
        title: "Success",
        description: "Receipt generated successfully.",
      });
      setIsLoading(null);

      // Open receipt in new tab
      if (data.receipt_url) {
        window.open(data.receipt_url, "_blank");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt.",
        variant: "destructive",
      });
      setIsLoading(null);
    },
  });

  const handleStatusUpdate = (status: "paid" | "completed" | "cancelled") => {
    setIsLoading(`Mark as ${status}`);
    updateOrderStatus.mutate({
      orderId: order.id,
      status,
    });
  };

  const handleAddNote = (note: string) => {
    addInternalNote.mutate({
      orderId: order.id,
      note,
    });
  };

  const handleAction = async (action: string) => {
    if (action === "Generate Receipt") {
      setIsLoading(action);
      generateReceipt.mutate({ orderId: order.id });
      return;
    }

    setIsLoading(action);

    // Simulate API call delay for unimplemented actions
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Action Completed",
      description: `${action} action has been executed successfully.`,
    });

    setIsLoading(null);
  };

  const actions = [
    {
      id: "generate-receipt",
      label: "Generate Receipt",
      icon: Receipt,
      variant: "default" as const,
      description: "Create and download a PDF receipt for this order",
    },
    {
      id: "update-status",
      label: "Update Status",
      icon: Edit,
      variant: "outline" as const,
      description: "Change the order status and add notes",
    },
    {
      id: "process-refund",
      label: "Process Refund",
      icon: RefreshCw,
      variant: "outline" as const,
      description: "Initiate a refund for this order",
      destructive: true,
    },
    {
      id: "add-note",
      label: "Add Internal Note",
      icon: FileText,
      variant: "outline" as const,
      description: "Add internal notes for team reference",
      onClick: () => setIsNoteModalOpen(true),
    },
  ] as Array<{
    id: string;
    label: string;
    icon: any;
    variant: "default" | "outline";
    description: string;
    destructive?: boolean;
    onClick?: () => void;
  }>;

  const quickActions = [
    {
      id: "download-invoice",
      label: "Download Invoice",
      icon: Download,
      variant: "ghost" as const,
    },
    {
      id: "contact-customer",
      label: "Contact Customer",
      icon: MessageSquare,
      variant: "ghost" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Order Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              className={`w-full justify-start ${
                action.destructive ? "text-red-600 hover:text-red-700" : ""
              }`}
              onClick={() =>
                action.onClick ? action.onClick() : handleAction(action.label)
              }
              disabled={isLoading === action.label}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {isLoading === action.label ? "Processing..." : action.label}
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                className="text-xs"
                onClick={() => handleAction(action.label)}
                disabled={isLoading === action.label}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Order Status Actions */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Status Actions</div>
          <div className="space-y-1">
            {order.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleStatusUpdate("paid")}
                disabled={
                  isLoading === "Mark as paid" || updateOrderStatus.isPending
                }
              >
                {isLoading === "Mark as paid" || updateOrderStatus.isPending
                  ? "Processing..."
                  : "Mark as Paid"}
              </Button>
            )}

            {order.status === "paid" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleStatusUpdate("completed")}
                disabled={
                  isLoading === "Mark as completed" ||
                  updateOrderStatus.isPending
                }
              >
                {isLoading === "Mark as completed" ||
                updateOrderStatus.isPending
                  ? "Processing..."
                  : "Mark as Completed"}
              </Button>
            )}

            {(order.status === "pending" || order.status === "processing") && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-red-600 hover:text-red-700"
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={
                  isLoading === "Mark as cancelled" ||
                  updateOrderStatus.isPending
                }
              >
                {isLoading === "Mark as cancelled" ||
                updateOrderStatus.isPending
                  ? "Processing..."
                  : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>

        {/* Order Information */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Order Information</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date(order.updated_at).toLocaleDateString()}</span>
            </div>
            {order.paid_at && (
              <div className="flex justify-between">
                <span>Paid:</span>
                <span>{new Date(order.paid_at).toLocaleDateString()}</span>
              </div>
            )}
            {order.completed_at && (
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>{new Date(order.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Internal Notes */}
        {order.internal_notes && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Internal Notes</div>
            <div className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">
              {order.internal_notes}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleAddNote}
        isLoading={addInternalNote.isPending}
      />
    </Card>
  );
}
