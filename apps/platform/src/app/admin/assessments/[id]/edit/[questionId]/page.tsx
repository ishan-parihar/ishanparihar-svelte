"use client";

import { QuestionForm } from "@/components/admin/question-form";
import { api } from "@/lib/trpc-client";
import Link from "next/link";
import { ChevronLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
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
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";

// Form schema for option management
const optionFormSchema = z.object({
  option_text: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be 500 characters or less"),
  value: z.string().optional(),
  sort_order: z.number().int().min(0, "Sort order must be non-negative"),
});

type OptionFormValues = z.infer<typeof optionFormSchema>;

// Type for assessment option
type AssessmentOption = {
  id: string;
  question_id: string;
  option_text: string;
  value: any;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export default function EditQuestionPage() {
  const params = useParams();
  const assessmentId = params.id as string;
  const questionId = params.questionId as string;

  // State for dialogs
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AssessmentOption | null>(
    null,
  );

  // Queries
  const questionQuery = api.assessmentQuestions.getById.useQuery({
    id: questionId,
  });
  const optionsQuery = api.assessmentOptions.listByQuestionId.useQuery({
    questionId,
  });

  // Utils for cache invalidation
  const utils = api.useUtils();

  // Form for option management
  const optionForm = useForm<OptionFormValues>({
    resolver: zodResolver(optionFormSchema),
    defaultValues: {
      option_text: "",
      value: "",
      sort_order: 0,
    },
  });

  // Mutations for option management
  const createOptionMutation = api.assessmentOptions.create.useMutation({
    onSuccess: () => {
      toast.success("Option created successfully!");
      utils.assessmentOptions.listByQuestionId.invalidate({ questionId });
      setIsOptionDialogOpen(false);
      optionForm.reset();
    },
    onError: (error) => toast.error(`Creation failed: ${error.message}`),
  });

  const updateOptionMutation = api.assessmentOptions.update.useMutation({
    onSuccess: () => {
      toast.success("Option updated successfully!");
      utils.assessmentOptions.listByQuestionId.invalidate({ questionId });
      setIsOptionDialogOpen(false);
      optionForm.reset();
      setSelectedOption(null);
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  const deleteOptionMutation = api.assessmentOptions.delete.useMutation({
    onSuccess: () => {
      toast.success("Option deleted successfully!");
      utils.assessmentOptions.listByQuestionId.invalidate({ questionId });
      setIsDeleteDialogOpen(false);
      setSelectedOption(null);
    },
    onError: (error) => toast.error(`Deletion failed: ${error.message}`),
  });

  // Handlers
  const handleCreateOption = () => {
    setSelectedOption(null);
    optionForm.reset({
      option_text: "",
      value: "",
      sort_order: optionsQuery.data?.length || 0,
    });
    setIsOptionDialogOpen(true);
  };

  const handleEditOption = (option: AssessmentOption) => {
    setSelectedOption(option);
    optionForm.reset({
      option_text: option.option_text,
      value: option.value ? JSON.stringify(option.value) : "",
      sort_order: option.sort_order,
    });
    setIsOptionDialogOpen(true);
  };

  const handleDeleteOption = (option: AssessmentOption) => {
    setSelectedOption(option);
    setIsDeleteDialogOpen(true);
  };

  const onSubmitOption = (data: OptionFormValues) => {
    if (selectedOption) {
      updateOptionMutation.mutate({ id: selectedOption.id, ...data });
    } else {
      createOptionMutation.mutate({ question_id: questionId, ...data });
    }
  };

  const confirmDelete = () => {
    if (selectedOption) {
      deleteOptionMutation.mutate({ id: selectedOption.id });
    }
  };

  // DataTable columns for options
  const optionColumns: ColumnDef<AssessmentOption>[] = [
    {
      accessorKey: "sort_order",
      header: "Order",
      cell: ({ row }) => (
        <div className="w-16">{row.getValue("sort_order")}</div>
      ),
    },
    {
      accessorKey: "option_text",
      header: "Option Text",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value");
        return (
          <div className="max-w-xs truncate font-mono text-sm">
            {value ? JSON.stringify(value) : "—"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const option = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditOption(option)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteOption(option)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (questionQuery.isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Loading question details...</p>
      </div>
    );
  }

  if (questionQuery.error) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/assessments/${assessmentId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold ml-2">Edit Question</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Question Form */}
        <div className="max-w-2xl">
          {questionQuery.data && (
            <QuestionForm
              assessmentId={assessmentId}
              initialData={questionQuery.data}
            />
          )}
        </div>

        {/* Answer Options - Only show for multiple_choice questions */}
        {questionQuery.data?.question_type === "multiple_choice" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Answer Options</CardTitle>
                  <CardDescription>
                    Manage the available answer options for this multiple choice
                    question.
                  </CardDescription>
                </div>
                <Button onClick={handleCreateOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {optionsQuery.isLoading ? (
                <p>Loading options...</p>
              ) : optionsQuery.error ? (
                <p>Error: {optionsQuery.error.message}</p>
              ) : (
                <DataTable
                  columns={optionColumns}
                  data={optionsQuery.data ?? []}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Option Create/Edit Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOption ? "Edit Option" : "Create Option"}
            </DialogTitle>
            <DialogDescription>
              {selectedOption
                ? "Update the option details below."
                : "Add a new answer option for this question."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={optionForm.handleSubmit(onSubmitOption)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="option_text">Option Text</Label>
              <Input
                id="option_text"
                {...optionForm.register("option_text")}
                placeholder="Enter the option text"
              />
              {optionForm.formState.errors.option_text && (
                <p className="text-sm text-red-500 mt-1">
                  {optionForm.formState.errors.option_text.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="value">Value (JSON)</Label>
              <Textarea
                id="value"
                {...optionForm.register("value")}
                placeholder='{"score": 5, "trait": "openness"}'
                rows={3}
              />
              {optionForm.formState.errors.value && (
                <p className="text-sm text-red-500 mt-1">
                  {optionForm.formState.errors.value.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...optionForm.register("sort_order", { valueAsNumber: true })}
                min="0"
              />
              {optionForm.formState.errors.sort_order && (
                <p className="text-sm text-red-500 mt-1">
                  {optionForm.formState.errors.sort_order.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOptionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createOptionMutation.isPending ||
                  updateOptionMutation.isPending
                }
              >
                {selectedOption ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Option</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this option? This action cannot be
              undone.
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
              disabled={deleteOptionMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
