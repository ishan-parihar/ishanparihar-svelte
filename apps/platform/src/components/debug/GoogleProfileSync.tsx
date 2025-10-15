"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Debug component for testing Google profile picture sync
 * This component allows manual triggering of Google profile picture sync
 */
export function GoogleProfileSync() {
  const { data: session } = useSession();
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    updated: boolean;
    message: string;
  } | null>(null);

  const syncMutation = api.user.syncGoogleProfilePicture.useMutation({
    onSuccess: (data) => {
      setSyncResult({
        success: true,
        updated: data.updated,
        message: data.message,
      });
    },
    onError: (error) => {
      setSyncResult({
        success: false,
        updated: false,
        message: error.message,
      });
    },
  });

  const handleSync = () => {
    setSyncResult(null);
    syncMutation.mutate();
  };

  // Only show for Google users
  if (!session?.user || (session.user as any).provider !== "google") {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Google Profile Sync
        </CardTitle>
        <CardDescription>
          Debug tool to manually sync your Google profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>User:</strong> {session.user.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Provider:</strong> {(session.user as any).provider}
          </p>
          <p>
            <strong>Session Image:</strong>{" "}
            {session.user.image ? "Available" : "Not available"}
          </p>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="w-full"
        >
          {syncMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Profile Picture
            </>
          )}
        </Button>

        {syncResult && (
          <Alert
            className={
              syncResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <div className="flex items-center gap-2">
              {syncResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  syncResult.success ? "text-green-800" : "text-red-800"
                }
              >
                {syncResult.message}
                {syncResult.success && syncResult.updated && (
                  <span className="block mt-1 text-sm">
                    Profile picture has been updated. Refresh the page to see
                    changes.
                  </span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
