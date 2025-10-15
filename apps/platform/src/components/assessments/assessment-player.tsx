"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { QuestionCard } from "./question-card";
import { AnimatedSection } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";

interface AssessmentOption {
  id: string;
  option_text: string;
  value: string;
}

interface AssessmentQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: AssessmentOption[];
}

interface AssessmentData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  questions: AssessmentQuestion[];
}

interface AssessmentPlayerProps {
  assessmentData: AssessmentData;
}

export function AssessmentPlayer({ assessmentData }: AssessmentPlayerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAssessment = api.assessment.submitAssessment.useMutation({
    onSuccess: () => {
      toast.success("Assessment completed successfully!");
      router.push("/assessments");
    },
    onError: (error) => {
      toast.error("Failed to submit assessment: " + error.message);
      setIsSubmitting(false);
    },
  });

  const currentQuestion = assessmentData.questions[currentQuestionIndex];
  const totalQuestions = assessmentData.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed = answers[currentQuestion?.id];

  const handleAnswerSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Prepare results in the format expected by the API
    const results = {
      assessmentId: assessmentData.id,
      answers,
      completedAt: new Date().toISOString(),
      totalQuestions,
      // Add any additional metadata
      slug: assessmentData.slug,
    };

    try {
      await submitAssessment.mutateAsync({
        assessment_type: "personality-test", // This will need to be dynamic in the future
        results,
      });
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Assessment Error
          </h1>
          <p className="text-gray-600">Unable to load assessment questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <AnimatedSection>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/assessments")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{assessmentData.title}</h1>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </AnimatedSection>

      {/* Question Card with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <QuestionCard
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            onAnswerSelect={handleAnswerSelect}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <AnimatedSection delay={0.2}>
        <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button onClick={handleNext} disabled={!canProceed || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isLastQuestion ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Assessment
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        </div>
      </AnimatedSection>
    </div>
  );
}
