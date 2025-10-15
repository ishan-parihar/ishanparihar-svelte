/**
 * Services tRPC Router
 * Handles services/products operations
 */

import { createTRPCRouter, publicProcedure, adminProcedure } from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  uuidSchema,
  slugSchema,
  paginationSchema,
  currencySchema,
  serviceTypeSchema,
  pricingTypeSchema,
  billingPeriodSchema,
} from "../schemas/common";
import { createServiceRoleClient } from "@/utils/supabase/server";

export const servicesRouter = createTRPCRouter({
  // Public procedures
  getServices: publicProcedure
    .input(
      paginationSchema.extend({
        category: z.string().optional(),
        featured: z.boolean().optional(),
        serviceType: serviceTypeSchema.optional(),
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
          .from("products_services")
          .select(
            `
            *,
            category:service_categories!category_id(*)
          `,
          )
          .eq("published", true)
          .eq("available", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply filters
        if (input.featured !== undefined) {
          query = query.eq("featured", input.featured);
        }

        if (input.category) {
          // Filter by category slug through join
          query = query.eq("service_categories.slug", input.category);
        }

        if (input.serviceType) {
          query = query.eq("service_type", input.serviceType);
        }

        if (input.search) {
          query = query.or(
            `title.ilike.%${input.search}%,excerpt.ilike.%${input.search}%,description.ilike.%${input.search}%`,
          );
        }

        const { data: services, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch services",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("products_services")
          .select("*", { count: "exact", head: true })
          .eq("published", true)
          .eq("available", true);

        if (input.featured !== undefined) {
          countQuery = countQuery.eq("featured", input.featured);
        }
        if (input.category) {
          countQuery = countQuery.eq("service_categories.slug", input.category);
        }
        if (input.serviceType) {
          countQuery = countQuery.eq("service_type", input.serviceType);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `title.ilike.%${input.search}%,excerpt.ilike.%${input.search}%,description.ilike.%${input.search}%`,
          );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get services count",
            cause: countError,
          });
        }

        return {
          services: services || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch services",
          cause: error,
        });
      }
    }),

  getService: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: service, error } = await supabase
          .from("products_services")
          .select(
            `
            *,
            category:service_categories!category_id(*),
            pricing:service_pricing!service_id(*)
          `,
          )
          .eq("slug", input.slug)
          .eq("published", true)
          .eq("available", true)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Service not found",
            cause: error,
          });
        }

        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service",
          cause: error,
        });
      }
    }),

  getServiceCategories: publicProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: categories, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service categories",
          cause: error,
        });
      }

      return categories || [];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch service categories",
        cause: error,
      });
    }
  }),

  // Admin procedures
  getServiceAdmin: adminProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: service, error } = await supabase
          .from("products_services")
          .select(
            `
            *,
            category:service_categories!category_id(*),
            pricing:service_pricing!service_id(*)
          `,
          )
          .eq("slug", input.slug)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Service not found",
            cause: error,
          });
        }

        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service",
          cause: error,
        });
      }
    }),

  getServiceAdminById: adminProcedure
    .input(z.object({ id: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: service, error } = await supabase
          .from("products_services")
          .select(
            `
            *,
            category:service_categories!category_id(*),
            pricing:service_pricing!service_id(*)
          `,
          )
          .eq("id", input.id)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Service not found",
            cause: error,
          });
        }

        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service",
          cause: error,
        });
      }
    }),

  createService: adminProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        slug: slugSchema,
        excerpt: z.string().min(10).max(500),
        description: z.string().min(50),
        coverImage: z.string().url().optional(),
        categoryId: uuidSchema.optional(),
        serviceType: serviceTypeSchema,
        basePrice: z.number().min(0).optional(),
        currency: currencySchema,
        pricingType: pricingTypeSchema,
        billingPeriod: billingPeriodSchema.optional(),
        available: z.boolean().default(true),
        featured: z.boolean().default(false),
        premium: z.boolean().default(false),
        published: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
        metaTitle: z.string().max(60).optional(),
        metaDescription: z.string().max(160).optional(),
        keywords: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Check if slug already exists
        const { data: existingService, error: checkError } = await supabase
          .from("products_services")
          .select("id")
          .eq("slug", input.slug)
          .maybeSingle();

        if (checkError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check existing service",
            cause: checkError,
          });
        }

        if (existingService) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A service with this slug already exists",
          });
        }

        // Create the service
        const { data: service, error } = await supabase
          .from("products_services")
          .insert({
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            description: input.description,
            cover_image: input.coverImage || null,
            category_id: input.categoryId || null,
            service_type: input.serviceType,
            base_price: input.basePrice || null,
            currency: input.currency,
            pricing_type: input.pricingType,
            billing_period: input.billingPeriod || null,
            available: input.available,
            featured: input.featured,
            premium: input.premium,
            published: input.published,
            sort_order: input.sortOrder,
            meta_title: input.metaTitle || null,
            meta_description: input.metaDescription || null,
            keywords: input.keywords || null,
            author_user_id: ctx.session?.user?.id || null,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create service",
            cause: error,
          });
        }

        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create service",
          cause: error,
        });
      }
    }),

  updateService: adminProcedure
    .input(
      z.object({
        id: uuidSchema,
        title: z.string().min(5).max(200).optional(),
        slug: slugSchema.optional(),
        excerpt: z.string().min(10).max(500).optional(),
        description: z.string().min(50).optional(),
        coverImage: z.string().url().optional(),
        categoryId: uuidSchema.optional(),
        serviceType: serviceTypeSchema.optional(),
        basePrice: z.number().min(0).optional(),
        currency: currencySchema.optional(),
        pricingType: pricingTypeSchema.optional(),
        billingPeriod: billingPeriodSchema.optional(),
        available: z.boolean().optional(),
        featured: z.boolean().optional(),
        premium: z.boolean().optional(),
        published: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        metaTitle: z.string().max(60).optional(),
        metaDescription: z.string().max(160).optional(),
        keywords: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { id, ...updateData } = input;

        // If slug is being updated, check if it already exists
        if (input.slug) {
          const { data: existingService, error: checkError } = await supabase
            .from("products_services")
            .select("id")
            .eq("slug", input.slug)
            .neq("id", id)
            .maybeSingle();

          if (checkError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to check existing service",
              cause: checkError,
            });
          }

          if (existingService) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A service with this slug already exists",
            });
          }
        }

        // Build update object
        const updateObject: any = {
          updated_at: new Date().toISOString(),
        };

        if (updateData.title !== undefined)
          updateObject.title = updateData.title;
        if (updateData.slug !== undefined) updateObject.slug = updateData.slug;
        if (updateData.excerpt !== undefined)
          updateObject.excerpt = updateData.excerpt;
        if (updateData.description !== undefined)
          updateObject.description = updateData.description;
        if (updateData.coverImage !== undefined)
          updateObject.cover_image = updateData.coverImage;
        if (updateData.categoryId !== undefined)
          updateObject.category_id = updateData.categoryId;
        if (updateData.serviceType !== undefined)
          updateObject.service_type = updateData.serviceType;
        if (updateData.basePrice !== undefined)
          updateObject.base_price = updateData.basePrice;
        if (updateData.currency !== undefined)
          updateObject.currency = updateData.currency;
        if (updateData.pricingType !== undefined)
          updateObject.pricing_type = updateData.pricingType;
        if (updateData.billingPeriod !== undefined)
          updateObject.billing_period = updateData.billingPeriod;
        if (updateData.available !== undefined)
          updateObject.available = updateData.available;
        if (updateData.featured !== undefined)
          updateObject.featured = updateData.featured;
        if (updateData.premium !== undefined)
          updateObject.premium = updateData.premium;
        if (updateData.published !== undefined)
          updateObject.published = updateData.published;
        if (updateData.sortOrder !== undefined)
          updateObject.sort_order = updateData.sortOrder;
        if (updateData.metaTitle !== undefined)
          updateObject.meta_title = updateData.metaTitle;
        if (updateData.metaDescription !== undefined)
          updateObject.meta_description = updateData.metaDescription;
        if (updateData.keywords !== undefined)
          updateObject.keywords = updateData.keywords;

        const { data: service, error } = await supabase
          .from("products_services")
          .update(updateObject)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update service",
            cause: error,
          });
        }

        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update service",
          cause: error,
        });
      }
    }),

  deleteService: adminProcedure
    .input(z.object({ id: uuidSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("products_services")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete service",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete service",
          cause: error,
        });
      }
    }),

  updateServiceAdmin: adminProcedure
    .input(
      z.object({
        id: uuidSchema,
        title: z.string().min(5).max(200).optional(),
        excerpt: z.string().min(10).max(500).optional(),
        description: z.string().min(50).optional(),
        available: z.boolean().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { id, ...updateData } = input;

        // Build update object
        const updateObject: any = {
          updated_at: new Date().toISOString(),
        };

        if (updateData.title !== undefined)
          updateObject.title = updateData.title;
        if (updateData.excerpt !== undefined)
          updateObject.excerpt = updateData.excerpt;
        if (updateData.description !== undefined)
          updateObject.description = updateData.description;
        if (updateData.available !== undefined)
          updateObject.available = updateData.available;
        if (updateData.featured !== undefined)
          updateObject.featured = updateData.featured;
        if (updateData.published !== undefined)
          updateObject.published = updateData.published;

        const { data: service, error } = await supabase
          .from("products_services")
          .update(updateObject)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update service",
            cause: error,
          });
        }

        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update service",
          cause: error,
        });
      }
    }),

  deleteServiceAdmin: adminProcedure
    .input(z.object({ id: uuidSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("products_services")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete service",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete service",
          cause: error,
        });
      }
    }),

  // Admin-specific procedure to get services (including unpublished)
  getServicesAdmin: adminProcedure
    .input(
      paginationSchema.extend({
        category: z.string().optional(),
        featured: z.boolean().optional(),
        serviceType: serviceTypeSchema.optional(),
        search: z.string().optional(),
        includeUnpublished: z.boolean().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("products_services")
          .select(
            `
            *,
            category:service_categories!category_id(*)
          `,
          )
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // For admin, optionally include unpublished services
        if (!input.includeUnpublished) {
          query = query.eq("published", true);
        }

        // Apply filters
        if (input.featured !== undefined) {
          query = query.eq("featured", input.featured);
        }

        if (input.category) {
          // Filter by category slug through join
          query = query.eq("service_categories.slug", input.category);
        }

        if (input.serviceType) {
          query = query.eq("service_type", input.serviceType);
        }

        if (input.search) {
          query = query.or(
            `title.ilike.%${input.search}%,excerpt.ilike.%${input.search}%,description.ilike.%${input.search}%`,
          );
        }

        const { data: services, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch admin services",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("products_services")
          .select("*", { count: "exact", head: true });

        if (!input.includeUnpublished) {
          countQuery = countQuery.eq("published", true);
        }

        if (input.featured !== undefined) {
          countQuery = countQuery.eq("featured", input.featured);
        }
        if (input.category) {
          countQuery = countQuery.eq("service_categories.slug", input.category);
        }
        if (input.serviceType) {
          countQuery = countQuery.eq("service_type", input.serviceType);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `title.ilike.%${input.search}%,excerpt.ilike.%${input.search}%,description.ilike.%${input.search}%`,
          );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to count admin services",
            cause: countError,
          });
        }

        return {
          services: services || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin services",
          cause: error,
        });
      }
    }),
});
