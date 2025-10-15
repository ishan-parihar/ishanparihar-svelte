/**
 * Support tRPC Router
 * Handles support tickets and chat functionality
 */

import {
  createTRPCRouter,
  protectedProcedure,
  limitedProcedure,
  adminProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  uuidSchema,
  paginationSchema,
  ticketStatusSchema,
  ticketPrioritySchema,
  chatStatusSchema,
} from "../schemas/common";
import { createServiceRoleClient } from "@/utils/supabase/server";

export const supportRouter = createTRPCRouter({
  // Customer procedures
  createTicket: limitedProcedure
    .input(
      z.object({
        subject: z.string().min(5).max(200),
        description: z.string().min(10),
        priority: ticketPrioritySchema.default("medium"),
        categoryId: uuidSchema.optional(),
        orderId: uuidSchema.optional(),
        serviceId: uuidSchema.optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Generate ticket number
        const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create the ticket
        const { data: ticket, error: ticketError } = await supabase
          .from("support_tickets")
          .insert({
            ticket_number: ticketNumber,
            customer_id: ctx.session.user.id,
            customer_email: ctx.session.user.email,
            customer_name: ctx.session.user.name,
            subject: input.subject.trim(),
            description: input.description.trim(),
            category_id: input.categoryId || null,
            priority: input.priority,
            order_id: input.orderId || null,
            service_id: input.serviceId || null,
            status: "open",
          })
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color)
          `,
          )
          .single();

        if (ticketError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create ticket",
            cause: ticketError,
          });
        }

        // Create initial message
        const { error: messageError } = await supabase
          .from("support_messages")
          .insert({
            ticket_id: ticket.id,
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "customer",
            content: input.description.trim(),
            content_type: "text",
            is_internal: false,
            is_automated: false,
          });

        if (messageError) {
          console.error("Failed to create initial message:", messageError);
          // Don't throw error here as the ticket is already created
        }

        return ticket;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ticket",
          cause: error,
        });
      }
    }),

  getMyTickets: protectedProcedure
    .input(
      paginationSchema.extend({
        status: ticketStatusSchema.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("support_tickets")
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color)
          `,
          )
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply status filter
        if (input.status) {
          query = query.eq("status", input.status);
        }

        const { data: tickets, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch tickets",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          );

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get tickets count",
            cause: countError,
          });
        }

        return {
          tickets: tickets || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tickets",
          cause: error,
        });
      }
    }),

  getTicket: protectedProcedure
    .input(z.object({ id: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Get the ticket
        const { data: ticket, error: ticketError } = await supabase
          .from("support_tickets")
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color)
          `,
          )
          .eq("id", input.id)
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          )
          .single();

        if (ticketError || !ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
            cause: ticketError,
          });
        }

        // Get ticket messages
        const { data: messages, error: messagesError } = await supabase
          .from("support_messages")
          .select(
            `
            *,
            sender:users!sender_id(id, name, email, picture)
          `,
          )
          .eq("ticket_id", input.id)
          .eq("is_internal", false)
          .order("created_at", { ascending: true });

        if (messagesError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch ticket messages",
            cause: messagesError,
          });
        }

        return {
          ...ticket,
          messages: messages || [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ticket",
          cause: error,
        });
      }
    }),

  addTicketMessage: limitedProcedure
    .input(
      z.object({
        ticketId: uuidSchema,
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Verify ticket ownership
        const { data: ticket, error: ticketError } = await supabase
          .from("support_tickets")
          .select("id, status")
          .eq("id", input.ticketId)
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          )
          .single();

        if (ticketError || !ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
            cause: ticketError,
          });
        }

        // Create the message (ensure chat_session_id is explicitly null for ticket messages)
        const { data: message, error: messageError } = await supabase
          .from("support_messages")
          .insert({
            ticket_id: input.ticketId,
            chat_session_id: null, // Explicitly set to null to avoid any triggers
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "customer",
            content: input.content.trim(),
            content_type: "text",
            is_internal: false,
            is_automated: false,
          })
          .select("*")
          .single();

        if (messageError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create message",
            cause: messageError,
          });
        }

        // Update ticket status if it was resolved
        if (ticket.status === "resolved") {
          await supabase
            .from("support_tickets")
            .update({
              status: "open",
              resolved_at: null,
              last_customer_reply_at: new Date().toISOString(),
            })
            .eq("id", input.ticketId);
        } else {
          // Update last customer reply timestamp
          await supabase
            .from("support_tickets")
            .update({
              last_customer_reply_at: new Date().toISOString(),
            })
            .eq("id", input.ticketId);
        }

        return message;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add message",
          cause: error,
        });
      }
    }),

  // Chat procedures
  startChatSession: limitedProcedure
    .input(
      z.object({
        subject: z.string().min(1).max(200),
        initialMessage: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Create chat session
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            customer_id: ctx.session.user.id,
            customer_email: ctx.session.user.email,
            customer_name: ctx.session.user.name,
            subject: input.subject.trim(),
            status: "active",
            last_activity_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (sessionError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create chat session",
            cause: sessionError,
          });
        }

        // Create initial message (ensure ticket_id is explicitly null for chat messages)
        const { data: message, error: messageError } = await supabase
          .from("support_messages")
          .insert({
            chat_session_id: chatSession.id,
            ticket_id: null, // Explicitly set to null to avoid any triggers
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "customer",
            content: input.initialMessage.trim(),
            content_type: "text",
            is_internal: false,
            is_automated: false,
          })
          .select("*")
          .single();

        if (messageError) {
          console.error("Failed to create initial chat message:", messageError);
          // Don't throw error here as the session is already created
        }

        return {
          ...chatSession,
          messages: message ? [message] : [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start chat session",
          cause: error,
        });
      }
    }),

  sendChatMessage: limitedProcedure
    .input(
      z.object({
        sessionId: uuidSchema,
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Verify chat session ownership
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("id, status")
          .eq("id", input.sessionId)
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          )
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        if (chatSession.status === "ended") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot send message to ended chat session",
          });
        }

        // Create the message (ensure ticket_id is explicitly null for chat messages)
        const { data: message, error: messageError } = await supabase
          .from("support_messages")
          .insert({
            chat_session_id: input.sessionId,
            ticket_id: null, // Explicitly set to null to avoid any triggers
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "customer",
            content: input.content.trim(),
            content_type: "text",
            is_internal: false,
            is_automated: false,
          })
          .select("*")
          .single();

        if (messageError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send message",
            cause: messageError,
          });
        }

        // Update last activity timestamp
        await supabase
          .from("chat_sessions")
          .update({
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", input.sessionId);

        return message;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
          cause: error,
        });
      }
    }),

  getChatSession: protectedProcedure
    .input(z.object({ sessionId: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Get the chat session
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("id", input.sessionId)
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          )
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        // Get chat messages
        const { data: messages, error: messagesError } = await supabase
          .from("support_messages")
          .select(
            `
            *,
            sender:users!sender_id(id, name, email, picture)
          `,
          )
          .eq("chat_session_id", input.sessionId)
          .eq("is_internal", false)
          .order("created_at", { ascending: true });

        if (messagesError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch chat messages",
            cause: messagesError,
          });
        }

        return {
          ...chatSession,
          messages: messages || [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat session",
          cause: error,
        });
      }
    }),

  getMyChatSessions: protectedProcedure
    .input(
      paginationSchema.extend({
        status: chatStatusSchema.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("chat_sessions")
          .select("*")
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          )
          .order("last_activity_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply status filter
        if (input.status) {
          query = query.eq("status", input.status);
        }

        const { data: sessions, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch chat sessions",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("chat_sessions")
          .select("*", { count: "exact", head: true })
          .or(
            `customer_id.eq.${ctx.session.user.id},customer_email.eq.${ctx.session.user.email}`,
          );

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get chat sessions count",
            cause: countError,
          });
        }

        return {
          sessions: sessions || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat sessions",
          cause: error,
        });
      }
    }),

  // Admin procedures
  getAllTickets: adminProcedure
    .input(
      paginationSchema.extend({
        status: ticketStatusSchema.optional(),
        priority: ticketPrioritySchema.optional(),
        assignedTo: uuidSchema.optional(),
        search: z.string().optional(),
        customerEmail: z.string().email().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("support_tickets")
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color),
            assigned_admin:users!assigned_to(id, name, email),
            customer:users!customer_id(id, name, email, picture)
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply filters
        if (input.status) {
          query = query.eq("status", input.status);
        }

        if (input.priority) {
          query = query.eq("priority", input.priority);
        }

        if (input.assignedTo) {
          query = query.eq("assigned_to", input.assignedTo);
        }

        if (input.customerEmail) {
          query = query.eq("customer_email", input.customerEmail);
        }

        if (input.search) {
          query = query.or(
            `ticket_number.ilike.%${input.search}%,subject.ilike.%${input.search}%,customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }

        const { data: tickets, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch tickets",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true });

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }
        if (input.priority) {
          countQuery = countQuery.eq("priority", input.priority);
        }
        if (input.assignedTo) {
          countQuery = countQuery.eq("assigned_to", input.assignedTo);
        }
        if (input.customerEmail) {
          countQuery = countQuery.eq("customer_email", input.customerEmail);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `ticket_number.ilike.%${input.search}%,subject.ilike.%${input.search}%,customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get tickets count",
            cause: countError,
          });
        }

        return {
          tickets: tickets || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tickets",
          cause: error,
        });
      }
    }),

  // Get admin ticket details (for admin ticket detail views)
  getAdminTicket: adminProcedure
    .input(z.object({ id: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Get the ticket with all related data
        const { data: ticket, error: ticketError } = await supabase
          .from("support_tickets")
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color),
            assigned_admin:users!assigned_to(id, name, email),
            customer:users!customer_id(id, name, email, picture)
          `,
          )
          .eq("id", input.id)
          .single();

        if (ticketError || !ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
            cause: ticketError,
          });
        }

        // Get ticket messages (including internal ones for admin)
        const { data: messages, error: messagesError } = await supabase
          .from("support_messages")
          .select(
            `
            *,
            sender:users!sender_id(id, name, email, picture)
          `,
          )
          .eq("ticket_id", input.id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch ticket messages",
            cause: messagesError,
          });
        }

        return {
          ...ticket,
          messages: messages || [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin ticket",
          cause: error,
        });
      }
    }),

  assignTicket: adminProcedure
    .input(
      z.object({
        ticketId: uuidSchema,
        assignedTo: uuidSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const updateData: any = {
          assigned_to: input.assignedTo,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // If ticket is currently open, move it to in_progress
        const { data: currentTicket } = await supabase
          .from("support_tickets")
          .select("status")
          .eq("id", input.ticketId)
          .single();

        if (currentTicket?.status === "open") {
          updateData.status = "in_progress";
        }

        const { data: ticket, error } = await supabase
          .from("support_tickets")
          .update(updateData)
          .eq("id", input.ticketId)
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color),
            assigned_admin:users!assigned_to(id, name, email)
          `,
          )
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to assign ticket",
            cause: error,
          });
        }

        return ticket;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign ticket",
          cause: error,
        });
      }
    }),

  // Update ticket (general update)
  updateTicket: adminProcedure
    .input(
      z.object({
        id: uuidSchema,
        subject: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        status: ticketStatusSchema.optional(),
        priority: ticketPrioritySchema.optional(),
        category_id: uuidSchema.nullable().optional(),
        assigned_to: uuidSchema.nullable().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Prepare update data
        const updateData: any = {};
        if (input.subject !== undefined) updateData.subject = input.subject;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.category_id !== undefined)
          updateData.category_id = input.category_id;
        if (input.assigned_to !== undefined)
          updateData.assigned_to = input.assigned_to;

        // Set resolved_at if status is being changed to resolved
        if (input.status === "resolved") {
          updateData.resolved_at = new Date().toISOString();
        } else if (
          input.status &&
          ["open", "in_progress", "waiting", "closed"].includes(input.status)
        ) {
          updateData.resolved_at = null;
        }

        updateData.updated_at = new Date().toISOString();

        // Update the ticket
        const { data: ticket, error } = await supabase
          .from("support_tickets")
          .update(updateData)
          .eq("id", input.id)
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color),
            assigned_admin:users!assigned_to(id, name, email)
          `,
          )
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update ticket",
            cause: error,
          });
        }

        // Add internal note if provided
        if (input.notes) {
          await supabase.from("support_ticket_messages").insert({
            ticket_id: input.id,
            content: input.notes,
            is_internal: true,
            sender_id: ctx.session?.user?.id,
            sender_name: ctx.session?.user?.name,
            sender_email: ctx.session?.user?.email,
          });
        }

        return ticket;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ticket",
          cause: error,
        });
      }
    }),

  updateTicketStatus: adminProcedure
    .input(
      z.object({
        ticketId: uuidSchema,
        status: ticketStatusSchema,
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const updateData: any = {
          status: input.status,
          updated_at: new Date().toISOString(),
        };

        // Set timestamps based on status
        if (input.status === "resolved") {
          updateData.resolved_at = new Date().toISOString();
        } else if (input.status === "closed") {
          updateData.closed_at = new Date().toISOString();
          if (!updateData.resolved_at) {
            updateData.resolved_at = new Date().toISOString();
          }
        }

        const { data: ticket, error } = await supabase
          .from("support_tickets")
          .update(updateData)
          .eq("id", input.ticketId)
          .select(
            `
            *,
            category:support_ticket_categories(id, name, color),
            assigned_admin:users!assigned_to(id, name, email)
          `,
          )
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update ticket status",
            cause: error,
          });
        }

        // Add internal note if provided
        if (input.notes && ctx.session?.user?.id) {
          await supabase.from("support_messages").insert({
            ticket_id: input.ticketId,
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "admin",
            content: input.notes,
            is_internal: true,
            is_automated: false,
          });
        }

        return ticket;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ticket status",
          cause: error,
        });
      }
    }),

  // Get all chat sessions for admin (with pagination and filters)
  getAllChatSessions: adminProcedure
    .input(
      paginationSchema.extend({
        status: chatStatusSchema.optional(),
        search: z.string().optional(),
        customerEmail: z.string().email().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("chat_sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply filters
        if (input.status) {
          query = query.eq("status", input.status);
        }

        if (input.customerEmail) {
          query = query.eq("customer_email", input.customerEmail);
        }

        if (input.search) {
          query = query.or(
            `customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }

        const { data: chatSessions, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch chat sessions",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("chat_sessions")
          .select("*", { count: "exact", head: true });

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }
        if (input.customerEmail) {
          countQuery = countQuery.eq("customer_email", input.customerEmail);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to count chat sessions",
            cause: countError,
          });
        }

        const totalPages = Math.ceil((count || 0) / input.limit);

        return {
          chat_sessions: chatSessions || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat sessions",
          cause: error,
        });
      }
    }),

  getActiveChatSessions: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        customerEmail: z.string().email().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        let query = supabase
          .from("chat_sessions")
          .select("*")
          .eq("status", "active")
          .order("last_activity_at", { ascending: false })
          .limit(input.limit);

        // Filter by customer email if provided
        if (input.customerEmail) {
          query = query.eq("customer_email", input.customerEmail);
        }

        const { data: sessions, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch active chat sessions",
            cause: error,
          });
        }

        return { chat_sessions: sessions || [] };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch active chat sessions",
          cause: error,
        });
      }
    }),

  // Get admin chat session details (for admin chat detail views)
  getAdminChatSession: adminProcedure
    .input(z.object({ sessionId: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Get the chat session with all related data
        // Note: sessionId parameter can be either the primary key 'id' or the 'session_id' field
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select(
            `
            *,
            customer:users!customer_id(id, name, email, picture),
            admin:users!admin_id(id, name, email, picture)
          `,
          )
          .or(`id.eq.${input.sessionId},session_id.eq.${input.sessionId}`)
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        return chatSession;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin chat session",
          cause: error,
        });
      }
    }),

  // Get admin chat session messages (for admin chat detail views)
  getAdminChatMessages: adminProcedure
    .input(z.object({ sessionId: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // First, get the chat session to find the correct ID
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("id")
          .or(`id.eq.${input.sessionId},session_id.eq.${input.sessionId}`)
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        // Get chat messages (including internal ones for admin)
        const { data: messages, error: messagesError } = await supabase
          .from("support_messages")
          .select(
            `
            *,
            sender:users!sender_id(id, name, email, picture)
          `,
          )
          .eq("chat_session_id", chatSession.id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch chat messages",
            cause: messagesError,
          });
        }

        return { messages: messages || [] };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin chat messages",
          cause: error,
        });
      }
    }),

  joinChatSession: adminProcedure
    .input(z.object({ sessionId: uuidSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Get the chat session (handle both id and session_id)
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("*")
          .or(`id.eq.${input.sessionId},session_id.eq.${input.sessionId}`)
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        // Update session to indicate admin has joined
        const { error: updateError } = await supabase
          .from("chat_sessions")
          .update({
            admin_id: ctx.session.user.id,
            admin_joined_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", input.sessionId);

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to join chat session",
            cause: updateError,
          });
        }

        // Send system message about admin joining
        await supabase.from("support_messages").insert({
          chat_session_id: chatSession.id, // Use the actual primary key ID
          sender_id: ctx.session.user.id,
          sender_email: ctx.session.user.email,
          sender_name: ctx.session.user.name,
          sender_type: "system",
          content: `${ctx.session.user.name || "Support agent"} has joined the chat`,
          is_internal: false,
          is_automated: true,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to join chat session",
          cause: error,
        });
      }
    }),

  // Admin chat message sending
  sendAdminChatMessage: adminProcedure
    .input(
      z.object({
        sessionId: uuidSchema,
        content: z.string().min(1),
        isInternal: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Verify chat session exists (handle both id and session_id)
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("id, status")
          .or(`id.eq.${input.sessionId},session_id.eq.${input.sessionId}`)
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        // Create the message (ensure ticket_id is explicitly null for chat messages)
        const { data: message, error: messageError } = await supabase
          .from("support_messages")
          .insert({
            chat_session_id: chatSession.id, // Use the actual primary key ID
            ticket_id: null, // Explicitly set to null to avoid any triggers
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "admin",
            content: input.content.trim(),
            content_type: "text",
            is_internal: input.isInternal,
            is_automated: false,
          })
          .select("*")
          .single();

        if (messageError) {
          console.error(
            "Database error in sendAdminChatMessage:",
            messageError,
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send message",
            cause: messageError,
          });
        }

        // Update last activity timestamp (remove last_admin_reply_at if it doesn't exist)
        const { error: updateError } = await supabase
          .from("chat_sessions")
          .update({
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", chatSession.id); // Use the actual primary key ID

        if (updateError) {
          console.error("Database error updating chat session:", updateError);
        }

        return message;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send admin message",
          cause: error,
        });
      }
    }),

  // Admin ticket message sending
  sendAdminTicketMessage: adminProcedure
    .input(
      z.object({
        ticketId: uuidSchema,
        content: z.string().min(1),
        isInternal: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Verify ticket exists
        const { data: ticket, error: ticketError } = await supabase
          .from("support_tickets")
          .select("id, status")
          .eq("id", input.ticketId)
          .single();

        if (ticketError || !ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
            cause: ticketError,
          });
        }

        // Create the message (ensure chat_session_id is explicitly null for ticket messages)
        const { data: message, error: messageError } = await supabase
          .from("support_messages")
          .insert({
            ticket_id: input.ticketId,
            chat_session_id: null, // Explicitly set to null to avoid any triggers
            sender_id: ctx.session.user.id,
            sender_email: ctx.session.user.email,
            sender_name: ctx.session.user.name,
            sender_type: "admin",
            content: input.content.trim(),
            content_type: "text",
            is_internal: input.isInternal,
            is_automated: false,
          })
          .select("*")
          .single();

        if (messageError) {
          console.error(
            "Database error in sendAdminTicketMessage:",
            messageError,
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create message",
            cause: messageError,
          });
        }

        // Update last admin reply timestamp
        await supabase
          .from("support_tickets")
          .update({
            last_admin_reply_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.ticketId);

        return message;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send admin message",
          cause: error,
        });
      }
    }),

  // Get support categories
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      const supabase = ctx.supabase;

      const { data: categories, error } = await supabase
        .from("support_ticket_categories")
        .select(
          "id, name, description, color, is_active, sort_order, created_at, updated_at",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch categories",
          cause: error,
        });
      }

      return { categories: categories || [] };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
        cause: error,
      });
    }
  }),

  // Get support dashboard data (admin)
  getDashboard: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      // Get ticket statistics
      const [
        { count: totalTickets },
        { count: openTickets },
        { count: inProgressTickets },
        { count: resolvedTickets },
        { count: urgentTickets },
        { count: activeChatSessions },
      ] = await Promise.all([
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "in_progress"),
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "resolved"),
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("priority", "urgent"),
        supabase
          .from("chat_sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
      ]);

      // Get recent tickets
      const { data: recentTickets } = await supabase
        .from("support_tickets")
        .select(
          `
            *,
            category:support_ticket_categories(id, name, color),
            assigned_admin:users!assigned_to(id, name, email)
          `,
        )
        .order("created_at", { ascending: false })
        .limit(10);

      // Get active chat sessions
      const { data: activeChats } = await supabase
        .from("chat_sessions")
        .select(
          `
            *,
            customer:users!customer_id(id, name, email, picture)
          `,
        )
        .eq("status", "active")
        .order("last_activity_at", { ascending: false })
        .limit(10);

      return {
        stats: {
          totalTickets: totalTickets || 0,
          openTickets: openTickets || 0,
          inProgressTickets: inProgressTickets || 0,
          resolvedTickets: resolvedTickets || 0,
          urgentTickets: urgentTickets || 0,
          activeChatSessions: activeChatSessions || 0,
        },
        recentTickets: recentTickets || [],
        activeChats: activeChats || [],
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch dashboard data",
        cause: error,
      });
    }
  }),

  // Get analytics data (admin)
  getAnalytics: adminProcedure
    .input(
      z.object({
        range: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate date range
        const now = new Date();
        const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
        const days = daysMap[input.range];
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Get tickets created in range
        const { data: ticketsInRange } = await supabase
          .from("support_tickets")
          .select("*")
          .gte("created_at", startDate.toISOString());

        // Get resolved tickets in range
        const { data: resolvedInRange } = await supabase
          .from("support_tickets")
          .select("*")
          .gte("resolved_at", startDate.toISOString())
          .not("resolved_at", "is", null);

        // Calculate metrics
        const totalTickets = ticketsInRange?.length || 0;
        const resolvedTickets = resolvedInRange?.length || 0;
        const resolutionRate =
          totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

        // Calculate average resolution time
        const avgResolutionTime =
          resolvedInRange?.reduce((acc: number, ticket: any) => {
            if (ticket.resolved_at && ticket.created_at) {
              const created = new Date(ticket.created_at);
              const resolved = new Date(ticket.resolved_at);
              return acc + (resolved.getTime() - created.getTime());
            }
            return acc;
          }, 0) || 0;

        const avgResolutionHours =
          resolvedTickets > 0
            ? avgResolutionTime / (resolvedTickets * 1000 * 60 * 60)
            : 0;

        return {
          range: input.range,
          overview: {
            total_tickets: totalTickets,
            resolved_tickets: resolvedTickets,
            resolution_rate: Math.round(resolutionRate * 100) / 100,
            avg_resolution_time: Math.round(avgResolutionHours * 100) / 100,
            customer_satisfaction: 4.2, // TODO: Calculate actual satisfaction
            total_chat_sessions: 0, // TODO: Calculate actual chat sessions
            avg_response_time: 15, // TODO: Calculate actual response time in minutes
          },
          trends: {
            tickets_trend: 0, // TODO: Calculate actual trend
            resolution_trend: 0, // TODO: Calculate actual trend
            satisfaction_trend: 0, // TODO: Calculate actual trend
          },
          performance: {
            tickets_by_status: [
              {
                name: "Open",
                value:
                  ticketsInRange?.filter((t: any) => t.status === "open")
                    .length || 0,
              },
              {
                name: "In Progress",
                value:
                  ticketsInRange?.filter((t: any) => t.status === "in_progress")
                    .length || 0,
              },
              {
                name: "Resolved",
                value:
                  ticketsInRange?.filter((t: any) => t.status === "resolved")
                    .length || 0,
              },
              {
                name: "Closed",
                value:
                  ticketsInRange?.filter((t: any) => t.status === "closed")
                    .length || 0,
              },
            ],
            tickets_by_priority: [
              {
                name: "Low",
                value:
                  ticketsInRange?.filter((t: any) => t.priority === "low")
                    .length || 0,
              },
              {
                name: "Medium",
                value:
                  ticketsInRange?.filter((t: any) => t.priority === "medium")
                    .length || 0,
              },
              {
                name: "High",
                value:
                  ticketsInRange?.filter((t: any) => t.priority === "high")
                    .length || 0,
              },
              {
                name: "Urgent",
                value:
                  ticketsInRange?.filter((t: any) => t.priority === "urgent")
                    .length || 0,
              },
            ],
          },
          ticketsByPriority: {
            low:
              ticketsInRange?.filter((t: any) => t.priority === "low").length ||
              0,
            medium:
              ticketsInRange?.filter((t: any) => t.priority === "medium")
                .length || 0,
            high:
              ticketsInRange?.filter((t: any) => t.priority === "high")
                .length || 0,
            urgent:
              ticketsInRange?.filter((t: any) => t.priority === "urgent")
                .length || 0,
          },
          ticketsByStatus: {
            open:
              ticketsInRange?.filter((t: any) => t.status === "open").length ||
              0,
            in_progress:
              ticketsInRange?.filter((t: any) => t.status === "in_progress")
                .length || 0,
            resolved:
              ticketsInRange?.filter((t: any) => t.status === "resolved")
                .length || 0,
            closed:
              ticketsInRange?.filter((t: any) => t.status === "closed")
                .length || 0,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analytics data",
          cause: error,
        });
      }
    }),

  // Send message to ticket (fixed to use correct table)
  sendTicketMessage: adminProcedure
    .input(
      z.object({
        ticketId: uuidSchema,
        content: z.string().min(1).max(5000),
        isInternal: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Create the message using the correct support_messages table (ensure chat_session_id is explicitly null)
        const { data: message, error } = await supabase
          .from("support_messages")
          .insert({
            ticket_id: input.ticketId,
            chat_session_id: null, // Explicitly set to null to avoid any triggers
            content: input.content.trim(),
            content_type: "text",
            is_internal: input.isInternal,
            sender_id: ctx.session?.user?.id,
            sender_name: ctx.session?.user?.name,
            sender_email: ctx.session?.user?.email,
            sender_type: "admin",
            is_automated: false,
          })
          .select()
          .single();

        if (error) {
          console.error("Database error in sendTicketMessage:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send message",
            cause: error,
          });
        }

        // Update ticket's updated_at timestamp and last admin reply
        await supabase
          .from("support_tickets")
          .update({
            updated_at: new Date().toISOString(),
            last_admin_reply_at: new Date().toISOString(),
          })
          .eq("id", input.ticketId);

        return { message };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send ticket message",
          cause: error,
        });
      }
    }),

  // Send message to chat session (admin v2)
  sendChatMessageAdmin: adminProcedure
    .input(
      z.object({
        sessionId: uuidSchema,
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Create the message (ensure ticket_id is explicitly null for chat messages)
        const { data: message, error } = await supabase
          .from("support_messages")
          .insert({
            chat_session_id: input.sessionId,
            ticket_id: null, // Explicitly set to null to avoid any triggers
            content: input.content.trim(),
            content_type: "text",
            sender_type: "admin",
            sender_id: ctx.session?.user?.id,
            sender_email: ctx.session?.user?.email,
            sender_name: ctx.session?.user?.name,
            is_internal: false,
            is_automated: false,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send message",
            cause: error,
          });
        }

        // Update chat session's last_activity_at timestamp
        await supabase
          .from("chat_sessions")
          .update({ last_activity_at: new Date().toISOString() })
          .eq("id", input.sessionId);

        return { message };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send chat message",
          cause: error,
        });
      }
    }),

  // Get chat metrics
  getChatMetrics: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      // Get chat session counts by status
      const { data: chatSessions, error: chatError } = await supabase
        .from("chat_sessions")
        .select("*");

      if (chatError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat sessions",
          cause: chatError,
        });
      }

      const sessions = chatSessions || [];
      const activeSessions = sessions.filter(
        (s: any) => s.status === "active",
      ).length;
      const waitingSessions = sessions.filter(
        (s: any) => s.status === "waiting",
      ).length;
      const closedSessions = sessions.filter(
        (s: any) => s.status === "closed",
      ).length;
      const totalSessions = sessions.length;

      // Calculate average response time (simplified)
      const avgResponseTime = 5; // minutes - placeholder for actual calculation

      // Get ticket metrics as well
      const { data: tickets, error: ticketError } = await supabase
        .from("support_tickets")
        .select("status");

      if (ticketError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tickets",
          cause: ticketError,
        });
      }

      const allTickets = tickets || [];
      const openTickets = allTickets.filter((t: any) =>
        ["open", "in_progress"].includes(t.status),
      ).length;
      const pendingTickets = allTickets.filter(
        (t: any) => t.status === "pending",
      ).length;

      // Get unread notifications count
      const { count: unreadNotifications, error: notificationError } =
        await supabase
          .from("support_notifications")
          .select("*", { count: "exact", head: true })
          .eq("read", false);

      if (notificationError) {
        console.warn("Failed to fetch notification count:", notificationError);
      }

      return {
        active_chats: activeSessions,
        waiting_chats: waitingSessions,
        closed_chats: closedSessions,
        total_chats: totalSessions,
        avg_response_time: avgResponseTime,
        open_tickets: openTickets,
        pending_tickets: pendingTickets,
        unread_notifications: unreadNotifications || 0,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch chat metrics",
        cause: error,
      });
    }
  }),

  // Export tickets to CSV/JSON
  exportTickets: adminProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json"]).default("csv"),
        status: ticketStatusSchema.optional(),
        priority: ticketPrioritySchema.optional(),
        category_id: uuidSchema.optional(),
        assigned_to: uuidSchema.optional(),
        customer_email: z.string().email().optional(),
        search: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Build query
        let query = supabase.from("support_tickets").select(`
            ticket_number,
            subject,
            description,
            status,
            priority,
            customer_email,
            customer_name,
            category:support_ticket_categories(name),
            assigned_to,
            created_at,
            updated_at,
            resolved_at,
            closed_at
          `);

        // Apply filters
        if (input.status) {
          query = query.eq("status", input.status);
        }
        if (input.priority) {
          query = query.eq("priority", input.priority);
        }
        if (input.category_id) {
          query = query.eq("category_id", input.category_id);
        }
        if (input.assigned_to) {
          query = query.eq("assigned_to", input.assigned_to);
        }
        if (input.customer_email) {
          query = query.eq("customer_email", input.customer_email);
        }
        if (input.search) {
          query = query.or(
            `subject.ilike.%${input.search}%,description.ilike.%${input.search}%,customer_email.ilike.%${input.search}%`,
          );
        }

        // Order by created_at desc
        query = query.order("created_at", { ascending: false });

        const { data: tickets, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch tickets for export",
            cause: error,
          });
        }

        // Fetch assigned admin data for each ticket
        const ticketsWithAdminData = await Promise.all(
          (tickets || []).map(async (ticket: any) => {
            let assigned_admin = null;
            if (ticket.assigned_to) {
              const { data: adminData } = await supabase
                .from("users")
                .select("name, email")
                .eq("id", ticket.assigned_to)
                .single();
              assigned_admin = adminData;
            }

            return {
              ...ticket,
              assigned_admin,
            };
          }),
        );

        if (input.format === "csv") {
          // Generate CSV content
          const headers = [
            "Ticket Number",
            "Subject",
            "Description",
            "Status",
            "Priority",
            "Customer Email",
            "Customer Name",
            "Category",
            "Assigned To",
            "Created At",
            "Updated At",
            "Resolved At",
            "Closed At",
          ];

          const csvRows = ticketsWithAdminData.map((ticket: any) => [
            ticket.ticket_number || "",
            `"${(ticket.subject || "").replace(/"/g, '""')}"`,
            `"${(ticket.description || "").replace(/"/g, '""')}"`,
            ticket.status || "",
            ticket.priority || "",
            ticket.customer_email || "",
            ticket.customer_name || "",
            ticket.category?.name || "",
            ticket.assigned_admin?.name || "",
            ticket.created_at || "",
            ticket.updated_at || "",
            ticket.resolved_at || "",
            ticket.closed_at || "",
          ]);

          const csvContent = [
            headers.join(","),
            ...csvRows.map((row) => row.join(",")),
          ].join("\n");

          return {
            format: "csv" as const,
            content: csvContent,
            filename: `support-tickets-${new Date().toISOString().split("T")[0]}.csv`,
            total_count: ticketsWithAdminData.length,
          };
        } else {
          // Return JSON format
          return {
            format: "json" as const,
            tickets: ticketsWithAdminData,
            exported_at: new Date().toISOString(),
            total_count: ticketsWithAdminData.length,
            filters: {
              status: input.status,
              priority: input.priority,
              category_id: input.category_id,
              assigned_to: input.assigned_to,
              customer_email: input.customer_email,
              search: input.search,
            },
          };
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export tickets",
          cause: error,
        });
      }
    }),

  // Bulk operations on tickets
  bulkUpdateTickets: adminProcedure
    .input(
      z.object({
        ticketIds: z.array(uuidSchema).min(1).max(100),
        action: z.enum(["assign", "status", "priority", "category"]),
        value: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const { ticketIds, action, value } = input;

        let updateData: any = {
          updated_at: new Date().toISOString(),
        };

        switch (action) {
          case "assign":
            updateData.assigned_to = value === "unassign" ? null : value;
            break;
          case "status":
            updateData.status = value;
            if (value === "resolved") {
              updateData.resolved_at = new Date().toISOString();
            } else if (value === "closed") {
              updateData.closed_at = new Date().toISOString();
            }
            break;
          case "priority":
            updateData.priority = value;
            break;
          case "category":
            updateData.category_id = value === "none" ? null : value;
            break;
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid bulk action",
            });
        }

        const { data: updatedTickets, error } = await supabase
          .from("support_tickets")
          .update(updateData)
          .in("id", ticketIds)
          .select("id, ticket_number, subject, status, priority");

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update tickets",
            cause: error,
          });
        }

        return {
          success: true,
          updated_count: updatedTickets?.length || 0,
          updated_tickets: updatedTickets || [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to perform bulk update",
          cause: error,
        });
      }
    }),

  // Advanced search across tickets and chats
  search: adminProcedure
    .input(
      z.object({
        query: z.string().min(1),
        type: z.enum(["all", "tickets", "chats"]).default("all"),
        status: z.string().optional(),
        priority: z.string().optional(),
        category_id: uuidSchema.optional(),
        assigned_to: uuidSchema.optional(),
        customer_email: z.string().email().optional(),
        date_range: z
          .object({
            from: z.string().datetime(),
            to: z.string().datetime(),
          })
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const results: {
          tickets: any[];
          chats: any[];
          total: number;
        } = {
          tickets: [],
          chats: [],
          total: 0,
        };

        // Search tickets if type is 'all' or 'tickets'
        if (input.type === "all" || input.type === "tickets") {
          let ticketQuery = supabase
            .from("support_tickets")
            .select(
              `
              *,
              assigned_to_user:assigned_to(id, name, email)
            `,
            )
            .or(
              `ticket_number.ilike.%${input.query}%,subject.ilike.%${input.query}%,description.ilike.%${input.query}%,customer_email.ilike.%${input.query}%,customer_name.ilike.%${input.query}%`,
            );

          // Apply filters
          if (input.status) {
            ticketQuery = ticketQuery.eq("status", input.status);
          }
          if (input.priority) {
            ticketQuery = ticketQuery.eq("priority", input.priority);
          }
          if (input.category_id) {
            ticketQuery = ticketQuery.eq("category_id", input.category_id);
          }
          if (input.assigned_to) {
            ticketQuery = ticketQuery.eq("assigned_to", input.assigned_to);
          }
          if (input.customer_email) {
            ticketQuery = ticketQuery.eq(
              "customer_email",
              input.customer_email,
            );
          }
          if (input.date_range) {
            ticketQuery = ticketQuery
              .gte("created_at", input.date_range.from)
              .lte("created_at", input.date_range.to);
          }

          const { data: tickets, error: ticketError } =
            await ticketQuery.limit(50);

          if (ticketError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to search tickets",
              cause: ticketError,
            });
          }

          results.tickets = tickets || [];
        }

        // Search chats if type is 'all' or 'chats'
        if (input.type === "all" || input.type === "chats") {
          let chatQuery = supabase
            .from("chat_sessions")
            .select(
              `
              *,
              admin:users!admin_id(id, name, email),
              customer:users!customer_id(id, name, email, picture)
            `,
            )
            .or(
              `customer_email.ilike.%${input.query}%,customer_name.ilike.%${input.query}%`,
            );

          // Apply filters
          if (input.status) {
            chatQuery = chatQuery.eq("status", input.status);
          }
          if (input.assigned_to) {
            chatQuery = chatQuery.eq("admin_id", input.assigned_to);
          }
          if (input.customer_email) {
            chatQuery = chatQuery.eq("customer_email", input.customer_email);
          }
          if (input.date_range) {
            chatQuery = chatQuery
              .gte("created_at", input.date_range.from)
              .lte("created_at", input.date_range.to);
          }

          const { data: chats, error: chatError } = await chatQuery.limit(50);

          if (chatError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to search chats",
              cause: chatError,
            });
          }

          results.chats = chats || [];
        }

        results.total = results.tickets.length + results.chats.length;

        return results;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to perform search",
          cause: error,
        });
      }
    }),

  // Get notifications for admin
  getNotifications: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        unread_only: z.boolean().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        let query = supabase
          .from("support_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(input.limit);

        if (input.unread_only) {
          query = query.eq("read", false);
        }

        const { data: notifications, error, count } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch notifications",
            cause: error,
          });
        }

        return {
          notifications: notifications || [],
          total: count || 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
          cause: error,
        });
      }
    }),

  // Mark notification as read
  markNotificationRead: adminProcedure
    .input(
      z.object({
        notificationId: uuidSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("support_notifications")
          .update({ read: true, read_at: new Date().toISOString() })
          .eq("id", input.notificationId);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark notification as read",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
          cause: error,
        });
      }
    }),

  // End chat session
  endChatSession: adminProcedure
    .input(z.object({ sessionId: uuidSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Get the chat session (handle both id and session_id)
        const { data: chatSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("*")
          .or(`id.eq.${input.sessionId},session_id.eq.${input.sessionId}`)
          .single();

        if (sessionError || !chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found",
            cause: sessionError,
          });
        }

        if (chatSession.status === "closed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Chat session is already closed",
          });
        }

        // Update session to end it
        const { error: updateError } = await supabase
          .from("chat_sessions")
          .update({
            status: "closed",
            ended_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", chatSession.id);

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to end chat session",
            cause: updateError,
          });
        }

        return { success: true, sessionId: chatSession.id };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to end chat session",
          cause: error,
        });
      }
    }),
});
