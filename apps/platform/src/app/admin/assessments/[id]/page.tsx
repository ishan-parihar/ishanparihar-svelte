"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/trpc-client";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { QuestionForm } from "@/components/admin/question-form";

// Define the type for a question
interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const assessmentId = params.id as string;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const utils = api.useUtils();
  const assessmentQuery = api.assessments.getById.useQuery({
    id: assessmentId,
  });
  const questionsQuery = api.assessmentQuestions.listByAssessmentId.useQuery({
    assessmentId,
  });

  const deleteQuestionMutation = api.assessmentQuestions.delete.useMutation({
    onSuccess: () => {
      toast.success("Question deleted successfully!");
      utils.assessmentQuestions.listByAssessmentId.invalidate({ assessmentId });
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });

  if (assessmentQuery.isLoading)
    return <p className="container mx-auto py-10">Loading assessment...</p>;
  if (assessmentQuery.error) return notFound();

  const assessment = assessmentQuery.data;

  const columns: ColumnDef<Question>[] = [
    {
      accessorKey: "sort_order",
      header: "Order",
    },
    {
      accessorKey: "question_text",
      header: "Question Text",
    },
    {
      accessorKey: "question_type",
      header: "Type",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const question = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/assessments/${assessmentId}/edit/${question.id}`}
              >
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteQuestionMutation.mutate({ id: question.id })}
              disabled={deleteQuestionMutation.isPending}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <main className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/assessments">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="ml-2">
          <h1 className="text-2xl font-bold">Manage Assessment</h1>
          <p className="text-muted-foreground">{assessment?.title}</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>
            {assessment?.description ?? "No description provided."}
          </CardDescription>
        </CardHeader>
        {/* We could add an edit button here for the main assessment details */}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Questions</CardTitle>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                  <DialogDescription>
                    Add a new question to this assessment. Fill in the details
                    below.
                  </DialogDescription>
                </DialogHeader>
                <QuestionForm
                  assessmentId={assessmentId}
                  onSuccess={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Manage the questions for this assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questionsQuery.isLoading ? (
            <p>Loading questions...</p>
          ) : questionsQuery.error ? (
            <p>Error: {questionsQuery.error.message}</p>
          ) : (
            <DataTable columns={columns} data={questionsQuery.data ?? []} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
