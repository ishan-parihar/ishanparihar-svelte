"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Define the Service type based on the database structure
interface Service {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  cover_image: string | null;
  category_id: string | null;
  service_type: string;
  base_price: number | null;
  currency: string;
  pricing_type: string;
  billing_period: string | null;
  available: boolean;
  featured: boolean;
  premium: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function AdminServicesPage() {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(
    null,
  );

  const utils = api.useUtils();
  const servicesQuery = api.services.getServicesAdmin.useQuery({
    includeUnpublished: true,
  });

  const deleteServiceMutation = api.services.deleteServiceAdmin.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully!");
      utils.services.getServicesAdmin.invalidate();
      setIsDeleteOpen(false);
      setSelectedService(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete service: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (selectedService) {
      deleteServiceMutation.mutate({ id: selectedService.id });
    }
  };

  const columns: ColumnDef<Service>[] = [
    // Using `id` from the select procedure as accessorKey
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => <div>{row.original.category?.name ?? "N/A"}</div>,
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("published") ? "default" : "secondary"}>
          {row.getValue("published") ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "pricing_type",
      header: "Pricing Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("pricing_type")}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const service = row.original;
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
              <DropdownMenuItem asChild>
                <Link href={`/admin/services/edit/${service.slug}`}>
                  Edit Service
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedService(service);
                  setIsDeleteOpen(true);
                }}
              >
                Delete Service
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
          <h1 className="text-3xl font-bold">Manage Services</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your service offerings and business solutions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Service
          </Link>
        </Button>
      </div>
      {servicesQuery.isLoading ? (
        <p>Loading services...</p>
      ) : servicesQuery.error ? (
        <p>Error: {servicesQuery.error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={servicesQuery.data?.services ?? []}
        />
      )}

      {/* Dialog for Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              service "{selectedService?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
