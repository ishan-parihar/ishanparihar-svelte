/**
 * Customer Support Service Types and Utilities
 * This file contains types and utility functions for the customer support system
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SupportTicketCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id?: string;
  customer_email: string;
  customer_name?: string;
  subject: string;
  description: string;
  category_id?: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  assigned_at?: string;
  order_id?: string;
  service_id?: string;
  tags?: string[];
  internal_notes?: string;
  customer_satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  last_customer_reply_at?: string;
  last_admin_reply_at?: string;

  // Populated fields
  category?: SupportTicketCategory;
  assigned_admin?: {
    id: string;
    name?: string;
    email: string;
  };
  customer?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  message_count?: number;
  last_message?: SupportMessage;
}

export interface ChatSession {
  id: string;
  session_id: string;
  customer_id?: string;
  customer_email: string;
  customer_name?: string;
  admin_id?: string;
  status: "active" | "ended" | "abandoned" | "transferred";
  ticket_id?: string;
  started_at: string;
  ended_at?: string;
  last_activity_at: string;
  customer_ip?: string;
  user_agent?: string;
  referrer_url?: string;

  // Populated fields
  admin?: {
    id: string;
    name?: string;
    email: string;
  };
  customer?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  message_count?: number;
  last_message?: SupportMessage;
}

export interface SupportMessage {
  id: string;
  ticket_id?: string;
  chat_session_id?: string;
  sender_id?: string;
  sender_email: string;
  sender_name?: string;
  sender_type: "customer" | "admin" | "system";
  content: string;
  content_type: "text" | "html" | "markdown";
  is_internal: boolean;
  is_automated: boolean;
  attachments?: any[];
  created_at: string;
  updated_at: string;
  read_at?: string;

  // Populated fields
  sender?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
}

export interface SupportTicketAssignment {
  id: string;
  ticket_id: string;
  admin_id: string;
  assigned_by?: string;
  assigned_at: string;
  unassigned_at?: string;
  is_active: boolean;
}

export interface SupportNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  ticket_id?: string;
  chat_session_id?: string;
  message_id?: string;
  is_read: boolean;
  read_at?: string;
  email_sent: boolean;
  email_sent_at?: string;
  created_at: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get priority color for UI display
 */
export function getPriorityColor(priority: SupportTicket["priority"]): string {
  switch (priority) {
    case "urgent":
      return "#EF4444"; // red-500 - softer red
    case "high":
      return "#F97316"; // orange-500 - better orange
    case "medium":
      return "#EAB308"; // yellow-500 - cleaner yellow
    case "low":
      return "#22C55E"; // green-500 - brighter green
    default:
      return "#6B7280"; // gray-500
  }
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: SupportTicket["status"]): string {
  switch (status) {
    case "open":
      return "#EF4444"; // red-500 - softer red
    case "in_progress":
      return "#3B82F6"; // blue-500 - cleaner blue
    case "waiting":
      return "#EAB308"; // yellow-500 - cleaner yellow
    case "resolved":
      return "#22C55E"; // green-500 - brighter green
    case "closed":
      return "#6B7280"; // gray-500
    default:
      return "#6B7280"; // gray-500
  }
}

/**
 * Get priority label for display
 */
export function getPriorityLabel(priority: SupportTicket["priority"]): string {
  switch (priority) {
    case "urgent":
      return "Urgent";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "Unknown";
  }
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: SupportTicket["status"]): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "waiting":
      return "Waiting for Customer";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return "Unknown";
  }
}

/**
 * Check if ticket needs attention (high priority or old)
 */
export function ticketNeedsAttention(ticket: SupportTicket): boolean {
  const now = new Date();
  const created = new Date(ticket.created_at);
  const hoursSinceCreated =
    (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  // Urgent tickets always need attention
  if (ticket.priority === "urgent") return true;

  // High priority tickets older than 2 hours
  if (ticket.priority === "high" && hoursSinceCreated > 2) return true;

  // Medium priority tickets older than 8 hours
  if (ticket.priority === "medium" && hoursSinceCreated > 8) return true;

  // Low priority tickets older than 24 hours
  if (ticket.priority === "low" && hoursSinceCreated > 24) return true;

  return false;
}

/**
 * Format time ago for display
 */
export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

/**
 * Generate session ID for chat
 */
export function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate ticket data
 */
export function validateTicketData(data: Partial<SupportTicket>): string[] {
  const errors: string[] = [];

  if (!data.customer_email) {
    errors.push("Customer email is required");
  }

  if (!data.subject || data.subject.trim().length < 5) {
    errors.push("Subject must be at least 5 characters long");
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long");
  }

  if (
    data.priority &&
    !["low", "medium", "high", "urgent"].includes(data.priority)
  ) {
    errors.push("Invalid priority level");
  }

  return errors;
}
