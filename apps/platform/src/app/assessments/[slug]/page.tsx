"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssessmentPlayer } from "@/components/assessments/assessment-player";
import Link from "next/link";

export default function DynamicAssessmentPage() {
  const params = useParams();
  const slug = params.slug as string;

  // First, get the basic assessment info by slug
  const {
    data: assessmentInfo,
    isLoading: isLoadingInfo,
    error: infoError,
  } = api.assessments.getBySlug.useQuery({ slug }, { enabled: !!slug });

  // Then, get the full assessment data for taking (only if we have the assessment ID)
  const {
    data: assessmentData,
    isLoading: isLoadingData,
    error: dataError,
  } = api.assessments.getAssessmentForTaking.useQuery(
    { assessmentId: assessmentInfo?.id || "" },
    { enabled: !!assessmentInfo?.id },
  );

  const isLoading = isLoadingInfo || isLoadingData;
  const error = infoError || dataError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-600">
                  Assessment Not Found
                </CardTitle>
              </div>
              <CardDescription>
                The assessment you're looking for could not be found or is not
                currently available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">This could happen if:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>The assessment URL is incorrect</li>
                  <li>The assessment has been unpublished</li>
                  <li>The assessment has been removed</li>
                </ul>
                <div className="pt-4">
                  <Link href="/assessments">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Assessments
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Assessment Error
          </h1>
          <p className="text-gray-600">Unable to load assessment data.</p>
        </div>
      </div>
    );
  }

  return <AssessmentPlayer assessmentData={assessmentData} />;
}
