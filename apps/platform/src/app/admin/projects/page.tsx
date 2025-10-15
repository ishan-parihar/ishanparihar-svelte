"use client";

import * as React from "react";
import { api } from "@/lib/trpc-client";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectForm } from "@/components/admin/project-form";

// Define the Project type based on the database structure
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  cover_image_url?: string;
  source_url?: string;
  live_url?: string;
  tags?: string[];
  is_featured?: boolean;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  concepts?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// Placeholder for the form component we will create later if needed, or implement inline
// For now, we'll build the main structure. We assume a ProjectForm component will be created.
// For simplicity in this step, we will use a simplified dialog.

export default function AdminProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null,
  );

  const utils = api.useUtils();
  const projectsQuery = api.projects.list.useQuery();
  // const createProjectMutation = api.projects.create.useMutation();
  // const updateProjectMutation = api.projects.update.useMutation();
  const deleteProjectMutation = api.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      utils.projects.list.invalidate();
      setIsDeleteOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (selectedProject) {
      deleteProjectMutation.mutate({ id: selectedProject.id });
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) => (row.getValue("is_featured") ? "Yes" : "No"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProject(project);
                  setIsDialogOpen(true);
                }}
              >
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedProject(project);
                  setIsDeleteOpen(true);
                }}
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Projects</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your portfolio projects and showcase your work
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProject(null);
            setIsDialogOpen(true);
          }}
        >
          Create Project
        </Button>
      </div>
      {projectsQuery.isLoading ? (
        <p>Loading projects...</p>
      ) : projectsQuery.error ? (
        <p>Error: {projectsQuery.error.message}</p>
      ) : (
        <DataTable columns={columns} data={projectsQuery.data ?? []} />
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            initialData={selectedProject}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              project "{selectedProject?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
