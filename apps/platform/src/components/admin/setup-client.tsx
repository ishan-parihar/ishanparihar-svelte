"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface SetupClientProps {
  initialData?: any;
}

export function SetupClient({ initialData }: SetupClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(initialData || null);
  const [error, setError] = useState<string | null>(null);

  const checkSupabaseSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/supabase-check");
      const data = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.error || "Failed to check Supabase setup");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Error checking Supabase setup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      checkSupabaseSetup();
    }
  }, [initialData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-foreground" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-foreground" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-foreground" />;
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return null;
    }
  };

  const openSupabaseDashboard = () => {
    window.open("https://supabase.com/dashboard", "_blank");
  };

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Supabase Storage Setup</h1>
        <Button
          variant="outline"
          onClick={checkSupabaseSetup}
          disabled={isLoading}
          className="rounded-none border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recheck
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Status</CardTitle>
              <CardDescription>
                Current state of your Supabase configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Supabase URL
                  </h3>
                  <p>
                    {result.supabaseConfigured ? (
                      <Badge variant="success">Configured</Badge>
                    ) : (
                      <Badge variant="error">Not Configured</Badge>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    blog-images Bucket
                  </h3>
                  <p>
                    {result.hasBlogImagesBucket ? (
                      <Badge variant="success">Exists</Badge>
                    ) : (
                      <Badge variant="error">Missing</Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={openSupabaseDashboard}
                className="w-full rounded-none border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Supabase Dashboard
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup Steps</CardTitle>
              <CardDescription>Status of each setup step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.steps?.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-0.5">{getStatusIcon(step.status)}</div>
                    <div>
                      <p className="font-medium">{step.name}</p>
                      {step.details && (
                        <p className="text-sm text-muted-foreground">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {result.recommendations?.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Follow these steps to fix your configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal ml-5 space-y-2">
                  {result.recommendations.map(
                    (recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    ),
                  )}
                </ol>
              </CardContent>
              <CardFooter>
                <Button
                  variant="default"
                  onClick={openSupabaseDashboard}
                  className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to Supabase Dashboard
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading configuration status...</span>
        </div>
      )}
    </div>
  );
}
