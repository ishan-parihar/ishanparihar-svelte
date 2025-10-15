import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { TicketDetailClient } from "@/components/admin/support/tickets/ticket-detail-client";
import { createServiceRoleClient } from "@/utils/supabase/server";

interface TicketPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Ticket ${id} | Admin Dashboard`,
    description: "View and manage support ticket details",
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params;
  // Get the user session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    redirect("/");
  }

  // Check if user has support permissions
  const hasViewPermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.VIEW_SUPPORT_TICKETS,
  );
  const hasManagePermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.MANAGE_SUPPORT,
  );

  if (!hasViewPermission && !hasManagePermission) {
    redirect("/admin");
  }

  // Fetch initial ticket data directly from Supabase
  let initialTicket: any = null;

  try {
    const supabase = createServiceRoleClient();

    if (supabase) {
      // Fetch ticket data directly (simplified to avoid join issues)
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code === "PGRST116") {
        // Record not found
        notFound();
      }

      if (ticket) {
        initialTicket = ticket;
      }
    }
  } catch (error) {
    console.error("Failed to fetch initial ticket data:", error);
    // Continue without initial data, component will fetch it client-side
  }

  return <TicketDetailClient ticketId={id} initialTicket={initialTicket} />;
}
