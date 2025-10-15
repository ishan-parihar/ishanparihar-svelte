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
const assessmentFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be 255 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  is_published: z.boolean().optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

// Define the Assessment type based on the database structure
interface Assessment {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

interface AssessmentFormProps {
  initialData?: Assessment | null;
  onSuccess?: () => void;
}

export function AssessmentForm({
  initialData,
  onSuccess,
}: AssessmentFormProps) {
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      is_published: initialData?.is_published ?? false,
    },
  });

  const utils = api.useUtils();

  const createMutation = api.assessments.create.useMutation({
    onSuccess: () => {
      toast.success("Assessment created successfully!");
      utils.assessments.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(`Creation failed: ${error.message}`),
  });

  const updateMutation = api.assessments.update.useMutation({
    onSuccess: () => {
      toast.success("Assessment updated successfully!");
      utils.assessments.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  function onSubmit(data: AssessmentFormValues) {
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
                <Input placeholder="Big Five Personality Test" {...field} />
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
                <Input placeholder="big-five-personality" {...field} />
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
                  placeholder="A comprehensive personality assessment based on the Five-Factor Model..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description of the assessment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Published</FormLabel>
                <FormDescription>
                  Published assessments are visible to users and can be taken.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Assessment"}
        </Button>
      </form>
    </Form>
  );
}
