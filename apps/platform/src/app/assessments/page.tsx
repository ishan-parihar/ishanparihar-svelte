"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Calendar, ArrowRight, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Type for published assessment from listPublic API
interface PublishedAssessment {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

export default function AssessmentsPage() {
  const [page, setPage] = useState(0);
  const limit = 10;

  // Fetch published assessments
  const {
    data: publishedAssessments,
    isLoading: isLoadingPublished,
    error: publishedError,
  } = api.assessments.listPublic.useQuery();

  // Fetch assessment history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = api.assessment.getHistory.useQuery({
    limit,
    offset: page * limit,
  });

  const assessments = historyData?.results || [];
  const total = historyData?.total || 0;
  const hasMore = (page + 1) * limit < total;
  const isLoading = isLoadingPublished || isLoadingHistory;
  const error = publishedError || historyError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Assessments
          </h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assessment Dashboard</h1>
        <p className="text-gray-600">
          Track your personal development journey through interactive
          assessments
        </p>
      </div>

      {/* Available Assessments */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Assessments</h2>
        {isLoadingPublished ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : publishedAssessments && publishedAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedAssessments.map((assessment: PublishedAssessment) => (
              <Card
                key={assessment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    {assessment.title}
                  </CardTitle>
                  <CardDescription>
                    {assessment.description ||
                      "Take this assessment to learn more about yourself"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/assessments/${assessment.slug}`}>
                    <Button className="w-full">
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Assessments Available
              </h3>
              <p className="text-gray-600">
                There are currently no published assessments available. Please
                check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assessment History */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Assessment History</h2>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
              <p className="text-gray-600 mb-4">
                Start your first assessment to begin tracking your personal
                development journey.
              </p>
              {publishedAssessments && publishedAssessments.length > 0 && (
                <Link href={`/assessments/${publishedAssessments[0].slug}`}>
                  <Button>
                    Take Your First Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment: any) => (
              <Card
                key={assessment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">
                          {assessment.assessment_type.replace("-", " ")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Completed{" "}
                          {formatDistanceToNow(
                            new Date(assessment.created_at),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {assessment.assessment_type}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {(hasMore || page > 0) && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
