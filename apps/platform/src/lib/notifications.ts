/**
 * Notification utilities for the support system
 */

import { createServiceRoleClient } from "@/utils/supabase/server";
import { sendEmailNotification, sendChatNotification } from "./email-service";

export interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  ticket_id?: string;
  chat_session_id?: string;
  message_id?: string;
  send_email?: boolean;
}

/**
 * Create a support notification
 */
export async function createNotification(data: NotificationData) {
  try {
    const supabase = createServiceRoleClient();

    const { data: notification, error } = await supabase
      .from("support_notifications")
      .insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        ticket_id: data.ticket_id,
        chat_session_id: data.chat_session_id,
        message_id: data.message_id,
        is_read: false,
        email_sent: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    // Send email if requested
    if (data.send_email) {
      try {
        // Get user email
        const { data: user } = await supabase
          .from("next_auth.users")
          .select("email, name")
          .eq("id", data.user_id)
          .single();

        if (user?.email) {
          // Send email using the email service
          const emailSent = await sendEmailNotification({
            to: user.email,
            name: user.name || "Admin",
            subject: data.title,
            message: data.message,
            type: "general",
            metadata: {
              notificationId: notification.id,
              ticketId: data.ticket_id,
              chatSessionId: data.chat_session_id,
            },
          });

          // Update notification to mark email as sent
          await supabase
            .from("support_notifications")
            .update({
              email_sent: emailSent,
              email_sent_at: emailSent ? new Date().toISOString() : null,
            })
            .eq("id", notification.id);
        }
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
        // Don't fail if email fails
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create notifications for new ticket
 */
export async function notifyNewTicket(
  ticketId: string,
  ticketNumber: string,
  subject: string,
  customerEmail: string,
) {
  try {
    const supabase = createServiceRoleClient();

    // Get all admin users with support permissions
    const { data: adminUsers } = await supabase
      .from("next_auth.users")
      .select("id, email, name")
      .eq("role", "admin");

    if (!adminUsers || adminUsers.length === 0) {
      return;
    }

    // Create notifications for all support admins
    const notifications = adminUsers.map((admin: any) => ({
      user_id: admin.id,
      type: "new_ticket",
      title: `New Support Ticket: ${ticketNumber}`,
      message: `A new support ticket "${subject}" has been created by ${customerEmail}`,
      ticket_id: ticketId,
      send_email: false, // Set to true if you want email notifications
    }));

    for (const notificationData of notifications) {
      await createNotification(notificationData);
    }
  } catch (error) {
    console.error("Error creating new ticket notifications:", error);
  }
}

/**
 * Create notification for ticket assignment
 */
export async function notifyTicketAssigned(
  ticketId: string,
  ticketNumber: string,
  assignedToId: string,
  assignedByName: string,
) {
  await createNotification({
    user_id: assignedToId,
    type: "ticket_assigned",
    title: `Ticket Assigned: ${ticketNumber}`,
    message: `You have been assigned to ticket ${ticketNumber} by ${assignedByName}`,
    ticket_id: ticketId,
    send_email: true,
  });
}

/**
 * Create notification for new message in ticket
 */
export async function notifyNewTicketMessage(
  ticketId: string,
  ticketNumber: string,
  messageId: string,
  senderName: string,
  isCustomerMessage: boolean,
) {
  try {
    const supabase = createServiceRoleClient();

    // Get ticket details
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("assigned_to, customer_email")
      .eq("id", ticketId)
      .single();

    if (!ticket) return;

    if (isCustomerMessage && ticket.assigned_to) {
      // Notify assigned admin of customer reply
      await createNotification({
        user_id: ticket.assigned_to,
        type: "new_message",
        title: `Customer Reply: ${ticketNumber}`,
        message: `${senderName} replied to ticket ${ticketNumber}`,
        ticket_id: ticketId,
        message_id: messageId,
        send_email: true,
      });
    } else if (!isCustomerMessage) {
      // Notify other admins of admin reply (optional)
      // You might want to implement this based on your needs
    }
  } catch (error) {
    console.error("Error creating new message notifications:", error);
  }
}

/**
 * Create notification for new chat session
 */
export async function notifyNewChatSession(
  chatSessionId: string,
  customerEmail: string,
  customerName?: string,
) {
  try {
    const supabase = createServiceRoleClient();

    // Get all admin users with chat permissions
    const { data: adminUsers } = await supabase
      .from("next_auth.users")
      .select("id, email, name")
      .eq("role", "admin");

    if (!adminUsers || adminUsers.length === 0) {
      return;
    }

    // Create notifications for all chat admins
    const notifications = adminUsers.map((admin: any) => ({
      user_id: admin.id,
      type: "chat_started",
      title: "New Chat Session",
      message: `${customerName || customerEmail} started a new chat session`,
      chat_session_id: chatSessionId,
      send_email: false,
    }));

    for (const notificationData of notifications) {
      await createNotification(notificationData);
    }

    // Send email notifications to admins
    for (const admin of adminUsers) {
      if (admin.email) {
        try {
          await sendChatNotification(admin.email, admin.name || "Admin", {
            sessionId: chatSessionId,
            customerName,
            customerEmail,
            startedAt: new Date().toISOString(),
          });
        } catch (emailError) {
          console.error(
            `Error sending chat email to ${admin.email}:`,
            emailError,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error creating new chat session notifications:", error);
  }
}

/**
 * Create notification for chat assignment
 */
export async function notifyChatAssigned(
  chatSessionId: string,
  assignedToId: string,
  customerEmail: string,
) {
  await createNotification({
    user_id: assignedToId,
    type: "chat_assigned",
    title: "Chat Session Assigned",
    message: `You have been assigned to a chat session with ${customerEmail}`,
    chat_session_id: chatSessionId,
    send_email: false,
  });
}

/**
 * Create notification for urgent ticket
 */
export async function notifyUrgentTicket(
  ticketId: string,
  ticketNumber: string,
  subject: string,
) {
  try {
    const supabase = createServiceRoleClient();

    // Get all admin users
    const { data: adminUsers } = await supabase
      .from("next_auth.users")
      .select("id, email, name")
      .eq("role", "admin");

    if (!adminUsers || adminUsers.length === 0) {
      return;
    }

    // Create urgent notifications for all admins
    const notifications = adminUsers.map((admin: any) => ({
      user_id: admin.id,
      type: "urgent_ticket",
      title: `🚨 URGENT: ${ticketNumber}`,
      message: `Urgent priority ticket: "${subject}" requires immediate attention`,
      ticket_id: ticketId,
      send_email: true,
    }));

    for (const notificationData of notifications) {
      await createNotification(notificationData);
    }
  } catch (error) {
    console.error("Error creating urgent ticket notifications:", error);
  }
}

/**
 * Create notification for ticket status change
 */
export async function notifyTicketStatusChange(
  ticketId: string,
  ticketNumber: string,
  newStatus: string,
  changedByName: string,
) {
  try {
    const supabase = createServiceRoleClient();

    // Get ticket details
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("assigned_to, customer_email")
      .eq("id", ticketId)
      .single();

    if (!ticket || !ticket.assigned_to) return;

    await createNotification({
      user_id: ticket.assigned_to,
      type: "ticket_updated",
      title: `Ticket Status Updated: ${ticketNumber}`,
      message: `Ticket ${ticketNumber} status changed to "${newStatus}" by ${changedByName}`,
      ticket_id: ticketId,
      send_email: newStatus === "resolved" || newStatus === "closed",
    });
  } catch (error) {
    console.error("Error creating ticket status change notifications:", error);
  }
}
