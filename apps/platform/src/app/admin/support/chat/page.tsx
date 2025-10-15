import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatManagementClient } from "@/components/admin/support/chat-management-client";

export const metadata: Metadata = {
  title: "Chat Management - Admin",
  description: "Manage customer chat sessions and real-time support",
};

export default async function ChatManagementPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/account");
  }

  return <ChatManagementClient />;
}
