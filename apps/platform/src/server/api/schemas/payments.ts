/**
 * Payments tRPC Schemas
 * Validation schemas for payment and order operations
 */

import { z } from "zod";
import { emailSchema, uuidSchema } from "./common";

// Order creation schemas
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      service_id: uuidSchema,
      quantity: z.number().min(1).default(1),
      price: z.number().min(0),
    }),
  ),
  customer_email: emailSchema,
  customer_name: z.string().optional(),
  billing_address: z
    .object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string(),
    })
    .optional(),
  payment_method: z.enum(["stripe", "paypal"]).default("stripe"),
  currency: z.string().length(3).default("USD"),
});

export const updateOrderSchema = z.object({
  id: uuidSchema,
  status: z
    .enum(["pending", "processing", "completed", "cancelled", "refunded"])
    .optional(),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
});

// Payment processing schemas
export const processPaymentSchema = z.object({
  order_id: uuidSchema,
  payment_method_id: z.string(),
  save_payment_method: z.boolean().default(false),
});

export const refundPaymentSchema = z.object({
  order_id: uuidSchema,
  amount: z.number().min(0).optional(), // If not provided, full refund
  reason: z.string().optional(),
});

// Order retrieval schemas
export const getOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z
    .enum(["pending", "processing", "completed", "cancelled", "refunded"])
    .optional(),
  customer_email: emailSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const getOrderSchema = z.object({
  id: uuidSchema,
});

export const getOrdersByCustomerSchema = z.object({
  customer_email: emailSchema,
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Admin order management schemas
export const getOrdersAdminSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z
    .enum(["pending", "processing", "completed", "cancelled", "refunded"])
    .optional(),
  customerEmail: emailSchema.optional(),
  search: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Webhook schemas
export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
  created: z.number(),
});

// Analytics schemas
export const getRevenueAnalyticsSchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("month"),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Response schemas
export const orderItemSchema = z.object({
  id: uuidSchema,
  order_id: uuidSchema,
  service_id: uuidSchema,
  service_name: z.string(),
  service_slug: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
});

export const orderSchema = z.object({
  id: uuidSchema,
  customer_email: emailSchema,
  customer_name: z.string().nullable(),
  status: z.enum([
    "pending",
    "processing",
    "completed",
    "cancelled",
    "refunded",
  ]),
  total_amount: z.number(),
  currency: z.string(),
  payment_method: z.enum(["stripe", "paypal"]),
  payment_intent_id: z.string().nullable(),
  tracking_number: z.string().nullable(),
  notes: z.string().nullable(),
  billing_address: z
    .object({
      line1: z.string(),
      line2: z.string().nullable(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string(),
    })
    .nullable(),
  items: z.array(orderItemSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});

export const paymentSchema = z.object({
  id: uuidSchema,
  order_id: uuidSchema,
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["pending", "succeeded", "failed", "cancelled", "refunded"]),
  payment_method: z.enum(["stripe", "paypal"]),
  payment_intent_id: z.string().nullable(),
  refund_id: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const revenueAnalyticsSchema = z.object({
  period: z.string(),
  data: z.array(
    z.object({
      date: z.string(),
      revenue: z.number(),
      orders: z.number(),
      avg_order_value: z.number(),
    }),
  ),
  totals: z.object({
    revenue: z.number(),
    orders: z.number(),
    avg_order_value: z.number(),
  }),
});

// Paginated responses
export const paginatedOrdersSchema = z.object({
  orders: z.array(orderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedPaymentsSchema = z.object({
  payments: z.array(paymentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
