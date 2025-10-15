"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StaggeredList } from "@/components/motion";

interface QuestionOption {
  id: string;
  option_text: string;
  value: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: QuestionOption[];
}

interface QuestionCardProps {
  question: Question;
  selectedValue?: string;
  onAnswerSelect: (value: string) => void;
}

export function QuestionCard({
  question,
  selectedValue,
  onAnswerSelect,
}: QuestionCardProps) {
  const renderQuestionContent = () => {
    switch (question.question_type) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={selectedValue || ""}
            onValueChange={onAnswerSelect}
            className="space-y-4"
          >
            <StaggeredList staggerDelay={0.1}>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </StaggeredList>
          </RadioGroup>
        );

      case "slider":
        // Future-proofing: placeholder for slider questions
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Slider questions are not yet implemented.</p>
            <p className="text-sm">
              This feature will be available in a future update.
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-red-500">
            <p>Unsupported question type: {question.question_type}</p>
          </div>
        );
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">{question.question_text}</CardTitle>
        <CardDescription>
          Please select the option that best describes how you feel about this
          statement.
        </CardDescription>
      </CardHeader>
      <CardContent>{renderQuestionContent()}</CardContent>
    </Card>
  );
}
