"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  PlusCircle,
  RefreshCw,
  Trash2,
  Edit,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Users,
  Loader2,
  Image as ImageIcon,
  Settings,
  CreditCard,
  BarChart3,
  HeadphonesIcon,
  MessageCircle,
  Ticket,
  UserCheck,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissionService";
import { toast } from "sonner";
import { adminQueryKeys, type AdminUser } from "@/queries/adminQueries";
import { api } from "@/lib/trpc-client";

interface AdminTeamClientProps {
  initialAdminUsers?: AdminUser[];
}

export function AdminTeamClient({
  initialAdminUsers = [],
}: AdminTeamClientProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const utils = api.useUtils();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [updatingPermissions, setUpdatingPermissions] = useState<
    { userId: string; permission: string }[]
  >([]);
  const [isUpdatingAllPermissions, setIsUpdatingAllPermissions] =
    useState(false);

  // All admins have MANAGE_ADMINS permission by default
  const canManageAdmins = session?.user?.role === "admin";

  // tRPC query for admin users with permissions
  const {
    data: adminUsers,
    isLoading,
    error,
  } = api.admin.getTeam.useQuery(undefined, {
    initialData: initialAdminUsers,
  });

  // Mutation hooks for admin management actions
  const promoteUserMutation = api.admin.promoteUser.useMutation({
    onSuccess: () => {
      toast.success("User promoted to admin successfully");
      utils.admin.getTeam.invalidate();
      setIsAddDialogOpen(false);
      setNewAdminEmail("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to promote user");
    },
  });
  const demoteAdminMutation = api.admin.demoteTeamMember.useMutation({
    onSuccess: () => {
      toast.success("Admin removed successfully");
      utils.admin.getTeam.invalidate();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove admin");
    },
  });

  const updatePermissionsMutation =
    api.admin.updateTeamMemberPermissions.useMutation({
      onSuccess: () => {
        toast.success("Permissions updated successfully");
        utils.admin.getTeam.invalidate();
        setIsEditDialogOpen(false);
        setEditingUser(null);
        setEditingPermissions([]);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update permissions");
      },
    });

  const updateSinglePermissionMutation =
    api.admin.updateTeamMemberPermission.useMutation({
      onSuccess: () => {
        utils.admin.getTeam.invalidate();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update permission");
      },
    });

  // Handle adding a new admin
  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Email is required");
      return;
    }

    try {
      await promoteUserMutation.mutateAsync({
        email: newAdminEmail,
      });
      // Success handling is done in the mutation's onSuccess callback
    } catch (error) {
      console.error("Error adding admin:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  // Handle updating admin permissions
  const handleUpdatePermissions = async () => {
    if (!editingUser) return;

    setIsUpdatingAllPermissions(true);

    try {
      await updatePermissionsMutation.mutateAsync({
        userId: editingUser.id,
        permissions: editingPermissions as (
          | "MANAGE_BLOG"
          | "MANAGE_USERS"
          | "MANAGE_ADMINS"
          | "MANAGE_COMMENTS"
          | "MANAGE_NEWSLETTER"
          | "MANAGE_IMAGES"
          | "MANAGE_SERVICES"
          | "MANAGE_PAYMENTS"
          | "VIEW_ANALYTICS"
          | "MANAGE_SUPPORT"
          | "MANAGE_CHAT"
          | "VIEW_SUPPORT_TICKETS"
          | "ASSIGN_TICKETS"
          | "VIEW_SUPPORT_ANALYTICS"
        )[],
      });
      // Success handling is done in the mutation's onSuccess callback
    } catch (error) {
      console.error("Error updating permissions:", error);
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsUpdatingAllPermissions(false);
    }
  };

  // Handle deleting an admin
  const handleDeleteAdmin = async () => {
    if (!userToDelete) return;

    try {
      await demoteAdminMutation.mutateAsync({
        userId: userToDelete.id,
      });
      // Success handling is done in the mutation's onSuccess callback
    } catch (error) {
      console.error("Error deleting admin:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  // Open the edit dialog for a user
  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setEditingPermissions([...(user.permissions || [])]);
    setIsEditDialogOpen(true);
  };

  // Open the delete dialog for a user
  const openDeleteDialog = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // No longer needed as we don't set initial permissions

  // Toggle a permission in the edit dialog
  const toggleEditPermission = (permission: string) => {
    if (editingPermissions.includes(permission)) {
      // Don't allow removing MANAGE_ADMINS from self
      if (
        permission === PERMISSION_SCOPES.MANAGE_ADMINS &&
        editingUser?.id === session?.user?.id
      ) {
        toast.error("You cannot remove your own MANAGE_ADMINS permission");
        return;
      }
      setEditingPermissions(editingPermissions.filter((p) => p !== permission));
    } else {
      setEditingPermissions([...editingPermissions, permission]);
    }
  };

  // Get a human-readable name for a permission
  const getPermissionName = (permission: string) => {
    switch (permission) {
      case PERMISSION_SCOPES.MANAGE_ADMINS:
        return "Manage Admins";
      case PERMISSION_SCOPES.MANAGE_USERS:
        return "Manage Users";
      case PERMISSION_SCOPES.MANAGE_BLOG:
        return "Manage Blog";
      case PERMISSION_SCOPES.MANAGE_COMMENTS:
        return "Manage Comments";
      case PERMISSION_SCOPES.MANAGE_NEWSLETTER:
        return "Manage Newsletter";
      case PERMISSION_SCOPES.MANAGE_IMAGES:
        return "Manage Images";
      case PERMISSION_SCOPES.MANAGE_SERVICES:
        return "Manage Services";
      case PERMISSION_SCOPES.MANAGE_SUPPORT:
        return "Manage Support";
      case PERMISSION_SCOPES.MANAGE_CHAT:
        return "Manage Chat";
      case PERMISSION_SCOPES.VIEW_SUPPORT_TICKETS:
        return "View Support Tickets";
      case PERMISSION_SCOPES.ASSIGN_TICKETS:
        return "Assign Tickets";
      case PERMISSION_SCOPES.VIEW_SUPPORT_ANALYTICS:
        return "View Support Analytics";
      case PERMISSION_SCOPES.MANAGE_SALES:
        return "Manage Sales";
      default:
        return permission;
    }
  };

  // Get a split permission name for column headers (to prevent cramping)
  const getPermissionNameSplit = (permission: string) => {
    const fullName = getPermissionName(permission);
    const words = fullName.split(" ");

    if (words.length === 2) {
      return { line1: words[0], line2: words[1] };
    } else if (words.length > 2) {
      // For longer names, try to split more evenly
      const midPoint = Math.ceil(words.length / 2);
      return {
        line1: words.slice(0, midPoint).join(" "),
        line2: words.slice(midPoint).join(" "),
      };
    } else {
      return { line1: fullName, line2: "" };
    }
  };

  // Get an icon for a permission
  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case PERMISSION_SCOPES.MANAGE_ADMINS:
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case PERMISSION_SCOPES.MANAGE_USERS:
        return <Users className="h-4 w-4 text-indigo-500" />;
      case PERMISSION_SCOPES.MANAGE_BLOG:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case PERMISSION_SCOPES.MANAGE_COMMENTS:
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case PERMISSION_SCOPES.MANAGE_NEWSLETTER:
        return <ShieldX className="h-4 w-4 text-purple-500" />;
      case PERMISSION_SCOPES.MANAGE_IMAGES:
        return <ImageIcon className="h-4 w-4 text-orange-500" />;
      case PERMISSION_SCOPES.MANAGE_SERVICES:
        return <Settings className="h-4 w-4 text-cyan-500" />;
      case PERMISSION_SCOPES.MANAGE_SUPPORT:
        return <HeadphonesIcon className="h-4 w-4 text-pink-500" />;
      case PERMISSION_SCOPES.MANAGE_CHAT:
        return <MessageCircle className="h-4 w-4 text-teal-500" />;
      case PERMISSION_SCOPES.VIEW_SUPPORT_TICKETS:
        return <Ticket className="h-4 w-4 text-violet-500" />;
      case PERMISSION_SCOPES.ASSIGN_TICKETS:
        return <UserCheck className="h-4 w-4 text-rose-500" />;
      case PERMISSION_SCOPES.VIEW_SUPPORT_ANALYTICS:
        return <TrendingUp className="h-4 w-4 text-lime-500" />;
      case PERMISSION_SCOPES.MANAGE_SALES:
        return <ShoppingCart className="h-4 w-4 text-sky-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  // Format a date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if a user is a primary admin
  const isPrimaryAdmin = (email: string) => {
    // FIXED: Removed ishan.parihar.personal@gmail.com from primary admin list as it should be a regular user
    const primaryAdminEmails = ["ishanbestdabang@gmail.com"];
    return primaryAdminEmails.includes(email?.trim().toLowerCase());
  };

  // Get the count of permissions that the current admin has
  const getVisiblePermissionsCount = () => {
    if (isPrimaryAdmin(session?.user?.email || "")) {
      // Primary admins can see all permissions
      return Object.keys(PERMISSION_SCOPES).length;
    }

    // Count how many permissions the current admin has
    if (session && Array.isArray((session?.user as any)?.permissions)) {
      return (session.user as any).permissions.length;
    }

    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Admin Team Members</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
          <Button
            onClick={() => utils.admin.getUsers.invalidate()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {process.env.NODE_ENV === "development" && (
            <Button
              onClick={() => {
                // Note: This endpoint doesn't exist - this is a development debug button
                window.open("/api/debug/supabase-service-role", "_blank");
              }}
              variant="outline"
              size="sm"
            >
              Debug
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table
              className="min-w-full table-fixed"
              style={{ minWidth: "800px" }}
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48 min-w-[12rem] px-4 py-3">
                    Name
                  </TableHead>
                  <TableHead className="w-64 min-w-[16rem] px-4 py-3">
                    Email
                  </TableHead>
                  {/* Only show permission columns for permissions the current admin has */}
                  {Object.values(PERMISSION_SCOPES).map((permission) => {
                    // Check if the current admin has this permission or is a primary admin
                    const currentUserHasPermission =
                      isPrimaryAdmin(session?.user?.email || "") ||
                      (session &&
                        Array.isArray((session?.user as any)?.permissions) &&
                        (session.user as any).permissions.includes(permission));

                    // Only render the column if the current admin has this permission
                    return currentUserHasPermission ? (
                      <TableHead
                        key={permission}
                        className="text-center w-24 min-w-[6rem] px-2 py-3"
                      >
                        <div className="flex flex-col items-center">
                          {getPermissionIcon(permission)}
                          <div className="text-xs mt-1 text-center leading-tight">
                            <div>
                              {getPermissionNameSplit(permission).line1}
                            </div>
                            {getPermissionNameSplit(permission).line2 && (
                              <div>
                                {getPermissionNameSplit(permission).line2}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableHead>
                    ) : null;
                  })}
                  <TableHead className="w-32 min-w-[8rem] px-4 py-3">
                    Added
                  </TableHead>
                  {canManageAdmins && (
                    <TableHead className="text-right w-32 min-w-[8rem] px-4 py-3">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        getVisiblePermissionsCount() + (canManageAdmins ? 4 : 3)
                      }
                      className="text-center py-8"
                    >
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">
                        Loading admin users...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : adminUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        getVisiblePermissionsCount() + (canManageAdmins ? 4 : 3)
                      }
                      className="text-center py-8"
                    >
                      <p className="text-gray-500">No admin users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  adminUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium w-48 min-w-[12rem] px-4 py-3">
                        <div className="flex flex-col">
                          <span>{user.name || "Unnamed"}</span>
                          {user.id === session?.user?.id && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit mt-1">
                              You
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-64 min-w-[16rem] px-4 py-3">
                        <span className="break-all">{user.email}</span>
                      </TableCell>

                      {/* Permission checkboxes - only show for permissions the current admin has */}
                      {Object.values(PERMISSION_SCOPES).map((permission) => {
                        // Check if the current admin has this permission or is a primary admin
                        const currentUserHasPermission =
                          isPrimaryAdmin(session?.user?.email || "") ||
                          (session &&
                            Array.isArray(
                              (session?.user as any)?.permissions,
                            ) &&
                            (session.user as any).permissions.includes(
                              permission,
                            ));

                        // Only render the switch if the current admin has this permission
                        return currentUserHasPermission ? (
                          <TableCell
                            key={permission}
                            className="text-center w-24 min-w-[6rem] px-2 py-3"
                          >
                            <div className="flex justify-center items-center">
                              {updatingPermissions.some(
                                (p) =>
                                  p.userId === user.id &&
                                  p.permission === permission,
                              ) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Switch
                                  checked={
                                    // Primary admins have all permissions
                                    isPrimaryAdmin(user.email) ||
                                    // Otherwise check the permissions array
                                    (user.permissions || []).includes(
                                      permission,
                                    )
                                  }
                                  disabled={
                                    !canManageAdmins ||
                                    isPrimaryAdmin(user.email) || // Primary admins can't have permissions changed
                                    // Only primary admins can change MANAGE_ADMINS permission for others
                                    (permission ===
                                      PERMISSION_SCOPES.MANAGE_ADMINS &&
                                      !isPrimaryAdmin(
                                        session?.user?.email || "",
                                      )) ||
                                    // Can't remove your own MANAGE_ADMINS permission
                                    (permission ===
                                      PERMISSION_SCOPES.MANAGE_ADMINS &&
                                      user.id === session?.user?.id) ||
                                    // Disable while updating
                                    updatingPermissions.some(
                                      (p) =>
                                        p.userId === user.id &&
                                        p.permission === permission,
                                    )
                                  }
                                  onCheckedChange={(checked) => {
                                    // Create a temporary user object for editing
                                    setEditingUser(user);
                                    // Create a copy of the user's permissions
                                    const newPermissions = [
                                      ...(user.permissions || []),
                                    ];

                                    if (checked) {
                                      // Add the permission if it doesn't exist
                                      if (
                                        !newPermissions.includes(permission)
                                      ) {
                                        newPermissions.push(permission);
                                      }
                                    } else {
                                      // Remove the permission if it exists
                                      const index =
                                        newPermissions.indexOf(permission);
                                      if (index !== -1) {
                                        newPermissions.splice(index, 1);
                                      }
                                    }

                                    // Update the editing permissions
                                    setEditingPermissions(newPermissions);

                                    // Add to updating permissions to show loading state
                                    setUpdatingPermissions((prev) => [
                                      ...prev,
                                      { userId: user.id, permission },
                                    ]);

                                    // Call the update function for a single permission using tRPC
                                    updateSinglePermissionMutation.mutate(
                                      {
                                        userId: user.id,
                                        permission: permission as
                                          | "MANAGE_BLOG"
                                          | "MANAGE_USERS"
                                          | "MANAGE_ADMINS"
                                          | "MANAGE_COMMENTS"
                                          | "MANAGE_NEWSLETTER"
                                          | "MANAGE_IMAGES"
                                          | "MANAGE_SERVICES"
                                          | "MANAGE_PAYMENTS"
                                          | "VIEW_ANALYTICS"
                                          | "MANAGE_SUPPORT"
                                          | "MANAGE_CHAT"
                                          | "VIEW_SUPPORT_TICKETS"
                                          | "ASSIGN_TICKETS"
                                          | "VIEW_SUPPORT_ANALYTICS",
                                        enabled: !!checked,
                                      },
                                      {
                                        onSuccess: () => {
                                          toast.success("Permission updated");
                                          // Remove from updating permissions
                                          setUpdatingPermissions((prev) =>
                                            prev.filter(
                                              (p) =>
                                                !(
                                                  p.userId === user.id &&
                                                  p.permission === permission
                                                ),
                                            ),
                                          );
                                        },
                                        onError: (error) => {
                                          toast.error(
                                            error.message ||
                                              "Failed to update permission",
                                          );
                                          // Remove from updating permissions
                                          setUpdatingPermissions((prev) =>
                                            prev.filter(
                                              (p) =>
                                                !(
                                                  p.userId === user.id &&
                                                  p.permission === permission
                                                ),
                                            ),
                                          );
                                        },
                                      },
                                    );
                                  }}
                                />
                              )}
                            </div>
                          </TableCell>
                        ) : null;
                      })}

                      <TableCell className="w-32 min-w-[8rem] px-4 py-3">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </span>
                      </TableCell>
                      {canManageAdmins && (
                        <TableCell className="text-right w-32 min-w-[8rem] px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {user.id !== session?.user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(user)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the email of the user you want to promote to admin. New
              admins have no permissions by default.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="user@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              After adding the admin, you can edit their permissions by clicking
              the Edit button.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for{" "}
              {editingUser?.name || editingUser?.email || "this admin"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {Object.values(PERMISSION_SCOPES).map((permission) => {
                  // Check if the current admin has this permission or is a primary admin
                  const currentUserHasPermission =
                    isPrimaryAdmin(session?.user?.email || "") ||
                    (session &&
                      Array.isArray((session?.user as any)?.permissions) &&
                      (session.user as any).permissions.includes(permission));

                  // Only render the switch if the current admin has this permission
                  return currentUserHasPermission ? (
                    <div
                      key={permission}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`edit-${permission}`}
                          className="flex items-center cursor-pointer"
                        >
                          {getPermissionIcon(permission)}
                          <span className="ml-2">
                            {getPermissionName(permission)}
                          </span>
                          {permission === PERMISSION_SCOPES.MANAGE_ADMINS &&
                            editingUser?.id === session?.user?.id && (
                              <span className="ml-2 text-xs text-red-500">
                                (Cannot remove from yourself)
                              </span>
                            )}
                          {permission === PERMISSION_SCOPES.MANAGE_ADMINS &&
                            !isPrimaryAdmin(session?.user?.email || "") &&
                            editingUser?.id !== session?.user?.id && (
                              <span className="ml-2 text-xs text-red-500">
                                (Only primary admins can change this)
                              </span>
                            )}
                        </Label>
                      </div>
                      <Switch
                        id={`edit-${permission}`}
                        checked={editingPermissions.includes(permission)}
                        onCheckedChange={() => toggleEditPermission(permission)}
                        disabled={
                          // Can't remove your own MANAGE_ADMINS permission
                          (permission === PERMISSION_SCOPES.MANAGE_ADMINS &&
                            editingUser?.id === session?.user?.id) ||
                          // Only primary admins can change MANAGE_ADMINS permission for others
                          (permission === PERMISSION_SCOPES.MANAGE_ADMINS &&
                            !isPrimaryAdmin(session?.user?.email || ""))
                        }
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdatingAllPermissions}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={isUpdatingAllPermissions}
            >
              {isUpdatingAllPermissions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Permissions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove admin privileges from{" "}
              <strong>{userToDelete?.name || userToDelete?.email}</strong>? This
              will demote them to a regular user and remove all their admin
              permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
