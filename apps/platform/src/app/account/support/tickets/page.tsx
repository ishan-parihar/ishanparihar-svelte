import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CustomerTicketList } from "@/components/customer/support/customer-ticket-list";

export const metadata: Metadata = {
  title: "My Support Tickets | Account",
  description: "View and manage your support tickets",
};

export default async function CustomerTicketsPage() {
  // Get the user session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <CustomerTicketList />;
}
