/**
 * Support tRPC Schemas
 * Validation schemas for support/customer service operations
 */

import { z } from "zod";
import { emailSchema, uuidSchema } from "./common";

// Ticket schemas
export const createTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().optional(),
  customer_email: emailSchema.optional(),
  customer_name: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const updateTicketSchema = z.object({
  id: uuidSchema,
  subject: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  status: z
    .enum(["open", "in_progress", "waiting", "resolved", "closed"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  category: z.string().optional(),
  assigned_to: uuidSchema.nullable().optional(),
});

export const getTicketsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z
    .enum(["open", "in_progress", "waiting", "resolved", "closed"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: uuidSchema.optional(),
  search: z.string().optional(),
  customerEmail: emailSchema.optional(),
});

export const getTicketSchema = z.object({
  id: uuidSchema,
});

// Ticket message schemas
export const createTicketMessageSchema = z.object({
  ticket_id: uuidSchema,
  content: z.string().min(1).max(5000),
  is_internal: z.boolean().default(false),
  attachments: z.array(z.string()).optional(),
});

export const getTicketMessagesSchema = z.object({
  ticket_id: uuidSchema,
  include_internal: z.boolean().default(false),
});

// Chat schemas
export const createChatSessionSchema = z.object({
  customer_email: emailSchema,
  customer_name: z.string().optional(),
  initial_message: z.string().min(1).max(1000).optional(),
});

export const getChatSessionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(["active", "waiting", "closed"]).optional(),
  customerEmail: emailSchema.optional(),
});

export const getChatSessionSchema = z.object({
  id: uuidSchema,
});

export const createChatMessageSchema = z.object({
  session_id: uuidSchema,
  content: z.string().min(1).max(1000),
  sender_type: z.enum(["customer", "agent"]),
});

export const getChatMessagesSchema = z.object({
  session_id: uuidSchema,
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
});

// Support dashboard schemas
export const getDashboardSchema = z.object({
  include_metrics: z.boolean().default(true),
});

export const getMetricsSchema = z.object({
  period: z.enum(["day", "week", "month"]).default("week"),
});

// Response schemas
export const ticketSchema = z.object({
  id: uuidSchema,
  subject: z.string(),
  description: z.string(),
  status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().nullable(),
  customer_email: emailSchema,
  customer_name: z.string().nullable(),
  assigned_to: uuidSchema.nullable(),
  assigned_to_name: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  resolved_at: z.string().datetime().nullable(),
});

export const ticketMessageSchema = z.object({
  id: uuidSchema,
  ticket_id: uuidSchema,
  content: z.string(),
  is_internal: z.boolean(),
  sender_id: uuidSchema.nullable(),
  sender_name: z.string().nullable(),
  sender_email: emailSchema.nullable(),
  attachments: z.array(z.string()),
  created_at: z.string().datetime(),
});

export const chatSessionSchema = z.object({
  id: uuidSchema,
  session_id: z.string().optional(),
  customer_id: uuidSchema.nullable(),
  customer_email: emailSchema,
  customer_name: z.string().nullable(),
  admin_id: uuidSchema.nullable(),
  status: z.enum(["active", "waiting", "closed"]),
  ticket_id: uuidSchema.nullable(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().nullable(),
  last_activity_at: z.string().datetime().optional(),
  last_activity: z.string().datetime().optional(),
  customer_ip: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  referrer_url: z.string().nullable().optional(),
  admin_joined_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  // Populated fields for joins
  assigned_to: uuidSchema.nullable(),
  assigned_to_name: z.string().nullable(),
});

export const chatMessageSchema = z.object({
  id: uuidSchema,
  session_id: uuidSchema,
  content: z.string(),
  sender_type: z.enum(["customer", "agent"]),
  sender_id: uuidSchema.nullable(),
  sender_name: z.string().nullable(),
  created_at: z.string().datetime(),
});

export const supportMetricsSchema = z.object({
  total_tickets: z.number(),
  open_tickets: z.number(),
  in_progress_tickets: z.number(),
  resolved_tickets: z.number(),
  active_chats: z.number(),
  waiting_chats: z.number(),
  avg_response_time: z.number(),
  avg_resolution_time: z.number(),
});

// Paginated responses
export const paginatedTicketsSchema = z.object({
  tickets: z.array(ticketSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedChatSessionsSchema = z.object({
  chat_sessions: z.array(chatSessionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedChatMessagesSchema = z.object({
  messages: z.array(chatMessageSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
