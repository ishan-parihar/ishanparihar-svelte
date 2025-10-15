"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/trpc-client";
import { toast } from "sonner";

export function WelcomeEmailConfig() {
  const [subject, setSubject] = useState("Welcome to Our Newsletter!");
  const [content, setContent] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Load the welcome email template using tRPC
  const {
    data: welcomeTemplateData,
    isLoading,
    error: fetchError,
  } = api.admin.getWelcomeTemplate.useQuery();

  // Update welcome template mutation
  const updateWelcomeTemplateMutation =
    api.admin.updateWelcomeTemplate.useMutation({
      onSuccess: () => {
        setSaveSuccess(true);
        toast.success("Welcome template saved successfully");
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      },
      onError: (error) => {
        setError(error.message || "Failed to save welcome email template");
        toast.error(error.message || "Failed to save welcome email template");
      },
    });

  // Update state when data is loaded
  useEffect(() => {
    if (welcomeTemplateData?.success && welcomeTemplateData.data) {
      setSubject(
        welcomeTemplateData.data.subject || "Welcome to Our Newsletter!",
      );
      setContent(welcomeTemplateData.data.content || "");
      setIsEnabled(welcomeTemplateData.data.isEnabled !== false);
    }
  }, [welcomeTemplateData]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      setError("Failed to load welcome email template");
    }
  }, [fetchError]);

  const handleSave = async () => {
    setError("");
    setSaveSuccess(false);

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    try {
      await updateWelcomeTemplateMutation.mutateAsync({
        subject,
        content,
        isEnabled,
      });
      // Success handling is done in the mutation's onSuccess callback
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Error saving welcome email template:", error);
    }
  };

  const handleSendTest = async () => {
    setError("");
    setTestSuccess(false);

    if (!testEmail.trim() || !testEmail.includes("@")) {
      setError("Valid email address is required for test email");
      return;
    }

    setIsSendingTest(true);

    try {
      console.log("Sending test welcome email to:", testEmail);

      // First, check if we're authenticated as admin
      const adminEmail = document.cookie
        .split("; ")
        .find((row) => row.startsWith("adminEmail="))
        ?.split("=")[1];

      const adminAuthenticated = document.cookie
        .split("; ")
        .find((row) => row.startsWith("adminAuthenticated="))
        ?.split("=")[1];

      console.log("Admin credentials check:", {
        adminEmail: adminEmail ? "present" : "missing",
        adminAuthenticated: adminAuthenticated === "true" ? "true" : "false",
      });

      if (!adminEmail || adminAuthenticated !== "true") {
        setError("You must be logged in as an admin to send test emails");
        return;
      }

      const response = await fetch("/api/admin/newsletter/welcome-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include", // Important: include cookies for admin authentication
        body: JSON.stringify({
          email: testEmail,
          subject,
          content,
        }),
      });

      let data;
      try {
        data = await response.json();
        console.log("Test email response:", data);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        const errorMessage =
          data?.message || data?.error || "Failed to send test email";
        console.error("Error sending test email:", errorMessage);
        throw new Error(errorMessage);
      }

      setTestSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setTestSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending test email:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send test email",
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Welcome Email Configuration</h2>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-green-600 dark:text-green-400 text-sm">
              Template saved successfully!
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={updateWelcomeTemplateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateWelcomeTemplateMutation.isPending
              ? "Saving..."
              : "Save Template"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-black rounded-none shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="welcome-email-enabled"
            className="text-base font-medium"
          >
            Enable Welcome Emails
          </Label>
          <Switch
            id="welcome-email-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcome-email-subject">Subject</Label>
          <Input
            id="welcome-email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter welcome email subject"
            disabled={updateWelcomeTemplateMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcome-email-content">Content</Label>
          <Textarea
            id="welcome-email-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter welcome email content (HTML supported)"
            rows={12}
            disabled={updateWelcomeTemplateMutation.isPending}
          />
          <p className="text-xs text-slate-500">
            You can use HTML and the following variables: {"{name}"},{" "}
            {"{email}"}, {"{unsubscribe_link}"}
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-medium mb-4">Send Test Email</h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address for test"
                disabled={isSendingTest}
              />
            </div>
            <Button
              onClick={handleSendTest}
              disabled={isSendingTest || !testEmail.trim()}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSendingTest ? "Sending..." : "Send Test"}
            </Button>
          </div>

          {testSuccess && (
            <p className="text-green-600 dark:text-green-400 text-sm mt-2">
              Test email sent successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
