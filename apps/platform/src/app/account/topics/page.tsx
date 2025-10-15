import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Metadata } from "next";
import { FollowedTopicsManager } from "@/components/account/FollowedTopicsManager";

export const metadata: Metadata = {
  title: "Manage Topics | Account",
  description: "Manage your followed topics and content preferences.",
};

export default async function TopicsManagementPage() {
  // Get the user's session using the new auth() function
  const session = await auth();

  // Redirect to login if not logged in
  if (!session?.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/account/topics");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Manage Your Topics
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Follow topics that interest you to get personalized content
            recommendations.
          </p>
        </div>

        <FollowedTopicsManager />
      </div>
    </div>
  );
}
