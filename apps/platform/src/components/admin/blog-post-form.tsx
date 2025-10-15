"use client";

// Import admin form overrides CSS
import "./admin-form-overrides.css";

// Enable detailed logging for debugging form submission issues
const DEBUG_FORM = true;

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, User, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import { CoverImageManager } from "@/components/admin/image-manager/cover-image-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuthorsWithHelpers } from "@/queries/adminQueries";
import { Badge } from "@/components/ui/badge";

// Enhanced Recommendation Tags Input Component with Category Integration
interface RecommendationTagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableCategories: string[];
  onNewTagAdded: (tag: string) => void;
}

function RecommendationTagsInput({
  value,
  onChange,
  availableCategories,
  onNewTagAdded,
}: RecommendationTagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter categories that aren't already selected and match the input
  const suggestions = availableCategories.filter(
    (category) =>
      !value.includes(category) &&
      category.toLowerCase().includes(inputValue.toLowerCase()) &&
      inputValue.trim() !== "",
  );

  const addTag = (tagToAdd?: string) => {
    const trimmedValue = (tagToAdd || inputValue).trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);

      // If this is a new tag (not in existing categories), add it to categories
      if (!availableCategories.includes(trimmedValue)) {
        onNewTagAdded(trimmedValue);
      }

      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.trim() !== "");
  };

  const addFromCategory = (category: string) => {
    addTag(category);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.trim() !== "")}
              placeholder="Enter a recommendation tag or select from categories..."
              className="rounded-none"
            />

            {/* Category Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-none shadow-md max-h-40 overflow-y-auto">
                <div className="p-2 text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black">
                  Existing categories:
                </div>
                {suggestions.map((category, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addFromCategory(category)}
                    className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900 focus:outline-none transition-colors rounded-none"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={() => addTag()}
            variant="outline"
            size="sm"
            className="rounded-none"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Quick Add from Categories */}
      {availableCategories.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Quick add from existing categories:
          </div>
          <div className="flex flex-wrap gap-1">
            {availableCategories
              .filter((cat) => !value.includes(cat))
              .slice(0, 6)
              .map((category, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFromCategory(category)}
                  className="text-xs h-6 px-2 rounded-none"
                >
                  + {category}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Selected recommendation tags:
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="rounded-none flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Dynamically import the MDXEditor component to ensure it only loads on the client
const MDXEditorWrapper = dynamic(
  () => import("@/components/admin/DynamicEditor"),
  {
    loading: () => (
      <div className="flex justify-center items-center min-h-[500px] bg-muted/20">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    ),
    ssr: false, // Disable SSR for the editor component
  },
);

// Define the schema for blog post
const blogPostSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(60, { message: "Title must be 60 characters or less" }),
  excerpt: z
    .string()
    .min(10, { message: "Excerpt must be at least 10 characters" })
    .max(160, { message: "Excerpt must be 160 characters or less" }),
  cover_image: z.string().url({ message: "Must be a valid URL" }).optional(),
  category: z.string().min(1, { message: "Category is required" }),
  featured: z.boolean(),
  author_user_id: z.string().min(1, { message: "Author is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  content: z
    .string()
    .min(50, { message: "Content must be at least 50 characters" }),
  draft: z.boolean(),
  premium: z.boolean(),
  content_type: z.enum(["blog", "research_paper"]),
  recommendation_tags: z.array(z.string()),
  concept_ids: z.array(z.string()),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  initialData?: Partial<BlogPostFormData> & {
    // Support both field names for backward compatibility
    coverImage?: string;
    id?: string; // Add blog post ID for concept linking
  };
  onSubmit: (data: BlogPostFormData) => void;
  categories: string[];
}

// Import centralized slug generation utility
import { generateSEOSlug } from "@/lib/slug-utils";
import { api } from "@/lib/trpc-client";
import { Checkbox } from "@/components/ui/checkbox";

export function BlogPostForm({
  initialData,
  onSubmit,
  categories,
}: BlogPostFormProps) {
  const [newCategory, setNewCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    categories.filter((c) => c !== "All Categories"),
  );

  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const editorRef = useRef<any>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string>("");
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [excerptCharCount, setExcerptCharCount] = useState(0);
  const [originalSlug, setOriginalSlug] = useState<string>("");

  // Use React Query hook to fetch authors
  const {
    data: authors = [],
    isLoading: isLoadingAuthors,
    error: authorError,
  } = useAdminAuthorsWithHelpers();

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      cover_image: initialData?.cover_image || initialData?.coverImage || "",
      category: initialData?.category || availableCategories[0] || "",
      featured: initialData?.featured || false,
      author_user_id: initialData?.author_user_id || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      content: initialData?.content || "",
      draft: initialData?.draft ?? true,
      premium: initialData?.premium || false,
      content_type: initialData?.content_type || "blog",
      recommendation_tags: initialData?.recommendation_tags || [],
      concept_ids: initialData?.concept_ids || [],
    },
  });

  // Fetch all concepts - simple and reliable
  const { data: concepts, isLoading: conceptsLoading } =
    api.concepts.list.useQuery();

  // Initialize character counts and slug
  useEffect(() => {
    const title = form.getValues("title");
    const excerpt = form.getValues("excerpt");

    setTitleCharCount(title.length);
    setExcerptCharCount(excerpt.length);

    if (title) {
      const newSlug = generateSEOSlug(title);
      setGeneratedSlug(newSlug);

      // Set original slug for edit mode (only once)
      if (initialData?.title && !originalSlug) {
        setOriginalSlug(generateSEOSlug(initialData.title));
      }
    }
  }, [form, initialData, originalSlug]);

  useEffect(() => {
    // Make sure we have the cover image from initialData
    const coverImageValue = initialData?.cover_image || initialData?.coverImage;
    if (coverImageValue && !form.getValues("cover_image")) {
      form.setValue("cover_image", coverImageValue, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    }

    // Set the initial image preview URL if available
    const coverImage = form.getValues("cover_image");
    if (coverImage) {
      setImagePreviewUrl(coverImage);
    }
  }, [initialData, form]);

  // Set default author when authors are loaded and no author is selected
  useEffect(() => {
    if (
      authors.length > 0 &&
      !form.getValues("author_user_id") &&
      !initialData?.author_user_id
    ) {
      // Default to the first available author for new posts
      form.setValue("author_user_id", authors[0].id, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  }, [authors, form, initialData]);

  const coverImage = form.watch("cover_image");
  const title = form.watch("title");
  const excerpt = form.watch("excerpt");

  // Update character counts and slug when title/excerpt changes
  useEffect(() => {
    setTitleCharCount(title.length);
    if (title) {
      setGeneratedSlug(generateSEOSlug(title));
    }
  }, [title]);

  useEffect(() => {
    setExcerptCharCount(excerpt.length);
  }, [excerpt]);

  // Ensure imagePreviewUrl stays in sync with coverImage
  useEffect(() => {
    if (coverImage && coverImage !== imagePreviewUrl) {
      console.log("🖼️ Syncing image preview URL:", coverImage);
      setImagePreviewUrl(coverImage);
    } else if (!coverImage && imagePreviewUrl) {
      // Clear the preview if the cover image field is cleared
      console.log("🖼️ Clearing image preview URL");
      setImagePreviewUrl(null);
    }
  }, [coverImage, imagePreviewUrl]);

  // Handle content changes from MDXEditor
  const handleEditorChange = (markdown: string) => {
    form.setValue("content", markdown, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  // Handle new category addition
  const handleAddCategory = () => {
    if (
      newCategory.trim() &&
      !availableCategories.includes(newCategory.trim())
    ) {
      const updatedCategories = [...availableCategories, newCategory.trim()];
      setAvailableCategories(updatedCategories);
      form.setValue("category", newCategory.trim());
      setNewCategory("");
      setShowCategoryInput(false);
    }
  };

  // Handle new recommendation tag that should also become a category
  const handleNewRecommendationTag = (tag: string) => {
    if (tag.trim() && !availableCategories.includes(tag.trim())) {
      const updatedCategories = [...availableCategories, tag.trim()];
      setAvailableCategories(updatedCategories);
    }
  };

  const handleFormSubmit = (data: BlogPostFormData) => {
    console.log(
      "🚀🚀🚀 SUBMITTING BLOG POST DATA:",
      JSON.stringify(data, null, 2),
    );
    console.log("🚀🚀🚀 AUTHOR_USER_ID being submitted:", data.author_user_id);
    console.log("🚀🚀🚀 FORM STATE:", {
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      isValid: form.formState.isValid,
      errors: form.formState.errors,
    });

    if (DEBUG_FORM) {
      console.log("🔍 Form validation state:", {
        isValid: form.formState.isValid,
        errors: form.formState.errors,
      });

      if (Object.keys(form.formState.errors).length > 0) {
        console.error("❌ Form has validation errors:", form.formState.errors);
        return; // Don't proceed if there are validation errors
      }
    }

    // Additional validation for author
    if (!data.author_user_id) {
      console.error("❌❌❌ No author selected");
      form.setError("author_user_id", {
        type: "manual",
        message: "Please select an author",
      });
      return; // Don't proceed if no author is selected
    }

    // Validate that the selected author exists in the authors list
    const selectedAuthor = authors.find(
      (author) => author.id === data.author_user_id,
    );
    if (!selectedAuthor) {
      console.error("❌❌❌ Selected author not found in authors list");
      form.setError("author_user_id", {
        type: "manual",
        message:
          "Selected author is invalid. Please choose a different author.",
      });
      return; // Don't proceed if author is invalid
    }

    // Format data to ensure proper image handling
    const formattedData = {
      ...data,
      // Ensure date is in ISO format (YYYY-MM-DD)
      date: data.date || new Date().toISOString().split("T")[0],
      // Use author_user_id for the database
      author_user_id: data.author_user_id,
      // Include author display name (required by database NOT NULL constraint)
      author:
        authors.find((author) => author.id === data.author_user_id)
          ?.display_name || "Anonymous",
    };

    console.log(
      "📦📦📦 FORMATTED DATA FOR SUBMISSION:",
      JSON.stringify(formattedData, null, 2),
    );

    // If we have a bucket path stored for this image, include it
    try {
      const storedPaths = JSON.parse(
        localStorage.getItem("image_bucket_paths") || "{}",
      );
      if (data.cover_image && storedPaths[data.cover_image]) {
        // Store the bucket path directly - this helps with creating more efficient database entries
        formattedData.cover_image = storedPaths[data.cover_image];
        console.log(
          "📦📦📦 Using stored bucket path for image:",
          formattedData.cover_image,
        );
      }
    } catch (err) {
      console.error("Error getting bucket path from localStorage:", err);
    }

    // Log the final data being sent to the parent component
    console.log(
      "📤📤📤 FINAL DATA BEING SENT TO PARENT:",
      JSON.stringify(formattedData, null, 2),
    );

    try {
      onSubmit(formattedData);
      console.log("✅✅✅ Form submission handler called successfully");
    } catch (error) {
      console.error("❌❌❌ Error in form submission handler:", error);
    }
  };

  return (
    <div className="space-y-8 w-full admin-form">
      <Card className="shadow-md rounded-none border border-neutral-200 dark:border-neutral-800">
        <CardHeader className="bg-neutral-100 dark:bg-neutral-900 rounded-none">
          <CardTitle className="text-2xl font-heading">
            {initialData?.title ? "Edit Blog Post" : "Create New Blog Post"}
          </CardTitle>
          <CardDescription>
            {initialData?.title
              ? "Update your existing blog post"
              : "Create a new blog post"}
            . Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              {/* Two-column layout for Content Fields and Media & Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Content Fields */}
                <div className="space-y-6">
                  <h3 className="text-lg font-subheading font-semibold border-b pb-2 dark:border-neutral-800">
                    Content Fields
                  </h3>

                  {/* Title Field */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium flex justify-between items-center">
                          <span>Title*</span>
                          <span
                            className={`text-sm ${titleCharCount > 60 ? "text-red-500" : titleCharCount > 50 ? "text-yellow-500" : "text-muted-foreground"}`}
                          >
                            {titleCharCount}/60
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter blog post title"
                            {...field}
                            className="text-lg rounded-none"
                            maxLength={60}
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-muted-foreground">
                          Keep titles concise for better SEO. Generated slug:{" "}
                          <code className="text-xs bg-muted px-1 py-0.5 rounded-none">
                            {generatedSlug || "will-appear-here"}
                          </code>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Excerpt Field */}
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium flex justify-between items-center">
                          <span>Excerpt*</span>
                          <span
                            className={`text-sm ${excerptCharCount > 160 ? "text-red-500" : excerptCharCount > 140 ? "text-yellow-500" : "text-muted-foreground"}`}
                          >
                            {excerptCharCount}/160
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief summary of your post (shown in listings and search results)"
                            className="resize-none h-[100px] rounded-none"
                            {...field}
                            maxLength={160}
                          />
                        </FormControl>
                        <FormDescription>
                          Short summary that appears in blog listings and search
                          results. Optimal length is 120-160 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Metadata Section */}
                  <div className="space-y-4 pt-4">
                    <h4 className="font-medium text-base border-b pb-2 dark:border-neutral-800">
                      Metadata
                    </h4>

                    {/* Category Field */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Category*
                          </FormLabel>
                          <div className="space-y-2">
                            {showCategoryInput ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={newCategory}
                                  onChange={(e) =>
                                    setNewCategory(e.target.value)
                                  }
                                  placeholder="New category name"
                                  className="flex-1 rounded-none"
                                  autoFocus
                                />
                                <Button
                                  type="button"
                                  onClick={handleAddCategory}
                                  size="sm"
                                  className="px-2 rounded-none"
                                >
                                  Add
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => setShowCategoryInput(false)}
                                  size="sm"
                                  className="px-2 rounded-none"
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2 items-center">
                                <Select
                                  value={field.value}
                                  onValueChange={(value) =>
                                    form.setValue("category", value)
                                  }
                                >
                                  <SelectTrigger className="w-full bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 transition-all">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {availableCategories.map((category) => (
                                      <SelectItem
                                        key={category}
                                        value={category}
                                        className="bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:outline-none rounded-none text-sm cursor-pointer px-3 py-2"
                                      >
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowCategoryInput(true)}
                                  size="sm"
                                  className="whitespace-nowrap rounded-none"
                                >
                                  <PlusCircle size={16} className="mr-1" /> New
                                </Button>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Recommendation Tags Field - Related to Categories */}
                    <FormField
                      control={form.control}
                      name="recommendation_tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Recommendation Tags
                          </FormLabel>
                          <FormControl>
                            <RecommendationTagsInput
                              value={field.value}
                              onChange={field.onChange}
                              availableCategories={availableCategories}
                              onNewTagAdded={handleNewRecommendationTag}
                            />
                          </FormControl>
                          <FormDescription>
                            Add tags to improve content recommendations. You can
                            select from existing categories or create new ones.
                            New tags will also become available as categories.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Golden Thread Concepts Field */}
                    <FormField
                      control={form.control}
                      name="concept_ids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <span className="text-amber-600 dark:text-amber-400">
                              ✨
                            </span>
                            Golden Thread Concepts
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {conceptsLoading ? (
                                <div className="text-sm text-muted-foreground">
                                  Loading concepts...
                                </div>
                              ) : !concepts || concepts.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                  No concepts available. Create concepts in the
                                  admin panel first.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {concepts.map((concept: any) => (
                                    <div
                                      key={concept.id}
                                      className="flex items-start space-x-2 p-2 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                    >
                                      <Checkbox
                                        id={`concept-${concept.id}`}
                                        checked={field.value.includes(
                                          concept.id,
                                        )}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([
                                              ...field.value,
                                              concept.id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              field.value.filter(
                                                (id: string) =>
                                                  id !== concept.id,
                                              ),
                                            );
                                          }
                                        }}
                                        className="mt-0.5"
                                      />
                                      <div className="flex-1">
                                        <label
                                          htmlFor={`concept-${concept.id}`}
                                          className="text-sm font-medium leading-none cursor-pointer block"
                                        >
                                          {concept.name}
                                        </label>
                                        {concept.description && (
                                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {concept.description}
                                          </p>
                                        )}
                                        {concept.total_usage > 0 && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Used in {concept.blog_posts_count}{" "}
                                            blog posts, {concept.projects_count}{" "}
                                            projects
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Select conceptual themes that connect this blog post
                            to related projects and content. This creates the
                            "Golden Thread" that weaves through your portfolio.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Author Field */}
                    <FormField
                      control={form.control}
                      name="author_user_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Author*
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isLoadingAuthors}
                            >
                              <SelectTrigger className="w-full bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 transition-all">
                                <SelectValue placeholder="Select an author" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {authorError ? (
                                  <div className="p-2 text-red-500 text-sm bg-white dark:bg-black">
                                    {authorError instanceof Error
                                      ? authorError.message
                                      : "Failed to fetch authors"}
                                  </div>
                                ) : isLoadingAuthors ? (
                                  <div className="p-2 text-center bg-white dark:bg-black">
                                    Loading authors...
                                  </div>
                                ) : authors.length === 0 ? (
                                  <div className="p-2 text-center bg-white dark:bg-black">
                                    No authors available
                                  </div>
                                ) : (
                                  authors.map((author) => (
                                    <SelectItem
                                      key={author.id}
                                      value={author.id}
                                      className="bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:outline-none rounded-none text-sm cursor-pointer px-3 py-2"
                                    >
                                      <div className="flex items-center">
                                        {author.profile_picture_url ? (
                                          <Image
                                            src={author.profile_picture_url}
                                            alt={author.display_name}
                                            width={20}
                                            height={20}
                                            className="rounded-full mr-2"
                                          />
                                        ) : (
                                          <User className="h-4 w-4 mr-2" />
                                        )}
                                        {author.display_name}
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date Field */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Publish Date*
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="rounded-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* URL Preview Section */}
                    {generatedSlug && (
                      <div className="space-y-2">
                        <FormLabel className="text-base font-medium">
                          Blog URL Preview
                        </FormLabel>
                        <div className="p-3 bg-muted/50 rounded-none border dark:border-neutral-800">
                          <p className="text-sm text-muted-foreground mb-1">
                            Your blog post will be available at:
                          </p>
                          <code className="text-sm bg-background px-2 py-1 rounded-none border break-all">
                            {typeof window !== "undefined"
                              ? window.location.origin
                              : "https://yoursite.com"}
                            /blog/{generatedSlug}
                          </code>

                          {/* Show warning if slug will change in edit mode */}
                          {originalSlug && generatedSlug !== originalSlug && (
                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-none">
                              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                                ⚠️ URL will change
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Current:{" "}
                                <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded-none">
                                  /blog/{originalSlug}
                                </code>
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                New:{" "}
                                <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded-none">
                                  /blog/{generatedSlug}
                                </code>
                              </p>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                The old URL will no longer work after saving.
                              </p>
                            </div>
                          )}

                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>
                              ✓ SEO optimized: 3-5 keywords, stop words removed
                            </p>
                            <p>
                              ✓ Short and descriptive for better search rankings
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Media & Settings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-subheading font-semibold border-b pb-2 dark:border-neutral-800">
                    Media & Settings
                  </h3>

                  {/* Cover Image Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-base">Cover Image</h4>

                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Featured Image{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          (3:2 aspect ratio)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="border rounded-none p-4 dark:border-neutral-800">
                          <CoverImageManager
                            imageUrl={imagePreviewUrl}
                            onChange={(url) => {
                              console.log(
                                "🖼️ CoverImageManager onChange called with URL:",
                                url,
                              );

                              // Update the form with the new image URL
                              form.setValue("cover_image", url || "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });

                              // Update the preview
                              setImagePreviewUrl(url);

                              // Store the bucket path in localStorage for future use if available
                              if (url) {
                                try {
                                  const storedPaths = JSON.parse(
                                    localStorage.getItem(
                                      "image_bucket_paths",
                                    ) || "{}",
                                  );
                                  // Note: The bucket path would be set by the ImageUploadForm or ImageGallery
                                  // We're just ensuring the localStorage is updated if needed
                                  if (storedPaths[url]) {
                                    localStorage.setItem(
                                      "image_bucket_paths",
                                      JSON.stringify(storedPaths),
                                    );
                                  }
                                } catch (err) {
                                  console.error(
                                    "Error handling image path in localStorage:",
                                    err,
                                  );
                                }
                              }
                            }}
                            aspectRatio={3 / 2}
                            recommendedAspectRatio="3:2"
                            recommendedMinWidth={1200}
                            recommendedMinHeight={800}
                          />
                        </div>
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.cover_image?.message}
                      </FormMessage>
                    </FormItem>
                  </div>

                  {/* Publishing Options Section */}
                  <div className="space-y-4 pt-4">
                    <h4 className="font-medium text-base border-b pb-2 dark:border-neutral-800">
                      Publishing Options
                    </h4>

                    {/* Featured Post Toggle */}
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-none border p-3 shadow-sm dark:border-neutral-800">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Featured Post
                            </FormLabel>
                            <FormDescription>
                              Mark as featured on homepage
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Draft Status Toggle */}
                    <FormField
                      control={form.control}
                      name="draft"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-none border p-3 shadow-sm dark:border-neutral-800">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Draft Status
                            </FormLabel>
                            <FormDescription>
                              Hide from public website
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Premium Content Toggle */}
                    <FormField
                      control={form.control}
                      name="premium"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-none border p-3 shadow-sm dark:border-neutral-800">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Premium Content
                            </FormLabel>
                            <FormDescription>
                              Requires membership
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Content Type Selection */}
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Content Type*
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 transition-all">
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                              <SelectItem
                                value="blog"
                                className="bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:outline-none rounded-none text-sm cursor-pointer px-3 py-2"
                              >
                                Blog Post
                              </SelectItem>
                              <SelectItem
                                value="research_paper"
                                className="bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:outline-none rounded-none text-sm cursor-pointer px-3 py-2"
                              >
                                Research Paper
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the type of content to display appropriate
                            styling and badges
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-subheading font-semibold border-b pb-2 dark:border-neutral-800">
                  Post Content
                </h3>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-base font-medium">
                        Content*
                      </FormLabel>
                      <FormControl>
                        <div className="border rounded-none dark:border-neutral-800 w-full">
                          <MDXEditorWrapper
                            markdown={field.value}
                            onChange={handleEditorChange}
                            initialContent={initialData?.content}
                            editorRef={editorRef}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Write your blog post content using Markdown or the
                        toolbar formatting options.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="rounded-none px-6"
                >
                  {form.formState.isSubmitting
                    ? "Saving..."
                    : initialData?.title
                      ? "Update Post"
                      : "Create Post"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
