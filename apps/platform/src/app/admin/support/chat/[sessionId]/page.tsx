import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { ChatDetailClient } from "@/components/admin/support/chat/chat-detail-client";
import { createServiceRoleClient } from "@/utils/supabase/server";

interface ChatPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const { sessionId } = await params;
  return {
    title: `Chat ${sessionId} | Admin Dashboard`,
    description: "View and manage chat session details",
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { sessionId } = await params;

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

  // Check if user has chat permissions
  const hasViewPermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.VIEW_SUPPORT_TICKETS,
  );
  const hasManagePermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.MANAGE_SUPPORT,
  );
  const hasChatPermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.MANAGE_CHAT,
  );

  if (!hasViewPermission && !hasManagePermission && !hasChatPermission) {
    redirect("/admin");
  }

  // Fetch initial chat data directly from Supabase
  let initialChatSession: any = null;

  try {
    const supabase = createServiceRoleClient();

    if (supabase) {
      // Fetch chat session data directly (without foreign key joins due to schema issues)
      const { data: chatSession, error } = await supabase
        .from("chat_sessions")
        .select(
          `
          id,
          session_id,
          customer_id,
          customer_email,
          customer_name,
          admin_id,
          status,
          started_at,
          ended_at,
          last_activity_at,
          ticket_id,
          customer_ip,
          user_agent,
          referrer_url
        `,
        )
        .eq("session_id", sessionId)
        .single();

      // Manually fetch related user data if needed
      if (chatSession && !error) {
        let customer = null;
        let admin = null;

        if (chatSession.customer_id) {
          const { data: customerData } = await supabase
            .from("next_auth.users")
            .select("id, email, name, image")
            .eq("id", chatSession.customer_id)
            .single();
          customer = customerData;
        }

        if (chatSession.admin_id) {
          const { data: adminData } = await supabase
            .from("next_auth.users")
            .select("id, email, name")
            .eq("id", chatSession.admin_id)
            .single();
          admin = adminData;
        }

        initialChatSession = {
          ...chatSession,
          customer,
          admin,
        };
      }

      if (error && error.code === "PGRST116") {
        // Record not found
        notFound();
      }
    }
  } catch (error) {
    console.error("Failed to fetch initial chat session data:", error);
    // Continue without initial data, component will fetch it client-side
  }

  return (
    <ChatDetailClient
      sessionId={sessionId}
      initialChatSession={initialChatSession}
    />
  );
}
