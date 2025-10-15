"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Form schema that matches the tRPC router schema
const serviceCategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  icon: z.string().max(100, "Icon must be 100 characters or less").optional(),
  color: z.string().max(7, "Color must be a valid hex color").optional(),
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be a positive integer")
    .optional(),
  active: z.boolean().optional(),
});

type ServiceCategoryFormValues = z.infer<typeof serviceCategoryFormSchema>;
// Define the ServiceCategory type based on the database structure
interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ServiceCategoryFormProps {
  initialData?: ServiceCategory | null;
  onSuccess?: () => void;
}

export function ServiceCategoryForm({
  initialData,
  onSuccess,
}: ServiceCategoryFormProps) {
  const form = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(serviceCategoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
      color: initialData?.color || "",
      sort_order: initialData?.sort_order || 0,
      active: initialData?.active ?? true,
    },
  });

  const utils = api.useUtils();

  const createMutation = api.serviceCategories.create.useMutation({
    onSuccess: () => {
      toast.success("Service category created successfully!");
      utils.serviceCategories.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(`Creation failed: ${error.message}`),
  });

  const updateMutation = api.serviceCategories.update.useMutation({
    onSuccess: () => {
      toast.success("Service category updated successfully!");
      utils.serviceCategories.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  function onSubmit(data: ServiceCategoryFormValues) {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="web-development" {...field} />
              </FormControl>
              <FormDescription>
                Used in URLs. Must be unique and lowercase with hyphens.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of this service category..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Input placeholder="💻" {...field} />
                </FormControl>
                <FormDescription>Optional icon or emoji</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="#3B82F6" {...field} />
                </FormControl>
                <FormDescription>Hex color code</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormDescription>Lower numbers appear first</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active Category</FormLabel>
                <FormDescription>
                  Active categories are visible to users and can be assigned to
                  services.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
