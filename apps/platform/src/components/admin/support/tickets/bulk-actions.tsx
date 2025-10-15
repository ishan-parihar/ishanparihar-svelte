"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Check,
  Clock,
  AlertTriangle,
  Archive,
  UserPlus,
  Tag,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SupportTicketCategory } from "@/lib/supportService";

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string, data?: any) => Promise<void>;
  onClearSelection: () => void;
  categories: SupportTicketCategory[];
  adminUsers: any[];
}

export function BulkActions({
  selectedCount,
  onBulkAction,
  onClearSelection,
  categories,
  adminUsers,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action: string, data?: any) => {
    try {
      setIsProcessing(true);
      await onBulkAction(action, data);
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-blue-600">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="h-4 w-px bg-blue-300" />

          {/* Status Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_status", { status: "in_progress" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_status", { status: "resolved" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Resolved
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_status", { status: "closed" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              <Archive className="h-3 w-3 mr-1" />
              Closed
            </Button>
          </div>

          <div className="h-4 w-px bg-blue-300" />

          {/* Priority Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Priority:</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_priority", { priority: "urgent" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_priority", { priority: "high" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              High
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_priority", { priority: "medium" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              Medium
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleBulkAction("update_priority", { priority: "low" })
              }
              disabled={isProcessing}
              className="text-xs"
            >
              Low
            </Button>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          {/* Assign To */}
          <div className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <Select
              onValueChange={(value) =>
                handleBulkAction("assign", { assigned_to: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">Unassign</SelectItem>
                {adminUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Select
              onValueChange={(value) =>
                handleBulkAction("update_category", { category_id: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Set category..." />
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

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isProcessing}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Selected Tickets</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedCount} selected
                  ticket{selectedCount > 1 ? "s" : ""}? This action will close
                  the tickets and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleBulkAction("delete")}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete {selectedCount} Ticket{selectedCount > 1 ? "s" : ""}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-3 pt-3 border-t border-blue-300">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            <span>
              Processing {selectedCount} ticket{selectedCount > 1 ? "s" : ""}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
