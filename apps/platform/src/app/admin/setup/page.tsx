import { SetupClient } from "@/components/admin/setup-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Setup | Ishan Parihar",
  description:
    "Supabase storage setup and configuration for the admin dashboard",
};

export default async function SetupPage() {
  // We could fetch initial data here if needed
  // For now, we'll let the client component handle the data fetching

  return <SetupClient />;
}
