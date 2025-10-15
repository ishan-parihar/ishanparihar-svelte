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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Form schema that matches the assessment_questions table structure
const questionFormSchema = z.object({
  question_text: z
    .string()
    .min(1, "Question text is required")
    .max(1000, "Question text must be 1000 characters or less"),
  question_type: z.string().min(1, "Question type is required"),
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be a non-negative integer"),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

// Define the Question type based on the database structure
interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface QuestionFormProps {
  assessmentId: string;
  initialData?: Question | null;
  onSuccess?: () => void;
}

// Static options for question types
const questionTypeOptions = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "slider", label: "Slider" },
];

export function QuestionForm({
  assessmentId,
  initialData,
  onSuccess,
}: QuestionFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question_text: initialData?.question_text || "",
      question_type: initialData?.question_type || "multiple_choice",
      sort_order: initialData?.sort_order || 0,
    },
  });

  const utils = api.useUtils();

  const createMutation = api.assessmentQuestions.create.useMutation({
    onSuccess: () => {
      toast.success("Question created successfully!");
      utils.assessmentQuestions.listByAssessmentId.invalidate({ assessmentId });
      onSuccess?.();
    },
    onError: (error) => toast.error(`Creation failed: ${error.message}`),
  });

  const updateMutation = api.assessmentQuestions.update.useMutation({
    onSuccess: () => {
      toast.success("Question updated successfully!");
      utils.assessmentQuestions.listByAssessmentId.invalidate({ assessmentId });
      onSuccess?.();
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  function onSubmit(data: QuestionFormValues) {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...data });
    } else {
      createMutation.mutate({ assessment_id: assessmentId, ...data });
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your question here..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The main text of the question that users will see.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="question_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {questionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how users will answer this question.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormDescription>
                The order in which this question appears in the assessment (0 =
                first).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Question"}
        </Button>
      </form>
    </Form>
  );
}
