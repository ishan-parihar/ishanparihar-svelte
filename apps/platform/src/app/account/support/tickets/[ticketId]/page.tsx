import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CustomerTicketDetail } from "@/components/customer/support/customer-ticket-detail";

export const metadata: Metadata = {
  title: "Support Ticket | Account",
  description: "View and manage your support ticket",
};

interface TicketPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function CustomerTicketPage({ params }: TicketPageProps) {
  // Get the user session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { ticketId } = await params;

  return <CustomerTicketDetail ticketId={ticketId} />;
}
