import { Metadata } from "next";
import { VerificationSentClient } from "@/components/auth/verification-sent-client";

export const metadata: Metadata = {
  title: "Verification Email Sent | Ishan Parihar",
  description: "Please check your email to verify your account",
};

/**
 * Verification Email Sent Page
 *
 * This page is shown after a user signs up with email/password,
 * informing them to check their email for a verification link.
 */
export default async function VerificationSentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // In Next.js App Router, searchParams is a ReadonlyURLSearchParams object
  // and should be treated as async in server components

  // Extract email parameter safely by awaiting searchParams
  const params = await searchParams;
  const emailParam = params.email;
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam;

  return <VerificationSentClient email={email} />;
}
