/**
 * Payments tRPC Router
 * Handles payment processing and order management
 */

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  currencySchema,
  paginationSchema,
} from "../schemas/common";
import { createServiceRoleClient } from "@/utils/supabase/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { generateReceiptPDF } from "@/lib/pdf-generator";
import { generateSimpleReceiptPDF } from "@/lib/pdf-generator-simple";
import {
  convertCurrency,
  toPaymentUnit,
  getPaymentGateway,
  type SupportedCurrency,
} from "@/lib/currency";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const paymentsRouter = createTRPCRouter({
  // Create payment order
  createOrder: publicProcedure
    .input(
      z.object({
        serviceId: uuidSchema,
        pricingTierId: uuidSchema.optional(),
        customerEmail: emailSchema,
        customerName: z.string().optional(),
        customerPhone: phoneSchema.optional(),
        notes: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        paymentCurrency: z
          .enum(["USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD", "HKD", "MYR"])
          .default("USD"),
        userCountry: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("[Payments] createOrder called with input:", input);
        const supabase = createServiceRoleClient();

        // Fetch service details
        const { data: service, error: serviceError } = await supabase
          .from("products_services")
          .select(
            `
            *,
            pricing:service_pricing!service_id(*)
          `,
          )
          .eq("id", input.serviceId)
          .eq("published", true)
          .eq("available", true)
          .single();

        if (serviceError || !service) {
          console.error("[Payments] Service lookup failed:", {
            serviceError,
            serviceId: input.serviceId,
          });
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Service not found or unavailable",
            cause: serviceError,
          });
        }

        console.log("[Payments] Service found:", {
          id: service.id,
          title: service.title,
        });

        // Determine pricing
        let selectedPricing: any = null;
        let totalAmount = service.base_price || 0;

        if (input.pricingTierId && service.pricing) {
          selectedPricing = service.pricing.find(
            (p: any) => p.id === input.pricingTierId,
          );
          if (selectedPricing) {
            totalAmount = selectedPricing.price;
          }
        }

        if (totalAmount <= 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid pricing configuration",
          });
        }

        // Convert USD base price to user's payment currency
        const paymentCurrency = input.paymentCurrency as SupportedCurrency;
        const convertedAmount = await convertCurrency(
          totalAmount,
          paymentCurrency,
        );

        console.log(
          `[Payments] Currency conversion: $${totalAmount} USD → ${convertedAmount} ${paymentCurrency}`,
        );

        // Razorpay supports multiple currencies: USD, EUR, GBP, INR, CAD, AUD, SGD, HKD, MYR
        const paymentGateway = getPaymentGateway(paymentCurrency);

        if (paymentGateway !== "razorpay") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Payment gateway ${paymentGateway} for ${paymentCurrency} is not supported. Please contact support.`,
          });
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Prepare Razorpay order options (only for INR)
        const razorpayOptions = {
          amount: toPaymentUnit(convertedAmount, paymentCurrency), // Convert to smallest unit
          currency: paymentCurrency,
          receipt: orderNumber,
          notes: {
            service_id: input.serviceId,
            customer_email: input.customerEmail,
            base_amount_usd: totalAmount,
            converted_amount: convertedAmount,
            user_country: input.userCountry || "Unknown",
            ...(input.metadata || {}),
          },
        };

        console.log("--- Creating Razorpay Order ---");
        console.log("Received input:", input);
        console.log("Razorpay order options:", razorpayOptions);

        // Create Razorpay order with detailed error handling
        let razorpayOrder;
        try {
          razorpayOrder = await razorpay.orders.create(razorpayOptions);
          console.log("Razorpay API Success Response:", razorpayOrder);
        } catch (error) {
          console.error("Razorpay API Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create Razorpay order",
            cause: error,
          });
        }

        // Handle user_id assignment for authenticated vs guest orders
        let validatedUserId = null;
        console.log("[Payments] Session user ID:", ctx.session?.user?.id);

        if (ctx.session?.user?.id) {
          console.log(
            "[Payments] Authenticated user detected, checking if user exists in database...",
          );
          const { data: userExists, error: userCheckError } = await supabase
            .from("users")
            .select("id")
            .eq("id", ctx.session.user.id)
            .single();

          console.log("[Payments] User check result:", {
            userExists,
            userCheckError,
          });

          if (userExists && !userCheckError) {
            validatedUserId = ctx.session.user.id;
            console.log(
              "[Payments] User validated, using user_id:",
              validatedUserId,
            );
          } else {
            console.warn(
              "[Payments] User ID from session not found in users table:",
              {
                sessionUserId: ctx.session.user.id,
                error: userCheckError?.message,
              },
            );
            console.log(
              "[Payments] User not found in database, creating guest order",
            );
            validatedUserId = null;
          }
        } else {
          console.log("[Payments] No session user ID, creating guest order");
          validatedUserId = null;
        }

        console.log("[Payments] Final validatedUserId:", validatedUserId);

        // Create order in database
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            razorpay_order_id: razorpayOrder.id,
            customer_email: input.customerEmail,
            customer_name: input.customerName || null,
            customer_phone: input.customerPhone || null,
            user_id: validatedUserId,
            service_id: input.serviceId,
            pricing_tier_id: input.pricingTierId || null,
            total_amount: totalAmount,
            currency: service.currency || "INR",
            status: "pending",
            notes: input.notes || null,
            metadata: input.metadata || null,
          })
          .select()
          .single();

        if (orderError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
            cause: orderError,
          });
        }

        return {
          order,
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          },
          service: {
            title: service.title,
            description: service.excerpt,
          },
        };
      } catch (error) {
        console.error("[Payments] createOrder error:", error);
        console.error("[Payments] Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          input: input,
        });

        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
          cause: error,
        });
      }
    }),

  // Verify payment
  verifyPayment: publicProcedure
    .input(
      z.object({
        razorpay_payment_id: z.string(),
        razorpay_order_id: z.string(),
        razorpay_signature: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Verify payment signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Payment configuration error",
          });
        }

        const body = input.razorpay_order_id + "|" + input.razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(body.toString())
          .digest("hex");

        if (expectedSignature !== input.razorpay_signature) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid payment signature",
          });
        }

        // Find the order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("razorpay_order_id", input.razorpay_order_id)
          .single();

        if (orderError || !order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
            cause: orderError,
          });
        }

        // Update order status
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)
          .select()
          .single();

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update order status",
            cause: updateError,
          });
        }

        // Create payment record
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: order.id,
          razorpay_payment_id: input.razorpay_payment_id,
          razorpay_order_id: input.razorpay_order_id,
          razorpay_signature: input.razorpay_signature,
          amount: order.total_amount,
          currency: order.currency,
          status: "captured",
          payment_method: "razorpay",
          metadata: {
            razorpay_order_id: input.razorpay_order_id,
            razorpay_signature: input.razorpay_signature,
          },
        });

        if (paymentError) {
          console.error("Failed to create payment record:", paymentError);
          // Don't throw error here as the order is already marked as paid
        }

        return {
          success: true,
          order: updatedOrder,
          paymentId: input.razorpay_payment_id,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify payment",
          cause: error,
        });
      }
    }),

  // Get orders (protected)
  getOrders: protectedProcedure
    .input(
      paginationSchema.extend({
        status: z
          .enum([
            "pending",
            "processing",
            "paid",
            "failed",
            "cancelled",
            "refunded",
            "completed",
          ])
          .optional(),
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

        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("orders")
          .select(
            `
            *,
            service:products_services!service_id(*),
            payments!order_id(*)
          `,
          )
          .eq("user_id", ctx.session.user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply status filter
        if (input.status) {
          query = query.eq("status", input.status);
        }

        const { data: orders, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch orders",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.session.user.id);

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get orders count",
            cause: countError,
          });
        }

        return {
          orders: orders || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders",
          cause: error,
        });
      }
    }),

  // Get single order
  getOrder: protectedProcedure
    .input(z.object({ orderId: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        const { data: order, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            service:products_services!service_id(*),
            payments!order_id(*)
          `,
          )
          .eq("id", input.orderId)
          .eq("user_id", ctx.session.user.id)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
            cause: error,
          });
        }

        return order;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch order",
          cause: error,
        });
      }
    }),

  // Admin procedures
  getAllOrders: adminProcedure
    .input(
      paginationSchema.extend({
        status: z
          .enum([
            "pending",
            "processing",
            "paid",
            "failed",
            "cancelled",
            "refunded",
            "completed",
          ])
          .optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("orders")
          .select(
            `
            *,
            service:products_services!service_id(*),
            payments!order_id(*)
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply filters
        if (input.status) {
          query = query.eq("status", input.status);
        }

        if (input.search) {
          query = query.or(
            `order_number.ilike.%${input.search}%,customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }

        const { data: orders, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch orders",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `order_number.ilike.%${input.search}%,customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get orders count",
            cause: countError,
          });
        }

        return {
          orders: orders || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders",
          cause: error,
        });
      }
    }),

  // Update order status (admin)
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: uuidSchema,
        status: z.enum([
          "pending",
          "processing",
          "paid",
          "failed",
          "cancelled",
          "refunded",
          "completed",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const updateData: any = {
          status: input.status,
          updated_at: new Date().toISOString(),
        };

        // Set completion timestamp if status is completed
        if (input.status === "completed") {
          updateData.completed_at = new Date().toISOString();
        }

        const { data: order, error } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", input.orderId)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update order status",
            cause: error,
          });
        }

        return order;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update order status",
          cause: error,
        });
      }
    }),

  // Get order status
  getOrderStatus: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input, ctx }) => {
      // TODO: Implement order status retrieval
      throw new Error("Not implemented yet");
    }),

  // Admin procedures
  getOrdersAdmin: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
        status: z
          .enum([
            "pending",
            "processing",
            "paid",
            "failed",
            "cancelled",
            "refunded",
            "completed",
          ])
          .optional(),
        customerEmail: z.string().email().optional(),
        dateRange: z
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

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query - check if orders table exists, if not return empty
        let query = supabase
          .from("orders")
          .select(
            `
            *,
            customer:users!user_id(id, name, email, picture)
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply filters
        if (input.status) {
          query = query.eq("status", input.status);
        }

        if (input.customerEmail) {
          query = query.eq("customer_email", input.customerEmail);
        }

        if (input.dateRange) {
          query = query
            .gte("created_at", input.dateRange.from)
            .lte("created_at", input.dateRange.to);
        }

        const { data: orders, error } = await query;

        // If orders table doesn't exist, return empty result
        if (error && error.code === "42P01") {
          return {
            orders: [],
            total: 0,
            page: input.page,
            limit: input.limit,
            totalPages: 0,
          };
        }

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch orders",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }
        if (input.customerEmail) {
          countQuery = countQuery.eq("customer_email", input.customerEmail);
        }
        if (input.dateRange) {
          countQuery = countQuery
            .gte("created_at", input.dateRange.from)
            .lte("created_at", input.dateRange.to);
        }

        const { count, error: countError } = await countQuery;

        if (countError && countError.code !== "42P01") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get orders count",
            cause: countError,
          });
        }

        return {
          orders: orders || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders",
          cause: error,
        });
      }
    }),

  getPayments: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
        status: z
          .enum([
            "pending",
            "processing",
            "paid",
            "failed",
            "cancelled",
            "refunded",
            "completed",
          ])
          .optional(),
        orderId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // TODO: Implement payments retrieval
      throw new Error("Not implemented yet");
    }),

  // Add internal note to order (admin)
  addInternalNote: adminProcedure
    .input(
      z.object({
        orderId: uuidSchema,
        note: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Get current internal notes
        const { data: currentOrder, error: fetchError } = await supabase
          .from("orders")
          .select("internal_notes")
          .eq("id", input.orderId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
            cause: fetchError,
          });
        }

        // Append new note with timestamp
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${input.note}`;
        const updatedNotes = currentOrder.internal_notes
          ? `${currentOrder.internal_notes}\n${newNote}`
          : newNote;

        const { data: order, error } = await supabase
          .from("orders")
          .update({
            internal_notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.orderId)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add internal note",
            cause: error,
          });
        }

        return {
          success: true,
          message: "Internal note added successfully",
          order,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add internal note",
          cause: error,
        });
      }
    }),

  // Get detailed order information for admin
  getOrderDetails: adminProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { supabase } = ctx;

      // STEP 1: Fetch the core order details first.
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          service:products_services!service_id(*, category:service_categories!category_id(*)),
          payments!order_id(*)
        `,
        )
        .eq("id", input.orderId)
        .single();

      if (orderError || !order) {
        console.error("Error fetching order:", orderError);
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // STEP 2: Explicitly look up the user by the email from the order.
      // This is more reliable than relying on a potentially incorrect user_id JOIN.
      let customerData = null;
      if (order.customer_email) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", order.customer_email)
          .maybeSingle(); // Use maybeSingle() as a user might not exist.

        if (userError) {
          console.error(
            `Error fetching user for email ${order.customer_email}:`,
            userError,
          );
        } else {
          customerData = userData;
        }
      }

      // STEP 3: Fetch pricing tier separately if needed
      let pricingTier = null;
      if (order.pricing_tier_id) {
        const { data: tierData } = await supabase
          .from("service_pricing")
          .select("*")
          .eq("id", order.pricing_tier_id)
          .single();
        pricingTier = tierData;
      }

      // STEP 4: Combine the data and return it.
      // The frontend will now have an `order` object with a `customer` property
      // that is populated if an email match was found.
      return {
        ...order,
        customer: customerData, // This will be the user object or null.
        pricing_tier: pricingTier,
      };
    }),

  refundPayment: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        amount: z.number().min(0).optional(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement payment refund
      throw new Error("Not implemented yet");
    }),

  // Enhanced admin endpoints for Sales Dashboard
  getAllOrdersAdmin: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z
          .enum(["pending", "paid", "failed", "refunded", "completed"])
          .optional(),
        customerEmail: z.string().optional(),
        dateRange: z
          .object({
            from: z.string().datetime(),
            to: z.string().datetime(),
          })
          .optional(),
        serviceId: z.string().optional(),
        categoryId: z.string().optional(),
        pricingTierId: z.string().optional(),
        serviceType: z
          .enum(["product", "service", "course", "consultation"])
          .optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Enhanced query with service relationships
        let query = supabase
          .from("orders")
          .select(
            `
            *,
            service:products_services!service_id(
              id, title, slug, service_type, base_price, currency,
              category:service_categories!category_id(id, name, slug)
            )
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply service-aware filters
        if (input.serviceId) {
          query = query.eq("service_id", input.serviceId);
        }
        if (input.status) {
          query = query.eq("status", input.status);
        }
        if (input.customerEmail) {
          query = query.eq("customer_email", input.customerEmail);
        }
        if (input.search) {
          query = query.or(
            `order_number.ilike.%${input.search}%,customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }
        if (input.dateRange) {
          query = query
            .gte("created_at", input.dateRange.from)
            .lte("created_at", input.dateRange.to);
        }

        const { data: orders, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch orders",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Apply same filters for count
        if (input.serviceId) {
          countQuery = countQuery.eq("service_id", input.serviceId);
        }
        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }
        if (input.customerEmail) {
          countQuery = countQuery.eq("customer_email", input.customerEmail);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `order_number.ilike.%${input.search}%,customer_email.ilike.%${input.search}%,customer_name.ilike.%${input.search}%`,
          );
        }
        if (input.dateRange) {
          countQuery = countQuery
            .gte("created_at", input.dateRange.from)
            .lte("created_at", input.dateRange.to);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get orders count",
            cause: countError,
          });
        }

        return {
          orders: orders || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders",
          cause: error,
        });
      }
    }),

  getSalesAnalytics: adminProcedure
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        serviceId: z.string().optional(),
        categoryId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate date range based on period
        const endDate = input.endDate ? new Date(input.endDate) : new Date();
        let startDate: Date;

        if (input.startDate) {
          startDate = new Date(input.startDate);
        } else {
          startDate = new Date();
          switch (input.period) {
            case "7d":
              startDate.setDate(startDate.getDate() - 7);
              break;
            case "30d":
              startDate.setDate(startDate.getDate() - 30);
              break;
            case "90d":
              startDate.setDate(startDate.getDate() - 90);
              break;
            case "1y":
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
          }
        }

        // Query the daily_sales_analytics view
        let analyticsQuery = supabase
          .from("daily_sales_analytics")
          .select("*")
          .gte("date", startDate.toISOString())
          .lte("date", endDate.toISOString())
          .order("date", { ascending: true });

        const { data: analytics, error: analyticsError } = await analyticsQuery;

        if (analyticsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch sales analytics",
            cause: analyticsError,
          });
        }

        // Calculate summary metrics
        const totalRevenue =
          analytics?.reduce(
            (sum: number, day: any) => sum + (day.revenue || 0),
            0,
          ) || 0;
        const totalOrders =
          analytics?.reduce(
            (sum: number, day: any) => sum + (day.order_count || 0),
            0,
          ) || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
          analytics: analytics || [],
          summary: {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            period: input.period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sales analytics",
          cause: error,
        });
      }
    }),

  getServiceSalesPerformance: adminProcedure
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Query the service_sales_performance view
        let performanceQuery = supabase
          .from("service_sales_performance")
          .select("*")
          .order("total_revenue", { ascending: false })
          .limit(input.limit);

        const { data: performance, error: performanceError } =
          await performanceQuery;

        if (performanceError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch service sales performance",
            cause: performanceError,
          });
        }

        return {
          services: performance || [],
          period: input.period,
          limit: input.limit,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service sales performance",
          cause: error,
        });
      }
    }),

  // Get customer purchase summaries (admin)
  getCustomerPurchaseSummaries: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(25),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const { page, limit, search } = input;
        const offset = (page - 1) * limit;

        // Build the query for customer_purchase_summary view
        let query = supabase.from("customer_purchase_summary").select("*");

        // Add search filter if provided
        if (search && search.trim()) {
          query = query.or(
            `customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`,
          );
        }

        // Get total count for pagination - use a simpler approach
        let countQuery = supabase
          .from("customer_purchase_summary")
          .select("customer_email", { count: "exact", head: true });

        // Add search filter to count query if provided
        if (search && search.trim()) {
          countQuery = countQuery.or(
            `customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`,
          );
        }

        const { count: totalCount, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Count error: ${countError.message}`,
            cause: countError,
          });
        }

        // Get paginated data
        const { data: customers, error: customersError } = await query
          .order("total_spent", { ascending: false })
          .range(offset, offset + limit - 1);

        if (customersError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Data fetch error: ${customersError.message}`,
            cause: customersError,
          });
        }

        const totalPages = Math.ceil((totalCount || 0) / limit);

        return {
          customers: customers || [],
          total: totalCount || 0,
          page,
          limit,
          totalPages,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch customer purchase summaries",
          cause: error,
        });
      }
    }),

  // Generate PDF receipt for an order
  generateReceipt: adminProcedure
    .input(z.object({ orderId: uuidSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Fetch the full order details using the same logic as getOrderDetails
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(
            `
            *,
            service:products_services!service_id(
              id, title, slug, service_type, description, base_price, currency,
              category:service_categories!category_id(id, name, slug)
            )
          `,
          )
          .eq("id", input.orderId)
          .single();

        if (orderError || !order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
            cause: orderError,
          });
        }

        // Fetch additional order details
        let customer = null;
        let payments: any[] = [];
        let pricingTier = null;

        // Fetch customer details
        if (order.user_id) {
          const { data: customerData } = await supabase
            .from("users")
            .select("id, name, email, picture")
            .eq("id", order.user_id)
            .single();
          customer = customerData;
        }

        // Fetch payments
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*")
          .eq("order_id", order.id);
        payments = paymentsData || [];

        // Fetch pricing tier
        if (order.pricing_tier_id) {
          const { data: tierData } = await supabase
            .from("service_pricing")
            .select("*")
            .eq("id", order.pricing_tier_id)
            .single();
          pricingTier = tierData;
        }

        const fullOrder = {
          ...order,
          service: order.service,
          customer,
          payments,
          pricing_tier: pricingTier,
        };

        // Generate PDF using React PDF (try simple version first)
        console.log("Attempting to generate simple receipt PDF...");
        const pdfBuffer = await generateSimpleReceiptPDF(fullOrder);

        // Ensure receipts bucket exists
        const targetBucket = "receipts";
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.find(
          (bucket: any) => bucket.name === targetBucket,
        );

        if (!bucketExists) {
          const { error: bucketError } = await supabase.storage.createBucket(
            targetBucket,
            {
              public: true,
              fileSizeLimit: 10 * 1024 * 1024, // 10MB
              allowedMimeTypes: ["application/pdf"],
            },
          );

          if (bucketError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create receipts storage bucket",
              cause: bucketError,
            });
          }
        }

        // Upload PDF to Supabase Storage with cache-busting
        const timestamp = Date.now();
        const fileName = `${order.id}_${timestamp}.pdf`;
        const filePath = `public/${fileName}`;

        // First, try to remove any existing receipt files for this order
        const { data: existingFiles } = await supabase.storage
          .from(targetBucket)
          .list("public", {
            search: order.id,
          });

        if (existingFiles && existingFiles.length > 0) {
          const filesToRemove = existingFiles
            .filter((file: any) => file.name.startsWith(order.id))
            .map((file: any) => `public/${file.name}`);

          if (filesToRemove.length > 0) {
            await supabase.storage.from(targetBucket).remove(filesToRemove);
          }
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(targetBucket)
          .upload(filePath, pdfBuffer, {
            contentType: "application/pdf",
            cacheControl: "0", // Disable caching to ensure fresh content
            upsert: true,
          });

        if (uploadError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload receipt to storage",
            cause: uploadError,
          });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(targetBucket)
          .getPublicUrl(filePath);

        const receiptUrl = urlData.publicUrl;

        // Update order with receipt information
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            receipt_generated: true,
            receipt_url: receiptUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.orderId);

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update order with receipt URL",
            cause: updateError,
          });
        }

        return {
          receipt_url: receiptUrl,
          success: true,
        };
      } catch (error) {
        console.error("Receipt generation error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate receipt",
          cause: error,
        });
      }
    }),
});
