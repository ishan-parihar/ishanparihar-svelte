"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/trpc-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  suspended?: boolean;
  suspended_at?: string | null;
  suspended_by?: string | null;
  suspension_reason?: string | null;
  suspension_expires_at?: string | null;
  spam_score?: number;
  is_spam_flagged?: boolean;
  spam_flagged_at?: string | null;
  spam_flagged_by?: string | null;
}

interface EditProfileModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProfileModal({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.role || "user");
  const utils = api.useUtils();

  const updateProfileMutation = api.admin.updateUserProfile.useMutation({
    onSuccess: (data) => {
      toast.success("User profile updated successfully");
      // Invalidate the specific user's account details to force a refetch
      if (data?.id) {
        utils.admin.getAccountDetails.invalidate({ userId: data.id });
      }
      // Also invalidate the users list for consistency
      utils.admin.getUsers.invalidate();
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    updateProfileMutation.mutate({
      userId: user.id,
      name: name.trim(),
      role: role as "user" | "admin",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update the user's name and role. Changes will take effect
            immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const resetPasswordMutation = api.admin.sendPasswordReset.useMutation({
    onSuccess: () => {
      toast.success(`Password reset email sent to ${user.email}`);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send password reset email");
    },
  });

  const handleConfirm = () => {
    resetPasswordMutation.mutate({
      email: user.email,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Password Reset Email</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to send a password reset email to{" "}
            <span className="font-medium">{user.email}</span>?
            <br />
            <br />
            The user will receive an email with instructions to reset their
            password.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={resetPasswordMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send Reset Email
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface SuspendAccountDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SuspendAccountDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: SuspendAccountDialogProps) {
  const isSuspended = user.suspended || false;
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPermanent, setIsPermanent] = useState(true);

  const suspendUserMutation = api.admin.suspendUser.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      onSuccess();
      onOpenChange(false);
      // Reset form
      setReason("");
      setExpiresAt("");
      setIsPermanent(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user suspension status");
    },
  });

  const handleConfirm = () => {
    let expirationDate = undefined;

    if (!isPermanent && expiresAt && expiresAt.trim() !== "") {
      // Convert datetime-local format to ISO string with proper timezone
      // datetime-local gives us "YYYY-MM-DDTHH:mm" format
      // We need to convert it to a proper ISO string with timezone
      const date = new Date(expiresAt);

      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        expirationDate = date.toISOString();
        console.log("Converted date:", expiresAt, "->", expirationDate);
      } else {
        console.error("Invalid date format:", expiresAt);
        toast.error("Invalid expiration date format");
        return; // Don't proceed with invalid date
      }
    }

    console.log("Suspend user payload:", {
      userId: user.id,
      suspend: !isSuspended,
      reason: reason.trim() || undefined,
      expiresAt: expirationDate,
    });

    suspendUserMutation.mutate({
      userId: user.id,
      suspend: !isSuspended,
      reason: reason.trim() || undefined,
      expiresAt: expirationDate,
    });
  };

  // Format suspension info for display
  const getSuspensionInfo = () => {
    if (!isSuspended) return null;

    const suspendedAt = user.suspended_at
      ? new Date(user.suspended_at).toLocaleDateString()
      : "Unknown";
    const expiresAt = user.suspension_expires_at
      ? new Date(user.suspension_expires_at).toLocaleDateString()
      : "Never";
    const reason = user.suspension_reason || "No reason provided";

    return (
      <div className="mt-4 p-3 bg-muted rounded-md text-sm">
        <p>
          <strong>Suspended on:</strong> {suspendedAt}
        </p>
        <p>
          <strong>Expires:</strong> {expiresAt}
        </p>
        <p>
          <strong>Reason:</strong> {reason}
        </p>
      </div>
    );
  };

  if (isSuspended) {
    // Simple unsuspend dialog
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsuspend Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unsuspend the account for{" "}
              <span className="font-medium">{user.email}</span>?
              <br />
              <br />
              The user will regain access to their account and all features.
              {getSuspensionInfo()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspendUserMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={suspendUserMutation.isPending}
            >
              {suspendUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Unsuspend Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Enhanced suspend dialog with reason and expiration
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Suspend Account</DialogTitle>
          <DialogDescription>
            Suspend the account for{" "}
            <span className="font-medium">{user.email}</span>. This will prevent
            the user from logging in and accessing their account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for suspension</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for suspension..."
            />
          </div>

          <div className="space-y-3">
            <Label>Suspension Duration</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="permanent"
                  checked={isPermanent}
                  onChange={() => setIsPermanent(true)}
                  className="h-4 w-4"
                />
                <Label htmlFor="permanent" className="text-sm font-normal">
                  Permanent suspension
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="temporary"
                  checked={!isPermanent}
                  onChange={() => setIsPermanent(false)}
                  className="h-4 w-4"
                />
                <Label htmlFor="temporary" className="text-sm font-normal">
                  Temporary suspension
                </Label>
              </div>
            </div>

            {!isPermanent && (
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires on</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={suspendUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={
              suspendUserMutation.isPending || (!isPermanent && !expiresAt)
            }
          >
            {suspendUserMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Suspend Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SpamFlagDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SpamFlagDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: SpamFlagDialogProps) {
  const isSpamFlagged = user.is_spam_flagged || false;
  const [reason, setReason] = useState("");
  const [spamScore, setSpamScore] = useState(100);

  const flagSpamMutation = api.admin.flagUserAsSpam.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      onSuccess();
      onOpenChange(false);
      setReason("");
      setSpamScore(100);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user spam status");
    },
  });

  const handleConfirm = () => {
    flagSpamMutation.mutate({
      userId: user.id,
      isSpam: !isSpamFlagged,
      reason: reason.trim() || undefined,
      spamScore: isSpamFlagged ? 0 : spamScore,
    });
  };

  // Format spam info for display
  const getSpamInfo = () => {
    if (!isSpamFlagged) return null;

    const flaggedAt = user.spam_flagged_at
      ? new Date(user.spam_flagged_at).toLocaleDateString()
      : "Unknown";
    const score = user.spam_score || 0;

    return (
      <div className="mt-4 p-3 bg-muted rounded-md text-sm">
        <p>
          <strong>Flagged on:</strong> {flaggedAt}
        </p>
        <p>
          <strong>Spam Score:</strong> {score}/100
        </p>
      </div>
    );
  };

  if (isSpamFlagged) {
    // Simple unflag dialog
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Spam Flag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the spam flag from{" "}
              <span className="font-medium">{user.email}</span>?
              <br />
              <br />
              This will mark the user as legitimate and reset their spam score.
              {getSpamInfo()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={flagSpamMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={flagSpamMutation.isPending}
            >
              {flagSpamMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove Spam Flag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Enhanced spam flag dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Flag as Spam</DialogTitle>
          <DialogDescription>
            Flag the account <span className="font-medium">{user.email}</span>{" "}
            as spam. This will mark the user as potentially malicious.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spam-reason">Reason for spam flag</Label>
            <Input
              id="spam-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for flagging as spam..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spam-score">Spam Score (0-100)</Label>
            <Input
              id="spam-score"
              type="number"
              min="0"
              max="100"
              value={spamScore}
              onChange={(e) => setSpamScore(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Higher scores indicate higher confidence that this is spam
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={flagSpamMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={flagSpamMutation.isPending}
          >
            {flagSpamMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Flag as Spam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
