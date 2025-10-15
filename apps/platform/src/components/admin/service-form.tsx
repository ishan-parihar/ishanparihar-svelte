"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// This schema is based on the `products_services` Insert type.
// It should be kept in sync with any backend Zod schemas for service creation.
const serviceFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be 200 characters or less."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens."),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters.")
    .max(500, "Excerpt must be 500 characters or less."),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters."),
  categoryId: z.string().uuid("Please select a valid category.").optional(),
  serviceType: z.enum(["product", "service", "course", "consultation"]),
  pricingType: z.enum(["one_time", "recurring", "custom"]),
  basePrice: z.coerce.number().min(0).optional(),
  currency: z.enum(["USD", "EUR", "GBP", "INR"]),
  published: z.boolean(),
  featured: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    description?: string | null;
    category_id?: string | null;
    service_type: "product" | "service" | "course" | "consultation";
    pricing_type: "one_time" | "recurring" | "custom";
    base_price?: number | null;
    currency?: string;
    published: boolean;
    featured: boolean;
  } | null;
}

export function ServiceForm({ initialData }: ServiceFormProps = {}) {
  const router = useRouter();
  const categoriesQuery = api.serviceCategories.list.useQuery();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      description: initialData?.description || "",
      categoryId: initialData?.category_id || undefined,
      serviceType: initialData?.service_type || "consultation",
      pricingType: initialData?.pricing_type || "one_time",
      basePrice: initialData?.base_price || undefined,
      currency:
        (initialData?.currency as "USD" | "EUR" | "GBP" | "INR") || "USD",
      published: initialData?.published ?? false,
      featured: initialData?.featured ?? false,
    },
  });

  const utils = api.useUtils();
  const createMutation = api.services.createService.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully!");
      utils.services.getServicesAdmin.invalidate();
      router.push("/admin/services");
    },
    onError: (error) => toast.error(`Creation failed: ${error.message}`),
  });

  const updateMutation = api.services.updateService.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully!");
      utils.services.getServicesAdmin.invalidate();
      router.push("/admin/services");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  function onSubmit(data: ServiceFormValues) {
    if (initialData) {
      // Map form data to updateService mutation format
      updateMutation.mutate({
        id: initialData.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        description: data.description,
        categoryId: data.categoryId,
        serviceType: data.serviceType,
        pricingType: data.pricingType,
        basePrice: data.basePrice,
        currency: data.currency,
        published: data.published,
        featured: data.featured,
      });
    } else {
      createMutation.mutate(data);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Consciousness Coaching" {...field} />
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
                <Input placeholder="e.g., consciousness-coaching" {...field} />
              </FormControl>
              <FormDescription>
                This is the URL-friendly version of the title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesQuery.data?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="A brief, one-sentence summary of the service."
                  {...field}
                />
              </FormControl>
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
                  placeholder="Detailed description of the service."
                  {...field}
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="one_time">One-Time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish</FormLabel>
                <FormDescription>
                  Make this service visible to the public.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Service"}
        </Button>
      </form>
    </Form>
  );
}
