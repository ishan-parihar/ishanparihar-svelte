"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Lightbulb,
  Hash,
  FileText,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/trpc-client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ConceptFormData {
  name: string;
  slug: string;
  description?: string;
}

export default function ConceptsAdminPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);

  // Queries
  const { data: concepts, isLoading, refetch } = api.concepts.list.useQuery();

  // Mutations
  const createMutation = api.concepts.create.useMutation({
    onSuccess: () => {
      toast.success("Concept created successfully");
      setIsCreateDialogOpen(false);
      refetch();
      createForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create concept");
    },
  });

  const updateMutation = api.concepts.update.useMutation({
    onSuccess: () => {
      toast.success("Concept updated successfully");
      setIsEditDialogOpen(false);
      setSelectedConcept(null);
      refetch();
      editForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update concept");
    },
  });

  const deleteMutation = api.concepts.delete.useMutation({
    onSuccess: () => {
      toast.success("Concept deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedConcept(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete concept");
    },
  });

  // Forms
  const createForm = useForm<ConceptFormData>();
  const editForm = useForm<ConceptFormData>();

  // Handlers
  const handleCreate = (data: ConceptFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (concept: any) => {
    setSelectedConcept(concept);
    editForm.reset({
      name: concept.name,
      slug: concept.slug,
      description: concept.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: ConceptFormData) => {
    if (!selectedConcept) return;
    updateMutation.mutate({
      id: selectedConcept.id,
      ...data,
    });
  };

  const handleDelete = (concept: any) => {
    setSelectedConcept(concept);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedConcept) return;
    deleteMutation.mutate({ id: selectedConcept.id });
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string, form: any) => {
    form.setValue("name", value);
    if (
      !form.getValues("slug") ||
      form.getValues("slug") === generateSlug(form.getValues("name"))
    ) {
      form.setValue("slug", generateSlug(value));
    }
  };

  return (
    <div className="w-full bg-surface-background dark:bg-[var(--bg-primary)]">
      <div className="w-full max-w-none">
        {/* Header Section */}
        <div className="mb-8 px-6 py-6 bg-surface-background dark:bg-[var(--bg-primary)] border-b border-ui-border dark:border-[var(--border-primary)]">
          <div className="max-w-none">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <Lightbulb className="h-8 w-8" />
                  Golden Thread Concepts
                </h1>
                <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
                  Manage conceptual themes that connect your blog posts and
                  projects
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Concept
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Concept</DialogTitle>
                      <DialogDescription>
                        Add a new conceptual theme to connect related content
                        across your platform.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={createForm.handleSubmit(handleCreate)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="create-name">Name</Label>
                        <Input
                          id="create-name"
                          placeholder="e.g., State Management"
                          {...createForm.register("name", {
                            required: "Name is required",
                            onChange: (e) =>
                              handleNameChange(e.target.value, createForm),
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-slug">Slug</Label>
                        <Input
                          id="create-slug"
                          placeholder="e.g., state-management"
                          {...createForm.register("slug", {
                            required: "Slug is required",
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-description">Description</Label>
                        <Textarea
                          id="create-description"
                          placeholder="Brief description of this concept..."
                          rows={3}
                          {...createForm.register("description")}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending
                            ? "Creating..."
                            : "Create Concept"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Concepts Overview
              </CardTitle>
              <CardDescription>
                {concepts?.length || 0} concepts defined • Connect related
                content across your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading concepts...
                </div>
              ) : !concepts || concepts.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No concepts yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first concept to start building the Golden
                    Thread connections.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Concept
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {concepts.map((concept: any) => (
                        <TableRow key={concept.id}>
                          <TableCell className="font-medium">
                            {concept.name}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {concept.slug}
                            </code>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="truncate"
                              title={concept.description || ""}
                            >
                              {concept.description || (
                                <span className="text-muted-foreground italic">
                                  No description
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {concept.blog_posts_count || 0} posts
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {concept.projects_count || 0} projects
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(
                                concept.created_at,
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(concept)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(concept)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Concept</DialogTitle>
            <DialogDescription>
              Update the concept details. Changes will affect all connected
              content.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., State Management"
                {...editForm.register("name", {
                  required: "Name is required",
                  onChange: (e) => handleNameChange(e.target.value, editForm),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                placeholder="e.g., state-management"
                {...editForm.register("slug", { required: "Slug is required" })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of this concept..."
                rows={3}
                {...editForm.register("description")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Concept"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Concept</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedConcept?.name}"? This
              will remove all connections to blog posts and projects. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Concept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
