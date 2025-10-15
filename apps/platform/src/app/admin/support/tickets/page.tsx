import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { TicketsListClient } from "@/components/admin/support/tickets/tickets-list-client";
import { createServiceRoleClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Support Tickets | Admin Dashboard",
  description: "Manage customer support tickets",
};

export default async function TicketsPage() {
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

  // Fetch initial data directly from Supabase
  let initialTickets: any = null;
  let initialCategories: any = null;

  try {
    const supabase = createServiceRoleClient();

    if (supabase) {
      // Fetch tickets and categories directly (same logic as API routes)
      const [ticketsResult, categoriesResult] = await Promise.all([
        supabase
          .from("support_tickets")
          .select(
            `
            id,
            title,
            description,
            status,
            priority,
            category,
            created_at,
            updated_at,
            customer_id,
            assigned_to,
            next_auth.users!support_tickets_customer_id_fkey (
              id,
              email,
              name,
              image
            ),
            assigned_admin:next_auth.users!support_tickets_assigned_to_fkey (
              id,
              email,
              name
            )
          `,
          )
          .order("created_at", { ascending: false })
          .limit(20),

        supabase.from("support_ticket_categories").select("*").order("name"),
      ]);

      if (ticketsResult.data) {
        initialTickets = ticketsResult.data;
      }

      if (categoriesResult.data) {
        initialCategories = categoriesResult.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch initial tickets data:", error);
    // Continue without initial data, component will fetch it client-side
  }

  return (
    <TicketsListClient
      initialTickets={initialTickets}
      initialCategories={initialCategories}
    />
  );
}
