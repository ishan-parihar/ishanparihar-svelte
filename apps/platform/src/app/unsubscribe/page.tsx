import { Metadata } from "next";
import { UnsubscribeClient } from "@/components/newsletter/unsubscribe-client";

export const metadata: Metadata = {
  title: "Unsubscribe from Newsletter",
  description: "Unsubscribe from our newsletter",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // In Next.js App Router, searchParams is a ReadonlyURLSearchParams object
  // and should be treated as async in server components

  // Get the success and message from the URL
  const resolvedParams = await searchParams;
  const success = resolvedParams.success === "true";
  const message = (resolvedParams.message as string) || "";

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Newsletter Preferences</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Manage your subscription to our newsletter
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 max-w-xl mx-auto">
        <UnsubscribeClient initialSuccess={success} initialMessage={message} />
      </div>
    </div>
  );
}
