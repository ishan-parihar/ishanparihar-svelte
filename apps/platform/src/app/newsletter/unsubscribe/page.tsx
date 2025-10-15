import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Unsubscribe from Newsletter | Ishan Parihar",
  description: "Unsubscribe from Ishan Parihar's newsletter",
};

/**
 * Newsletter Unsubscribe Page
 *
 * This page is shown to users after they click an unsubscribe link in an email.
 * It displays a confirmation or error message based on the query parameters.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const success = resolvedParams.success === "true";
  const error = resolvedParams.error as string | undefined;
  const email = resolvedParams.email as string | undefined;

  return (
    <div className="w-full max-w-3xl py-12 px-4 md:py-24">
      <div className="bg-white dark:bg-slate-900 rounded-none shadow-md p-8 text-center">
        <div className="mb-6">
          {success ? (
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          {success ? "Successfully Unsubscribed" : "Unsubscribe Error"}
        </h1>

        <div className="text-slate-600 dark:text-slate-300 mb-8">
          {success ? (
            <>
              <p className="mb-2">
                You have been successfully unsubscribed from the newsletter.
              </p>
              {email && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Email: {email}
                </p>
              )}
              <p className="mt-4">
                If you change your mind, you can always subscribe again from the
                website.
              </p>
            </>
          ) : (
            <p>
              {error === "missing-token"
                ? "The unsubscribe link is invalid. It may be missing a required token."
                : error === "server-error"
                  ? "An error occurred while processing your request. Please try again later."
                  : error ||
                    "An unknown error occurred. Please try again later."}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
