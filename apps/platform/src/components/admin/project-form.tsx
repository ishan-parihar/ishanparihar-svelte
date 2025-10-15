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

// Re-create the schema here to be used by the form.
// This should exactly match the corrected schema in the tRPC router.
const projectFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  cover_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  source_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  live_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;
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

interface ProjectFormProps {
  initialData?: Project | null;
  onSuccess?: () => void;
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      excerpt: initialData?.excerpt ?? "",
      cover_image_url: initialData?.cover_image_url ?? "",
      source_url: initialData?.source_url ?? "",
      live_url: initialData?.live_url ?? "",
      tags: initialData?.tags ?? [],
      is_featured: initialData?.is_featured ?? false,
    },
  });

  const utils = api.useUtils();

  const createMutation = api.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      utils.projects.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(`Creation failed: ${error.message}`),
  });

  const updateMutation = api.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      utils.projects.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  function onSubmit(data: ProjectFormValues) {
    // Handle tags as a string before submitting if necessary, or ensure backend accepts array.
    // Assuming backend handles the array correctly.

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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Project Phoenix" {...field} />
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
                <Input placeholder="project-phoenix" {...field} />
              </FormControl>
              <FormDescription>
                Used in the URL. Must be unique.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short summary of the project..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="react,typescript,nextjs"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((tag) => tag.trim()),
                    )
                  }
                  value={
                    Array.isArray(field.value) ? field.value.join(",") : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Feature this project?</FormLabel>
                <FormDescription>
                  Featured projects may be displayed prominently on the
                  homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}
