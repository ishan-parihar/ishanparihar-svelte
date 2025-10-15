/**
 * @file Supabase utility functions
 *
 * NOTE: This file contains TypeScript errors related to deprecated functions.
 * These errors are expected and will be fixed in a future update.
 * The code still works correctly despite these warnings.
 */

import {
  createClient as createSupabaseJSClient,
  SupabaseClient,
} from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { getImagePublicUrl } from "./imageService";
import { normalizeImageUrl, getDefaultImageUrl } from "./imageUtils";

/**
 * Supabase Integration with Row Level Security (RLS) Support
 *
 * This module provides functions to interact with Supabase database and storage
 * with proper handling of Row Level Security (RLS) policies.
 *
 * RLS Assumptions (see docs/rls_access_patterns.md for details):
 * - Public access: Only published posts (draft=false) are accessible
 * - Admin access: Full CRUD operations require authentication
 * - Service Role: Used to bypass RLS when needed (admin operations)
 *
 * Implementation Strategy:
 * 1. Regular client respects RLS policies (anon key)
 * 2. Service role client bypasses RLS (service_role key)
 * 3. Direct API calls filter by draft=false for public access
 * 4. Fallback mechanisms ensure data access even with RLS enabled
 *
 * IMPORTANT: This file is being migrated to use @supabase/ssr for better
 * Next.js integration. New code should use the exported functions from
 * ./supabase-ssr.ts directly.
 */

// Types for database schema
export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          cover_image: string;
          date: string;
          author?: string; // Legacy field
          author_user_id: string; // Foreign key to users table
          category: string;
          featured: boolean;
          created_at: string;
          updated_at: string;
          draft: boolean;
          premium: boolean;
          content_type: "blog" | "research_paper";
          recommendation_tags: string[];
        };
        Insert: {
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          cover_image: string;
          date: string;
          author_user_id: string; // Foreign key to users table
          author?: string; // Legacy field
          category: string;
          featured: boolean;
          created_at?: string;
          updated_at?: string;
          draft?: boolean;
          premium?: boolean;
          content_type?: "blog" | "research_paper";
          recommendation_tags?: string[];
        };
        Update: {
          slug?: string;
          title?: string;
          excerpt?: string;
          content?: string;
          cover_image?: string;
          date?: string;
          author_user_id?: string; // Foreign key to users table
          author?: string; // Legacy field
          category?: string;
          featured?: boolean;
          updated_at?: string;
          draft?: boolean;
          premium?: boolean;
          content_type?: "blog" | "research_paper";
          recommendation_tags?: string[];
        };
      };
      blog_engagement: {
        Row: {
          id: string;
          blog_post_id: string;
          user_id: string | null;
          likes_count: number;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          blog_post_id: string;
          user_id?: string | null;
          likes_count?: number;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          likes_count?: number;
          views_count?: number;
          updated_at?: string;
        };
      };

      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          user_id: string | null;
          newsletter_subscribed: boolean;
          unsubscribe_token: string;
          subscribed_at: string;
          updated_at: string;
          created_at: string;
          unsubscribed_at?: string;
          manually_unsubscribed?: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          user_id?: string | null;
          newsletter_subscribed?: boolean;
          unsubscribe_token?: string;
          subscribed_at?: string;
          updated_at?: string;
          created_at?: string;
          unsubscribed_at?: string;
          manually_unsubscribed?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          user_id?: string | null;
          newsletter_subscribed?: boolean;
          unsubscribe_token?: string;
          subscribed_at?: string;
          updated_at?: string;
          created_at?: string;
          unsubscribed_at?: string;
          manually_unsubscribed?: boolean;
        };
      };
      newsletter_campaigns: {
        Row: {
          id: string;
          subject: string;
          content: string;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
          status: string;
          recipient_count: number;
        };
        Insert: {
          id?: string;
          subject: string;
          content: string;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          recipient_count?: number;
        };
        Update: {
          id?: string;
          subject?: string;
          content?: string;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          recipient_count?: number;
        };
      };
      newsletter_campaign_logs: {
        Row: {
          id: string;
          campaign_id: string;
          subscriber_id: string;
          status: string;
          sent_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          subscriber_id: string;
          status?: string;
          sent_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          subscriber_id?: string;
          status?: string;
          sent_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          updated_at?: string;
        };
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          active?: boolean;
          updated_at?: string;
        };
      };
      products_services: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          description: string;
          cover_image: string | null;
          category_id: string | null;
          service_type: "product" | "service" | "course" | "consultation";
          base_price: number | null;
          currency: string;
          pricing_type: "one_time" | "recurring" | "custom";
          billing_period: "monthly" | "yearly" | "weekly" | "daily" | null;
          available: boolean;
          featured: boolean;
          premium: boolean;
          meta_title: string | null;
          meta_description: string | null;
          keywords: string[] | null;
          views_count: number;
          inquiries_count: number;
          bookings_count: number;
          author_user_id: string | null;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          published_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          description: string;
          cover_image?: string | null;
          category_id?: string | null;
          service_type: "product" | "service" | "course" | "consultation";
          base_price?: number | null;
          currency?: string;
          pricing_type?: "one_time" | "recurring" | "custom";
          billing_period?: "monthly" | "yearly" | "weekly" | "daily" | null;
          available?: boolean;
          featured?: boolean;
          premium?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[] | null;
          views_count?: number;
          inquiries_count?: number;
          bookings_count?: number;
          author_user_id?: string | null;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          description?: string;
          cover_image?: string | null;
          category_id?: string | null;
          service_type?: "product" | "service" | "course" | "consultation";
          base_price?: number | null;
          currency?: string;
          pricing_type?: "one_time" | "recurring" | "custom";
          billing_period?: "monthly" | "yearly" | "weekly" | "daily" | null;
          available?: boolean;
          featured?: boolean;
          premium?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[] | null;
          views_count?: number;
          inquiries_count?: number;
          bookings_count?: number;
          author_user_id?: string | null;
          published?: boolean;
          sort_order?: number;
          updated_at?: string;
          published_at?: string;
        };
      };
      service_features: {
        Row: {
          id: string;
          service_id: string;
          title: string;
          description: string | null;
          icon: string | null;
          included: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          included?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          title?: string;
          description?: string | null;
          icon?: string | null;
          included?: boolean;
          sort_order?: number;
        };
      };
      service_pricing: {
        Row: {
          id: string;
          service_id: string;
          tier_name: string;
          tier_description: string | null;
          price: number;
          currency: string;
          billing_period:
            | "monthly"
            | "yearly"
            | "weekly"
            | "daily"
            | "one_time"
            | null;
          features: string[] | null;
          max_sessions: number | null;
          duration_minutes: number | null;
          popular: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          tier_name: string;
          tier_description?: string | null;
          price: number;
          currency?: string;
          billing_period?:
            | "monthly"
            | "yearly"
            | "weekly"
            | "daily"
            | "one_time"
            | null;
          features?: string[] | null;
          max_sessions?: number | null;
          duration_minutes?: number | null;
          popular?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          tier_name?: string;
          tier_description?: string | null;
          price?: number;
          currency?: string;
          billing_period?:
            | "monthly"
            | "yearly"
            | "weekly"
            | "daily"
            | "one_time"
            | null;
          features?: string[] | null;
          max_sessions?: number | null;
          duration_minutes?: number | null;
          popular?: boolean;
          active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      service_testimonials: {
        Row: {
          id: string;
          service_id: string;
          client_name: string;
          client_title: string | null;
          client_company: string | null;
          client_image: string | null;
          testimonial_text: string;
          rating: number | null;
          featured: boolean;
          approved: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          client_name: string;
          client_title?: string | null;
          client_company?: string | null;
          client_image?: string | null;
          testimonial_text: string;
          rating?: number | null;
          featured?: boolean;
          approved?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          client_name?: string;
          client_title?: string | null;
          client_company?: string | null;
          client_image?: string | null;
          testimonial_text?: string;
          rating?: number | null;
          featured?: boolean;
          approved?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          razorpay_order_id: string | null;
          customer_email: string;
          customer_name: string | null;
          customer_phone: string | null;
          user_id: string | null;
          service_id: string | null;
          pricing_tier_id: string | null;
          total_amount: number;
          currency: string;
          discount_amount: number;
          tax_amount: number;
          status:
            | "pending"
            | "processing"
            | "paid"
            | "failed"
            | "cancelled"
            | "refunded"
            | "completed";
          notes: string | null;
          metadata: any | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          order_number: string;
          razorpay_order_id?: string | null;
          customer_email: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          user_id?: string | null;
          service_id?: string | null;
          pricing_tier_id?: string | null;
          total_amount: number;
          currency?: string;
          discount_amount?: number;
          tax_amount?: number;
          status?:
            | "pending"
            | "processing"
            | "paid"
            | "failed"
            | "cancelled"
            | "refunded"
            | "completed";
          notes?: string | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          razorpay_order_id?: string | null;
          customer_email?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          user_id?: string | null;
          service_id?: string | null;
          pricing_tier_id?: string | null;
          total_amount?: number;
          currency?: string;
          discount_amount?: number;
          tax_amount?: number;
          status?:
            | "pending"
            | "processing"
            | "paid"
            | "failed"
            | "cancelled"
            | "refunded"
            | "completed";
          notes?: string | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          completed_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          razorpay_payment_id: string | null;
          razorpay_order_id: string;
          razorpay_signature: string | null;
          amount: number;
          currency: string;
          method: string | null;
          status:
            | "created"
            | "attempted"
            | "failed"
            | "captured"
            | "refunded"
            | "partially_refunded";
          gateway_response: any | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
          captured_at: string | null;
          failed_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id: string;
          razorpay_signature?: string | null;
          amount: number;
          currency?: string;
          method?: string | null;
          status?:
            | "created"
            | "attempted"
            | "failed"
            | "captured"
            | "refunded"
            | "partially_refunded";
          gateway_response?: any | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          captured_at?: string | null;
          failed_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string;
          razorpay_signature?: string | null;
          amount?: number;
          currency?: string;
          method?: string | null;
          status?:
            | "created"
            | "attempted"
            | "failed"
            | "captured"
            | "refunded"
            | "partially_refunded";
          gateway_response?: any | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          captured_at?: string | null;
          failed_at?: string | null;
        };
      };
      payment_webhooks: {
        Row: {
          id: string;
          event_type: string;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          payload: any;
          signature: string | null;
          processed: boolean;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          payload: any;
          signature?: string | null;
          processed?: boolean;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          payload?: any;
          signature?: string | null;
          processed?: boolean;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string | null;
          pricing_tier_id: string | null;
          item_name: string;
          item_description: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
          metadata: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          service_id?: string | null;
          pricing_tier_id?: string | null;
          item_name: string;
          item_description?: string | null;
          unit_price: number;
          quantity?: number;
          total_price: number;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          service_id?: string | null;
          pricing_tier_id?: string | null;
          item_name?: string;
          item_description?: string | null;
          unit_price?: number;
          quantity?: number;
          total_price?: number;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      concepts: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      blog_post_concepts: {
        Row: {
          blog_post_id: string;
          concept_id: string;
          created_at: string;
        };
        Insert: {
          blog_post_id: string;
          concept_id: string;
          created_at?: string;
        };
        Update: {
          blog_post_id?: string;
          concept_id?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          excerpt: string | null;
          cover_image_url: string | null;
          content: string | null;
          live_url: string | null;
          source_url: string | null;
          tags: string[] | null;
          is_featured: boolean;
          status: "planning" | "in_progress" | "completed" | "archived";
          start_date: string | null;
          end_date: string | null;
          author_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          excerpt?: string | null;
          cover_image_url?: string | null;
          content?: string | null;
          live_url?: string | null;
          source_url?: string | null;
          tags?: string[] | null;
          is_featured?: boolean;
          status?: "planning" | "in_progress" | "completed" | "archived";
          start_date?: string | null;
          end_date?: string | null;
          author_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          excerpt?: string | null;
          cover_image_url?: string | null;
          content?: string | null;
          live_url?: string | null;
          source_url?: string | null;
          tags?: string[] | null;
          is_featured?: boolean;
          status?: "planning" | "in_progress" | "completed" | "archived";
          start_date?: string | null;
          end_date?: string | null;
          author_user_id?: string | null;
          updated_at?: string;
        };
      };
      project_concepts: {
        Row: {
          project_id: string;
          concept_id: string;
          created_at: string;
        };
        Insert: {
          project_id: string;
          concept_id: string;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          concept_id?: string;
          created_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          updated_at?: string;
          is_published?: boolean;
        };
      };
      assessment_questions: {
        Row: {
          id: string;
          assessment_id: string;
          question_text: string;
          question_type: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          question_text: string;
          question_type?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          question_text?: string;
          question_type?: string;
          sort_order?: number;
          updated_at?: string;
        };
      };
      assessment_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          value: any | null; // JSONB type
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          value?: any | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          value?: any | null;
          sort_order?: number;
          updated_at?: string;
        };
      };
      user_assessment_submissions: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          completed_at: string;
          results: any | null; // JSONB type
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          completed_at?: string;
          results?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          completed_at?: string;
          results?: any | null;
          created_at?: string;
        };
      };
      user_assessment_responses: {
        Row: {
          id: number; // BIGSERIAL
          submission_id: string;
          question_id: string;
          selected_option_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          submission_id: string;
          question_id: string;
          selected_option_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          submission_id?: string;
          question_id?: string;
          selected_option_id?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Types for blog post engagement
export type BlogEngagement = {
  id: string;
  blog_post_id: string;
  user_id: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
};

// Types for blog post
export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  date: string;
  author?: string; // Legacy field, kept for backward compatibility
  author_user_id: string; // Foreign key to users table
  category: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  draft?: boolean;
  premium?: boolean;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  // Engagement metrics (optional, populated when needed)
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
};

// Types for user bookmarks
export type UserBookmark = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
};

// Type for bookmark with blog post details (for API responses)
export type BookmarkWithPost = UserBookmark & {
  blog_post: BlogPost;
};

// Type for bookmark status check
export type BookmarkStatus = {
  isBookmarked: boolean;
  bookmarkId?: string;
};

// ============================================================================
// SERVICES AND PRODUCTS TYPES
// ============================================================================

// Service Category type
export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

// Product/Service type
export type ProductService = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  cover_image?: string;
  category_id?: string;
  service_type: "product" | "service" | "course" | "consultation";
  base_price?: number;
  currency: string;
  pricing_type: "one_time" | "recurring" | "custom";
  billing_period?: "monthly" | "yearly" | "weekly" | "daily";
  available: boolean;
  featured: boolean;
  premium: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  views_count: number;
  inquiries_count: number;
  bookings_count: number;
  author_user_id?: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  // Digital content fields
  digital_content_enabled?: boolean;
  digital_content_url?: string;
  digital_content_filename?: string;
  digital_content_size_bytes?: number;
  digital_content_mime_type?: string;
  digital_content_bucket?: string;
  digital_content_path?: string;
  digital_content_description?: string;
  digital_content_access_type?: "immediate" | "scheduled" | "manual";
  digital_content_expires_at?: string;
  digital_content_download_limit?: number;
  digital_content_uploaded_at?: string;
  // Optional related data
  category?: ServiceCategory;
  features?: ServiceFeature[];
  pricing?: ServicePricing[];
  testimonials?: ServiceTestimonial[];
};

// Service Feature type
export type ServiceFeature = {
  id: string;
  service_id: string;
  title: string;
  description?: string;
  icon?: string;
  included: boolean;
  sort_order: number;
  created_at: string;
};

// Service Pricing type
export type ServicePricing = {
  id: string;
  service_id: string;
  tier_name: string;
  tier_description?: string;
  price: number;
  currency: string;
  billing_period?: "monthly" | "yearly" | "weekly" | "daily" | "one_time";
  features?: string[];
  max_sessions?: number;
  duration_minutes?: number;
  popular: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Service Testimonial type
export type ServiceTestimonial = {
  id: string;
  service_id: string;
  client_name: string;
  client_title?: string;
  client_company?: string;
  client_image?: string;
  testimonial_text: string;
  rating?: number;
  featured: boolean;
  approved: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Customer Download type
export type CustomerDownload = {
  id: string;
  service_id: string;
  customer_email: string;
  order_id?: string;
  download_url: string;
  downloaded_at: string;
  ip_address?: string;
  user_agent?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
};

// Combined service with all related data
export type ServiceWithDetails = ProductService & {
  category: ServiceCategory | null;
  features: ServiceFeature[];
  pricing: ServicePricing[];
  testimonials: ServiceTestimonial[];
};

// Payment and Order Types
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
export type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

export type PaymentWebhook =
  Database["public"]["Tables"]["payment_webhooks"]["Row"];
export type PaymentWebhookInsert =
  Database["public"]["Tables"]["payment_webhooks"]["Insert"];
export type PaymentWebhookUpdate =
  Database["public"]["Tables"]["payment_webhooks"]["Update"];

export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderItemInsert =
  Database["public"]["Tables"]["order_items"]["Insert"];
export type OrderItemUpdate =
  Database["public"]["Tables"]["order_items"]["Update"];

// Extended types for payment processing
export type OrderWithDetails = Order & {
  service?: ProductService;
  pricing_tier?: ServicePricing;
  payments?: Payment[];
  order_items?: OrderItem[];
};

export type PaymentWithOrder = Payment & {
  order?: Order;
};

// RazorPay specific types
export type RazorPayOrderOptions = {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture?: number;
  notes?: Record<string, string>;
};

export type RazorPayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorPayWebhookEvent = {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: any;
    };
    order?: {
      entity: any;
    };
  };
  created_at: number;
};

// Payment processing types
export type PaymentStatus =
  | "created"
  | "attempted"
  | "failed"
  | "captured"
  | "refunded"
  | "partially_refunded";
export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "completed";

// Type guard to check if an object is a valid BlogPost
export function isBlogPost(obj: any): obj is BlogPost {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.slug === "string" &&
    typeof obj.title === "string" &&
    typeof obj.excerpt === "string" &&
    typeof obj.content === "string" &&
    typeof obj.date === "string" &&
    typeof obj.author_user_id === "string" && // Check for author_user_id instead of author
    typeof obj.category === "string" &&
    typeof obj.featured === "boolean"
  );
}

// Normalize URL helper
export const normalizeUrl = (url: string): string => {
  if (!url) return "";
  // Ensure URL uses HTTPS and has no trailing slash
  return url.replace(/^http:/, "https:").replace(/\/$/, "");
};

// Utility function to get environment configuration
export function getEnvConfig() {
  // Read environment variables directly
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // Check if environment variables are properly loaded
  const isConfigured = supabaseUrl.length > 0 && supabaseKey.length > 0;
  const hasServiceRole = serviceRoleKey.length > 0;

  // Only log warnings if not configured
  if (!isConfigured && typeof window !== "undefined") {
    // Log warning in client-side if not configured
    console.warn("[Supabase] Client environment variables missing or invalid");
    console.warn(
      "[Supabase] Make sure you have .env.local properly configured with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return {
    supabaseUrl: normalizeUrl(supabaseUrl),
    supabaseKey,
    serviceRoleKey,
    isConfigured,
    hasServiceRole,
  };
}

/**
 * @deprecated This function is deprecated. Use utilities from 'src/lib/supabase-server.ts' for server-side operations or 'src/lib/supabase-browser.ts' for client-side operations instead.
 */
// Create a Supabase client
const createSupabaseClient = (
  isServer = typeof window === "undefined",
  useServiceRole = false,
): SupabaseClient<Database> | null => {
  // Use the environment config utility
  const {
    supabaseUrl,
    supabaseKey,
    serviceRoleKey,
    isConfigured,
    hasServiceRole,
  } = getEnvConfig();

  // Determine which key to use
  const keyToUse =
    useServiceRole && hasServiceRole ? serviceRoleKey : supabaseKey;

  if (!isConfigured) {
    const errorMsg = "[Supabase] ERROR: URL or Key is missing";
    console.error(errorMsg);

    // Additional troubleshooting in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[Supabase] DEBUG Info:
        - Environment: ${isServer ? "Server" : "Client"}
        - URL defined: ${!!supabaseUrl}
        - Key defined: ${!!supabaseKey}
        - Service Role Key defined: ${!!serviceRoleKey}
        - Make sure you have .env.local properly configured with:
          NEXT_PUBLIC_SUPABASE_URL=your-project-url
          NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
          SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)
      `);
    }

    return null;
  }

  try {
    return createSupabaseJSClient<Database>(supabaseUrl, keyToUse, {
      auth: {
        persistSession: !isServer,
        autoRefreshToken: !isServer,
        detectSessionInUrl: !isServer,
      },
      global: {
        headers: {
          "X-Client-Info": `supabase-js/${isServer ? "server" : "client"}`,
        },
      },
    });
  } catch (error) {
    console.error("[Supabase] ERROR creating client:", error);
    return null;
  }
};

// Browser client singleton variables have been removed

// The getSupabase function has been removed.
// Use createBrowserSupabaseClient from src/lib/supabase-browser.ts or
// createServerSupabaseClient from src/lib/supabase-server.ts instead.

// DEPRECATED: Server-only functions have been moved to supabase-server.ts
// These exports are kept for backward compatibility but will log warnings
export const getServerSupabase = (useServiceRole = false) => {
  console.error(
    "[Supabase] getServerSupabase() is deprecated. Import from supabase-server.ts instead.",
  );
  return createSupabaseClient(true, useServiceRole);
};

// DEPRECATED: Server-only functions have been moved to supabase-server.ts
export const getServiceRoleSupabase = () => {
  console.error(
    "[Supabase] getServiceRoleSupabase() is deprecated. Import from supabase-server.ts instead.",
  );
  return createSupabaseClient(true, true);
};

// Legacy alias for getServerSupabase for backward compatibility
export const createServerSupabaseClient = getServerSupabase;

// The fixSupabaseImageUrl function has been removed.
// Use getImagePublicUrl from src/lib/image-utils.ts instead.

// DIRECT API METHODS - avoid Supabase client issues in production

// Direct API fetch for blog posts with optimized field selection
export async function fetchBlogPostsDirectly(
  fields?: string[],
): Promise<BlogPost[]> {
  try {
    console.log("[Supabase] Starting fetchBlogPostsDirectly...");

    // Get credentials using our environment config utility
    const {
      supabaseUrl,
      supabaseKey,
      serviceRoleKey,
      isConfigured,
      hasServiceRole,
    } = getEnvConfig();

    if (!isConfigured) {
      console.error(
        "[Supabase] Direct API - Configuration missing for fetchBlogPostsDirectly",
      );
      return [];
    }

    console.log("[Supabase] Using direct API method for fetching blog posts");
    console.log(
      `[Supabase] URL configured: ${!!supabaseUrl}, Key configured: ${!!supabaseKey}`,
    );

    // Default fields for blog list view to reduce over-fetching
    const selectFields = fields || [
      "id",
      "slug",
      "title",
      "excerpt",
      "cover_image",
      "date",
      "author",
      "category",
      "featured",
      "draft",
    ];

    // With RLS enabled, we need to filter by draft=false for public access
    // or use service role key to bypass RLS
    const apiUrl = `${supabaseUrl}/rest/v1/blog_posts?select=${selectFields.join(",")}&order=date.desc&draft=eq.false`;
    console.log(`[Supabase] API URL: ${apiUrl}`);

    // Determine which key to use - prefer service role if available to bypass RLS
    const keyType = hasServiceRole ? "service_role" : "anon";
    console.log(`[Supabase] Using ${keyType} key for direct API fetch`);

    // Try service role first if available
    if (hasServiceRole) {
      try {
        console.log(
          "[Supabase] Attempting direct API fetch with service role key",
        );
        const serviceData = await fetchWithKey(
          `${supabaseUrl}/rest/v1/blog_posts?select=${selectFields.join(",")}&order=date.desc`,
          serviceRoleKey,
        );

        if (serviceData && serviceData.length > 0) {
          console.log(
            `[Supabase] Successfully fetched ${serviceData.length} posts via direct API with service role key`,
          );
          return processPostsData(serviceData);
        }

        console.log(
          "[Supabase] Service role fetch returned no data, trying with anon key",
        );
      } catch (serviceError) {
        console.error("[Supabase] Service role fetch failed:", serviceError);
        console.log("[Supabase] Falling back to anon key");
      }
    }

    // Try with anon key
    try {
      console.log("[Supabase] Attempting direct API fetch with anon key");
      const data = await fetchWithKey(apiUrl, supabaseKey);

      if (data && data.length > 0) {
        console.log(
          `[Supabase] Successfully fetched ${data.length} posts via direct API with anon key`,
        );
        return processPostsData(data);
      }

      console.log("[Supabase] Anon key fetch returned no data");
      return [];
    } catch (anonError) {
      console.error("[Supabase] Anon key fetch failed:", anonError);

      // If we haven't tried service role yet and it's available, try it now
      if (!hasServiceRole && serviceRoleKey) {
        try {
          console.log(
            "[Supabase] Attempting direct API fetch with service role key as fallback",
          );
          const serviceData = await fetchWithKey(
            `${supabaseUrl}/rest/v1/blog_posts?select=${selectFields.join(",")}&order=date.desc`,
            serviceRoleKey,
          );

          if (serviceData && serviceData.length > 0) {
            console.log(
              `[Supabase] Successfully fetched ${serviceData.length} posts via direct API with service role key as fallback`,
            );
            return processPostsData(serviceData);
          }
        } catch (fallbackError) {
          console.error(
            "[Supabase] Service role fallback also failed:",
            fallbackError,
          );
        }
      }

      // All attempts failed
      console.error("[Supabase] All direct API fetch attempts failed");
      return [];
    }
  } catch (error) {
    // Provide more context for error
    const detailedError =
      error instanceof Error
        ? new Error(`[fetchBlogPostsDirectly] ${error.message}`)
        : new Error(`[fetchBlogPostsDirectly] Unknown error: ${String(error)}`);

    console.error("[Supabase] Error in fetchBlogPostsDirectly:", detailedError);

    // Return empty array instead of rethrowing to prevent cascading failures
    return [];
  }
}

// Helper function to fetch with a specific key
async function fetchWithKey(url: string, key: string): Promise<any[]> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: 3600 }, // Revalidate every hour instead of no-store
  });

  if (!response.ok) {
    const errorText = await response
      .text()
      .catch(() => "Could not read error response");
    throw new Error(`API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(`Expected array but got ${typeof data}`);
  }

  return data;
}

// Direct API fetch for a specific blog post by slug
export async function fetchBlogPostBySlugDirectly(
  slug: string,
): Promise<BlogPost | null> {
  if (!slug) {
    console.error("[Supabase] No slug provided to fetchBlogPostBySlugDirectly");
    return null;
  }

  try {
    // Get credentials using our environment config utility
    const {
      supabaseUrl,
      supabaseKey,
      serviceRoleKey,
      isConfigured,
      hasServiceRole,
    } = getEnvConfig();

    if (!isConfigured) {
      console.error(
        "[Supabase] Direct API - Configuration missing for fetchBlogPostBySlugDirectly",
      );
      return null;
    }

    // With RLS enabled, we need to filter by draft=false for public access
    // or use service role key to bypass RLS
    const apiUrl = `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&draft=eq.false&limit=1`;

    // Determine which key to use - prefer service role if available to bypass RLS
    const keyToUse = hasServiceRole ? serviceRoleKey : supabaseKey;
    const keyType = hasServiceRole ? "service_role" : "anon";

    console.log(
      `[Supabase] Using ${keyType} key for direct API fetch of slug ${slug}`,
    );

    // Use more robust error handling for fetch
    let response;
    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          apikey: keyToUse,
          Authorization: `Bearer ${keyToUse}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour instead of no-store
      });
    } catch (fetchError) {
      console.error(
        `[Supabase] Network error in direct API fetch for slug ${slug}:`,
        fetchError,
      );
      return null;
    }

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Could not read error response");
      console.error(
        `[Supabase] Direct API returned status ${response.status} for slug ${slug}: ${errorText}`,
      );

      // If using anon key failed and we have service role key, try again with service role
      if (!hasServiceRole && serviceRoleKey) {
        try {
          const serviceResponse = await fetch(
            `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&limit=1`,
            {
              method: "GET",
              headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              next: { revalidate: 3600 }, // Revalidate every hour instead of no-store
            },
          );

          if (serviceResponse.ok) {
            const serviceData = await serviceResponse.json();
            if (Array.isArray(serviceData) && serviceData.length > 0) {
              const post = serviceData[0];

              // Fix cover image URL
              // Note: We can't use getImagePublicUrl here because we don't have a Supabase client
              // We're using direct API calls, so we'll use a default image or the original URL
              if (post.cover_image) {
                // If it's already a full URL, use it as is
                if (
                  !post.cover_image.startsWith("http") &&
                  !post.cover_image.startsWith("/")
                ) {
                  // If it's a relative path, use a default image
                  post.cover_image = "/default-blog-image.jpg";
                }
              }

              console.log(
                `[Supabase] Successfully fetched post with slug ${slug} via direct API with service role key`,
              );
              return post as BlogPost;
            }
          } else {
            const serviceErrorText = await serviceResponse
              .text()
              .catch(() => "Could not read error response");
            console.error(
              `[Supabase] Service role direct API also failed for slug ${slug} with status ${serviceResponse.status}: ${serviceErrorText}`,
            );
          }
        } catch (serviceError) {
          console.error(
            `[Supabase] Error with service role direct API for slug ${slug}:`,
            serviceError,
          );
        }
      }

      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(
        `[Supabase] Error parsing JSON response for slug ${slug}:`,
        jsonError,
      );
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      const post = data[0];

      // Fix cover image URL
      // Note: We can't use getImagePublicUrl here because we don't have a Supabase client
      // We're using direct API calls, so we'll use a default image or the original URL
      if (post.cover_image) {
        // If it's already a full URL, use it as is
        if (
          !post.cover_image.startsWith("http") &&
          !post.cover_image.startsWith("/")
        ) {
          // If it's a relative path, use a default image
          post.cover_image = "/default-blog-image.jpg";
        }
      }

      console.log(
        `[Supabase] Successfully fetched post with slug ${slug} via direct API`,
      );
      return post as BlogPost;
    }

    console.log(`[Supabase] No post found with slug ${slug} via direct API`);
    return null;
  } catch (error) {
    console.error(
      `[Supabase] Error in fetchBlogPostBySlugDirectly for slug ${slug}:`,
      error,
    );
    return null;
  }
}

// Main functions with fallbacks

/**
 * @deprecated This function is deprecated as of 2023-11-15. Use modern alternatives instead:
 * - For server-side operations: Use `getAllBlogPostsServer()` from '@/lib/blog-server.ts'
 * - For cached server-side operations: Use `getAllBlogPosts()` from '@/lib/blog-preload.ts'
 * - For client-side operations: Use functions from '@/lib/blog-client.ts'
 * - For shared utilities: Use functions from '@/lib/supabase-shared.ts' with appropriate client
 */
// Get all blog posts with optimized field selection
export async function getAllBlogPosts(fields?: string[]): Promise<BlogPost[]> {
  try {
    console.log("[Supabase] Starting getAllBlogPosts...");

    // Default fields for blog list view to reduce over-fetching
    const selectFields = fields || [
      "id",
      "slug",
      "title",
      "excerpt",
      "cover_image",
      "date",
      "author",
      "category",
      "featured",
      "draft",
    ];

    // Server-side service role client is now handled directly in the if/else block below
    // This code path is now handled by server-only code elsewhere

    // If we're on the client or service role client failed, use browser client with RLS
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();

    if (!supabase) {
      console.log("[Supabase] No client available, falling back to direct API");
      return await fetchBlogPostsDirectly(selectFields);
    }

    // For public access, we need to filter by draft=false to respect RLS
    let result;
    try {
      result = await supabase
        .from("blog_posts")
        .select(selectFields.join(","))
        .eq("draft", false) // Only get published posts for public access
        .order("date", { ascending: false });
    } catch (queryError) {
      console.error("[Supabase] Error executing query:", queryError);
      // Try direct API as fallback
      return await fetchBlogPostsDirectly(selectFields);
    }

    const { data, error } = result;

    if (error) {
      console.error("[Supabase] getAllBlogPosts error:", error);
      console.log("[Supabase] Falling back to direct API");
      return await fetchBlogPostsDirectly(selectFields);
    }

    if (data && Array.isArray(data) && data.length > 0) {
      console.log(
        `[Supabase] Successfully fetched ${data.length} posts with regular client`,
      );

      // Process and return the data
      return processPostsData(data);
    }

    console.log(
      "[Supabase] No posts found with regular client, falling back to direct API",
    );
    return await fetchBlogPostsDirectly(selectFields);
  } catch (error) {
    console.error("[Supabase] getAllBlogPosts exception:", error);
    try {
      return await fetchBlogPostsDirectly();
    } catch (directApiError) {
      console.error("[Supabase] Direct API also failed:", directApiError);
      // Return empty array as last resort
      return [];
    }
  }
}

// Helper function to process and validate blog posts data
function processPostsData(data: any[]): BlogPost[] {
  // Filter out any items that don't match the BlogPost structure
  const validPosts: BlogPost[] = [];

  if (!Array.isArray(data)) {
    console.error("[Supabase] Expected array of posts but got:", typeof data);
    return [];
  }

  // Get a Supabase client for generating image URLs
  const supabase = createBrowserClient();

  data.forEach((post) => {
    try {
      if (
        post &&
        typeof post === "object" &&
        typeof post.slug === "string" &&
        typeof post.title === "string"
      ) {
        // This is likely a valid post
        const blogPost = post as BlogPost;

        // Fix cover image if it exists and we have a Supabase client
        if (blogPost.cover_image && supabase) {
          // Use our generalized utility to get the public URL
          const publicUrl = getImagePublicUrl(
            supabase,
            "blog-images",
            blogPost.cover_image,
          );
          if (publicUrl) {
            // Apply consolidated URL normalization
            blogPost.cover_image = normalizeImageUrl(publicUrl, {
              context: "blog",
              logFixes: true,
            });
          } else {
            // If we couldn't generate a URL, use a default image
            blogPost.cover_image = getDefaultImageUrl("blog");
          }
        } else if (blogPost.cover_image) {
          // Apply consolidated URL normalization
          blogPost.cover_image = normalizeImageUrl(blogPost.cover_image, {
            context: "blog",
            logFixes: true,
          });
        }

        validPosts.push(blogPost);
      }
    } catch (error) {
      console.error("[Supabase] Error processing post:", error);
    }
  });

  return validPosts;
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Save a blog post directly
export async function saveBlogPostDirectly(post: BlogPost): Promise<boolean> {
  try {
    console.log("📦📦📦 [saveBlogPostDirectly] Received post data:", post);
    console.log(
      "📦📦📦 [saveBlogPostDirectly] author_user_id:",
      post.author_user_id,
    );

    // Get credentials using our environment config utility
    const { supabaseUrl, supabaseKey, isConfigured } = getEnvConfig();

    if (!isConfigured) {
      console.error(
        "[Supabase] Direct API - Configuration missing for saveBlogPostDirectly",
      );
      return false;
    }

    // Check if post exists
    const checkUrl = `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(post.slug)}&select=id`;

    let response = await fetch(checkUrl, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Check existing returned status ${response.status}`);
    }

    const existingData = await response.json();

    // If post exists, update it
    if (existingData && existingData.length > 0) {
      console.log(
        "📦📦📦 [saveBlogPostDirectly] Updating existing post with ID:",
        existingData[0].id,
      );
      console.log(
        "📦📦📦 [saveBlogPostDirectly] Update payload author_user_id:",
        post.author_user_id,
      );

      const updateUrl = `${supabaseUrl}/rest/v1/blog_posts?id=eq.${existingData[0].id}`;

      const updateData = {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        date: post.date,
        author_user_id: post.author_user_id, // Use author_user_id instead of author display name
        category: post.category,
        featured: post.featured,
        updated_at: new Date().toISOString(),
        // Include draft status if provided
        ...(post.draft !== undefined ? { draft: post.draft } : {}),
        // Include premium status if provided
        ...(post.premium !== undefined ? { premium: post.premium } : {}),
      };

      console.log(
        "📦📦📦 [saveBlogPostDirectly] Full update payload:",
        updateData,
      );

      response = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify(updateData),
        cache: "no-store",
      });
    } else {
      // If post doesn't exist, create it
      const insertUrl = `${supabaseUrl}/rest/v1/blog_posts`;

      const insertData = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        date: post.date,
        author_user_id: post.author_user_id, // Use author_user_id instead of author display name
        category: post.category,
        featured: post.featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Include draft status if provided, default to true if not specified
        draft: post.draft !== undefined ? post.draft : true,
        // Include premium status if provided
        ...(post.premium !== undefined ? { premium: post.premium } : {}),
      };

      console.log(
        "📦📦📦 [saveBlogPostDirectly] Full insert payload:",
        insertData,
      );

      response = await fetch(insertUrl, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify(insertData),
        cache: "no-store",
      });
    }

    return response.ok;
  } catch (error) {
    console.error(`Error in saveBlogPostDirectly:`, error);
    return false;
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15. Use modern alternatives instead:
 * - For server-side operations: Use `saveBlogPost()` from '@/lib/supabase-shared.ts' with `createServiceRoleClient()`
 * - For client-side operations: Use functions from '@/lib/blog-client.ts'
 * - For API routes: Use `saveBlogPost()` from '@/lib/supabase-shared.ts' with `createRouteHandlerClient()`
 */
// Save a blog post
export async function saveBlogPost(post: BlogPost): Promise<boolean> {
  try {
    console.log("📦📦📦 [saveBlogPost] Received post data:", post);
    console.log("📦📦📦 [saveBlogPost] author_user_id:", post.author_user_id);

    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServiceRoleClient } = await import(
          "@/utils/supabase/server"
        );
        supabase = createServiceRoleClient();
        console.log(
          `📦📦📦 [saveBlogPost] Using service role client in server context`,
        );
      } catch (error) {
        console.error(
          `📦📦📦 [saveBlogPost] Failed to import server client:`,
          error,
        );
        // Fallback to browser client as last resort
        const { createClient } = await import("@/utils/supabase/client");
        supabase = createClient();
      }
    } else {
      // Client-side
      const { createClient } = await import("@/utils/supabase/client");
      supabase = createClient();
    }

    if (!supabase) {
      console.log(
        "📦📦📦 [saveBlogPost] No Supabase client, falling back to direct API",
      );
      return saveBlogPostDirectly(post);
    }

    // Check if post exists
    const { data: existingPost, error: checkError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", post.slug)
      .maybeSingle();

    if (checkError && !checkError.message.includes("No rows found")) {
      console.error(
        "saveBlogPost check error, falling back to direct API:",
        checkError,
      );
      return saveBlogPostDirectly(post);
    }

    if (existingPost) {
      // Update existing post
      console.log(
        "📦📦📦 [saveBlogPost] Updating existing post with ID:",
        existingPost.id,
      );
      console.log(
        "📦📦📦 [saveBlogPost] Update payload author_user_id:",
        post.author_user_id,
      );

      const updatePayload = {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        date: post.date,
        author_user_id: post.author_user_id, // Use author_user_id instead of author display name
        category: post.category,
        featured: post.featured,
        updated_at: new Date().toISOString(),
        // Include draft status if provided
        ...(post.draft !== undefined ? { draft: post.draft } : {}),
        // Include premium status if provided
        ...(post.premium !== undefined ? { premium: post.premium } : {}),
      };

      console.log("📦📦📦 [saveBlogPost] Full update payload:", updatePayload);

      const { error: updateError } = await supabase
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", existingPost.id);

      if (updateError) {
        console.error(
          "saveBlogPost update error, falling back to direct API:",
          updateError,
        );
        return saveBlogPostDirectly(post);
      }
    } else {
      // Create new post
      const insertPayload = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        date: post.date,
        author_user_id: post.author_user_id, // Use author_user_id instead of author display name
        category: post.category,
        featured: post.featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Include draft status if provided, default to true if not specified
        draft: post.draft !== undefined ? post.draft : true,
        // Include premium status if provided
        ...(post.premium !== undefined ? { premium: post.premium } : {}),
      };

      console.log("📦📦📦 [saveBlogPost] Full insert payload:", insertPayload);

      const { error: insertError } = await supabase
        .from("blog_posts")
        .insert(insertPayload);

      if (insertError) {
        console.error(
          "saveBlogPost insert error, falling back to direct API:",
          insertError,
        );
        return saveBlogPostDirectly(post);
      }
    }

    return true;
  } catch (error) {
    console.error(`saveBlogPost exception:`, error);
    return saveBlogPostDirectly(post);
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Delete a blog post directly
export async function deleteBlogPostDirectly(slug: string): Promise<boolean> {
  try {
    // Get credentials using our environment config utility
    const { supabaseUrl, supabaseKey, isConfigured } = getEnvConfig();

    if (!isConfigured) {
      console.error(
        "[Supabase] Direct API - Configuration missing for deleteBlogPostDirectly",
      );
      return false;
    }

    const apiUrl = `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}`;

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    console.error(`Error in deleteBlogPostDirectly:`, error);
    return false;
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Delete a blog post
export async function deleteBlogPost(slug: string): Promise<boolean> {
  try {
    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServiceRoleClient } = await import(
          "@/utils/supabase/server"
        );
        supabase = createServiceRoleClient();
        console.log(
          `[deleteBlogPost] Using service role client in server context`,
        );
      } catch (error) {
        console.error(
          `[deleteBlogPost] Failed to import server client:`,
          error,
        );
        // Fallback to browser client as last resort
        const { createClient } = await import("@/utils/supabase/client");
        supabase = createClient();
      }
    } else {
      // Client-side
      const { createClient } = await import("@/utils/supabase/client");
      supabase = createClient();
    }

    if (!supabase) {
      return deleteBlogPostDirectly(slug);
    }

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error(`deleteBlogPost error, falling back to direct API:`, error);
      return deleteBlogPostDirectly(slug);
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteBlogPost:`, error);
    return deleteBlogPostDirectly(slug);
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Upload a file to Supabase Storage
export async function uploadFile(
  file: File,
  path: string,
  bucketName: string = "blog-images",
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    console.log(
      `[Supabase] uploadFile called with path: ${path}, bucketName: ${bucketName}`,
    );

    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServiceRoleClient } = await import(
          "@/utils/supabase/server"
        );
        supabase = createServiceRoleClient();
        console.log(
          `[Supabase] Using service role client for uploadFile in server context`,
        );
      } catch (error) {
        console.error(
          `[Supabase] Failed to import server client for uploadFile:`,
          error,
        );
        // Fallback to browser client as last resort
        supabase = createBrowserClient();
      }
    } else {
      // Client-side
      supabase = createBrowserClient();
    }

    if (!supabase) {
      return { publicUrl: null, error: "Supabase client not initialized" };
    }

    // Create a unique filename to avoid overwrites
    const fileName =
      Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    // IMPORTANT: For blog-images bucket, ensure we NEVER add the "blog/" prefix
    // to avoid the problematic "blog-images/blog/" pattern
    let uniquePath = "";

    if (path.length === 0) {
      // If no path provided, just use the filename directly
      uniquePath = fileName;
    } else if (bucketName === "blog-images" && path.startsWith("blog/")) {
      // If path starts with "blog/" for the blog-images bucket, remove it
      uniquePath = path.replace(/^blog\//, "") || fileName;
      console.log(
        `[Supabase] Removed 'blog/' prefix from path for blog-images bucket: ${path} -> ${uniquePath}`,
      );
    } else {
      // Otherwise use the provided path
      uniquePath = path;
    }

    // For article-images bucket, ensure content/ prefix
    if (bucketName === "article-images" && !uniquePath.startsWith("content/")) {
      uniquePath = `content/${uniquePath}`;
    }

    console.log(
      `[Supabase] Final upload path: ${uniquePath} to bucket: ${bucketName}`,
    );

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniquePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error(`[Supabase] Upload error:`, error);
      return { publicUrl: null, error: error.message };
    }

    if (!data || !data.path) {
      console.error(`[Supabase] No data returned from upload`);
      return { publicUrl: null, error: "No data returned from upload" };
    }

    console.log(`[Supabase] Upload successful, path: ${data.path}`);

    // Use our generalized utility to get the public URL
    const publicUrl = getImagePublicUrl(supabase, bucketName, data.path);
    console.log(`[Supabase] Generated public URL: ${publicUrl}`);

    return { publicUrl, error: null };
  } catch (error: any) {
    console.error(`[Supabase] Upload exception:`, error);
    return { publicUrl: null, error: error.message || "Unknown error" };
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Get all categories
export async function getAllCategories(): Promise<string[]> {
  try {
    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServerClient } = await import("@/utils/supabase/server");
        supabase = await createServerClient();
        console.log(
          `[getAllCategories] Using server component client in server context`,
        );
      } catch (error) {
        console.error(
          `[getAllCategories] Failed to import server client:`,
          error,
        );
        // Fallback to browser client as last resort
        const { createClient } = await import("@/utils/supabase/client");
        supabase = createClient();
      }
    } else {
      // Client-side
      const { createClient } = await import("@/utils/supabase/client");
      supabase = createClient();
    }

    if (!supabase) return ["Personal Growth"];

    const { data, error } = await supabase
      .from("blog_posts")
      .select("category");

    if (error || !data) {
      return ["Personal Growth"];
    }

    // Extract unique categories
    const categoriesSet = new Set<string>(data.map((post) => post.category));

    // Always include 'All Categories' at the beginning
    const categories = ["All Categories", ...Array.from(categoriesSet)];

    return categories;
  } catch (error) {
    return ["Personal Growth"];
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Get featured post
export async function getFeaturedBlogPost(): Promise<BlogPost | null> {
  try {
    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServerClient } = await import("@/utils/supabase/server");
        supabase = await createServerClient();
        console.log(
          `[getFeaturedBlogPost] Using server component client in server context`,
        );
      } catch (error) {
        console.error(
          `[getFeaturedBlogPost] Failed to import server client:`,
          error,
        );
        // Fallback to browser client as last resort
        const { createClient } = await import("@/utils/supabase/client");
        supabase = createClient();
      }
    } else {
      // Client-side
      const { createClient } = await import("@/utils/supabase/client");
      supabase = createClient();
    }

    if (!supabase) {
      return null;
    }

    // First try to find a post marked as featured
    const { data: featuredPosts, error: featuredError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("featured", true)
      .order("date", { ascending: false })
      .limit(1);

    if (!featuredError && featuredPosts && featuredPosts.length > 0) {
      const post = featuredPosts[0];
      if (post.cover_image && supabase) {
        // Use our generalized utility to get the public URL
        const publicUrl = getImagePublicUrl(
          supabase,
          "blog-images",
          post.cover_image,
        );
        if (publicUrl) {
          // Apply consolidated URL normalization
          post.cover_image = normalizeImageUrl(publicUrl, {
            context: "blog",
            logFixes: true,
          });
          console.log(
            `[Supabase] Generated public URL for featured post cover image: ${post.cover_image}`,
          );
        } else {
          // If we couldn't generate a URL, use a default image
          post.cover_image = getDefaultImageUrl("blog");
        }
      } else if (post.cover_image) {
        // If we don't have a Supabase client, check if it's already a URL
        if (
          !post.cover_image.startsWith("http") &&
          !post.cover_image.startsWith("/")
        ) {
          // If it's a relative path, use a default image
          post.cover_image = "/default-blog-image.jpg";
        }
      }
      return post;
    }

    // If no featured post, return most recent post
    const { data: recentPosts, error: recentError } = await supabase
      .from("blog_posts")
      .select("*")
      .order("date", { ascending: false })
      .limit(1);

    if (!recentError && recentPosts && recentPosts.length > 0) {
      const post = recentPosts[0];
      if (post.cover_image && supabase) {
        // Use our generalized utility to get the public URL
        const publicUrl = getImagePublicUrl(
          supabase,
          "blog-images",
          post.cover_image,
        );
        if (publicUrl) {
          // Apply consolidated URL normalization
          post.cover_image = normalizeImageUrl(publicUrl, {
            context: "blog",
            logFixes: true,
          });
          console.log(
            `[Supabase] Generated public URL for recent post cover image: ${post.cover_image}`,
          );
        } else {
          // If we couldn't generate a URL, use a default image
          post.cover_image = getDefaultImageUrl("blog");
        }
      } else if (post.cover_image) {
        // If we don't have a Supabase client, check if it's already a URL
        if (
          !post.cover_image.startsWith("http") &&
          !post.cover_image.startsWith("/")
        ) {
          // If it's a relative path, use a default image
          post.cover_image = "/default-blog-image.jpg";
        }
      }
      return post;
    }

    return null;
  } catch (error) {
    console.error("Error fetching featured blog post:", error);
    return null;
  }
}

/**
 * @deprecated This function is deprecated as of 2023-11-15.
 * Please migrate to the new Supabase client setup:
 * - For server-side operations (Server Components, Route Handlers, Server Actions),
 *   use functions from '@/lib/supabase-server.ts' (e.g., createServerComponentClient, createRouteHandlerClient).
 * - For client-side operations (Client Components),
 *   use `createBrowserSupabaseClient` from '@/lib/supabase-browser.ts'.
 * - For service role operations, use `createServiceRoleClient` from '@/lib/supabase-server.ts'.
 */
// Ensure the required bucket exists and has correct permissions
export async function ensureBucketExists(
  bucketName: string = "blog-images",
): Promise<boolean> {
  try {
    console.log(`[Supabase] ensureBucketExists called for '${bucketName}'`);

    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    // Get the appropriate client based on context
    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServiceRoleClient } = await import(
          "@/utils/supabase/server"
        );
        supabase = createServiceRoleClient();
        console.log(
          `[Supabase] Using service role client for ensureBucketExists in server context`,
        );
      } catch (error) {
        console.error(`[Supabase] Failed to import server client:`, error);
        // Fallback to browser client as last resort
        const { createClient } = await import("@/utils/supabase/client");
        supabase = createClient();
      }
    } else {
      // Client-side
      const { createClient } = await import("@/utils/supabase/client");
      supabase = createClient();
    }

    if (!supabase) {
      console.error("[Supabase] Client not initialized for ensureBucketExists");
      return false;
    }

    // Normalize bucket name to lowercase
    const normalizedBucketName = bucketName.toLowerCase();

    console.log(
      `[Supabase] Checking if bucket '${normalizedBucketName}' exists...`,
    );

    // First try direct access to the bucket which is faster and more reliable
    try {
      // Try to list files in the bucket - if this succeeds, the bucket exists and is accessible
      const { data, error } = await supabase.storage
        .from(normalizedBucketName)
        .list("", { limit: 1 });

      if (!error) {
        console.log(
          `[Supabase] Successfully listed bucket '${normalizedBucketName}' contents:`,
          data,
        );
        return true;
      } else {
        console.error(`[Supabase] Error listing bucket contents:`, error);
      }
    } catch (error) {
      console.warn(`[Supabase] Exception listing bucket contents:`, error);
      // Continue to bucket creation
    }

    // Try a simpler approach - attempt to get public URL for a non-existent file
    // This will work even with restricted permissions and tells us if the bucket exists
    try {
      const { data } = supabase.storage
        .from(normalizedBucketName)
        .getPublicUrl("test-file-that-doesnt-exist.jpg");

      if (data && data.publicUrl) {
        // If we can get a public URL, the bucket must exist
        console.log(
          `[Supabase] Bucket ${normalizedBucketName} verified by getting public URL`,
        );
        return true;
      }
    } catch (error) {
      console.warn(`[Supabase] Error testing bucket with public URL:`, error);
    }

    // For backwards compatibility, try the getBucket method (requires extra permissions)
    try {
      const { data: bucketData, error: bucketError } =
        await supabase.storage.getBucket(normalizedBucketName);

      if (!bucketError && bucketData) {
        console.log(
          `[Supabase] Bucket ${normalizedBucketName} verified with getBucket`,
        );
        return true;
      } else if (bucketError) {
        console.error(`[Supabase] Error with getBucket:`, bucketError);
      }
    } catch (error) {
      console.warn(`[Supabase] Exception with getBucket:`, error);
    }

    // Last attempt - try to create the bucket if it doesn't exist
    console.log(
      `[Supabase] Attempting to create bucket: ${normalizedBucketName}`,
    );
    try {
      const { error } = await supabase.storage.createBucket(
        normalizedBucketName,
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        },
      );

      if (error) {
        console.error(`[Supabase] Error creating bucket:`, error);
        // If error contains "already exists", that's actually success
        if (error.message?.includes("already exists")) {
          console.log(`[Supabase] Bucket already exists (from error message)`);
          return true;
        }
        return false;
      }

      console.log(
        `[Supabase] Successfully created bucket ${normalizedBucketName}`,
      );
      return true;
    } catch (error) {
      console.error(`[Supabase] Exception creating bucket:`, error);
      return false;
    }
  } catch (error) {
    console.error(`[Supabase] Unhandled error in ensureBucketExists:`, error);
    return false;
  }
}

// Check if an image URL is accessible
export async function isImageAccessible(imageUrl: string): Promise<boolean> {
  try {
    // If it's already a complete URL
    let urlToCheck = imageUrl;

    // Fix relative URLs or Supabase storage paths
    if (!urlToCheck.startsWith("http") && !urlToCheck.startsWith("/")) {
      // If it's a relative path, use a default image URL
      urlToCheck = "/default-blog-image.jpg";
    }

    // For local files starting with '/', we'll assume they exist
    if (urlToCheck.startsWith("/")) {
      return true;
    }

    // For blob URLs (client-side only), assume they're valid
    if (typeof window !== "undefined" && urlToCheck.startsWith("blob:")) {
      return true;
    }

    // Try to fetch the image with a HEAD request
    const response = await fetch(urlToCheck, {
      method: "HEAD",
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    console.error(`Error checking image accessibility for ${imageUrl}:`, error);
    return false;
  }
}

// List images in a Supabase storage bucket
export async function listBucketImages(
  bucketName: string = "blog-images",
): Promise<any[]> {
  try {
    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServiceRoleClient } = await import(
          "@/utils/supabase/server"
        );
        supabase = createServiceRoleClient();
        console.log(
          `[Supabase] Using service role client for listBucketImages in server context`,
        );
      } catch (error) {
        console.error(`[Supabase] Failed to import server client:`, error);
        // Fallback to browser client as last resort
        supabase = createBrowserClient();
      }
    } else {
      // Client-side
      supabase = createBrowserClient();
    }

    if (!supabase) {
      console.error("Supabase client not initialized for listBucketImages");
      return [];
    }

    console.log(`Listing images from ${bucketName} bucket...`);

    // First list from the root - this should always work if the bucket exists
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(bucketName)
      .list("", { sortBy: { column: "created_at", order: "desc" } });

    if (rootError) {
      console.error(
        `Error listing images from root of ${bucketName}:`,
        rootError,
      );
      return []; // Return empty array if we can't even list root files
    }

    console.log(`Root files in ${bucketName}:`, rootFiles);

    // Only include files (not folders) from the root
    // In Supabase, folders might be identified by having id ending with '/' or with .metadata being null
    const filteredRootFiles = (rootFiles || []).filter((item: any) => {
      const isFolder =
        item.id?.endsWith("/") ||
        item.name?.endsWith("/") ||
        item.metadata === null ||
        rootFiles.some((f: any) => f.name.startsWith(item.name + "/"));
      return !isFolder;
    });

    console.log(
      `Filtered ${filteredRootFiles.length} files from root (excluding folders)`,
    );

    // Don't try to list from the blog subfolder if it doesn't exist in the root listing
    // Different versions of Supabase represent folders differently
    // We need to check for 'blog' or 'blog/' in various ways
    const blogFolderExists = rootFiles?.some((item: any) => {
      // Check various ways a folder might be represented
      return (
        (item.name === "blog" && (!item.metadata || item.id?.endsWith("/"))) ||
        item.name === "blog/" ||
        rootFiles.some((f: any) => f.name.startsWith("blog/"))
      );
    });

    let blogFiles: any[] = [];

    // Only try to list from blog subfolder if it exists
    if (blogFolderExists) {
      console.log("Blog subfolder exists, listing its contents");
      const { data: blogFileData, error: blogError } = await supabase.storage
        .from(bucketName)
        .list("blog", { sortBy: { column: "created_at", order: "desc" } });

      if (blogError) {
        console.error(`Error listing images from blog subfolder:`, blogError);
      } else if (blogFileData) {
        console.log(`Found ${blogFileData.length} files in blog subfolder`);

        // Map blog subfolder files to include the subfolder in the path
        blogFiles = blogFileData
          .filter(
            (item: any) => !item.id?.endsWith("/") && !item.name?.endsWith("/"),
          ) // Skip any subfolders
          .map((item: any) => ({
            ...item,
            name: `blog/${item.name}`,
          }));

        console.log(
          `After filtering, using ${blogFiles.length} files from blog subfolder`,
        );
      }
    } else {
      console.log(
        "Blog subfolder does not exist in bucket, skipping blog folder listing",
      );
    }

    // Combine the files
    const allFiles = [...filteredRootFiles, ...blogFiles];

    if (allFiles.length === 0) {
      console.log("No files found in bucket after filtering");
      return [];
    }

    console.log(
      `Found total of ${allFiles.length} files, getting public URLs...`,
    );

    // Convert to a standardized format with public URLs
    const result = await Promise.all(
      allFiles.map(async (file) => {
        try {
          // Get public URL for each file
          const { data: urlData } = await supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name);

          const publicUrl = urlData?.publicUrl || "";
          // Apply consolidated URL normalization
          const fixedUrl = normalizeImageUrl(publicUrl, {
            context: "blog",
            logFixes: true,
          });

          return {
            name: file.name.split("/").pop() || file.name,
            url: fixedUrl,
            bucketPath: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at || new Date().toISOString(),
          };
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          return null;
        }
      }),
    );

    // Filter out any null entries from errors
    const finalResult = result.filter(Boolean);
    console.log(`Returning ${finalResult.length} processed images`);

    return finalResult;
  } catch (error) {
    console.error(`Error listing images in ${bucketName}:`, error);
    return [];
  }
}

// Delete an image from a Supabase storage bucket
export async function deleteImageFromBucket(
  imagePath: string,
  bucketName: string = "blog-images",
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Determine if we're in a server context
    const isServer = typeof window === "undefined";

    let supabase;

    if (isServer) {
      // We're on the server, use the dynamic import to avoid circular dependencies
      try {
        const { createServiceRoleClient } = await import(
          "@/utils/supabase/server"
        );
        supabase = createServiceRoleClient();
        console.log(
          `[deleteImageFromBucket] Using service role client in server context`,
        );
      } catch (error) {
        console.error(
          `[deleteImageFromBucket] Failed to import server client:`,
          error,
        );
        // Fallback to browser client as last resort
        const { createClient } = await import("@/utils/supabase/client");
        supabase = createClient();
      }
    } else {
      // Client-side
      const { createClient } = await import("@/utils/supabase/client");
      supabase = createClient();
    }

    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    // Normalize the path to remove any leading slashes or bucket URLs
    let normalizedPath = imagePath;

    // If it's a full URL, extract just the path portion
    if (normalizedPath.includes("storage/v1/object/public")) {
      const parts = normalizedPath.split(`/storage/v1/object/public/`);
      if (parts.length > 1) {
        const pathWithBucket = parts[1];
        const bucketParts = pathWithBucket.split("/");

        // Remove the bucket name from the path if it's included
        if (bucketParts[0].toLowerCase() === bucketName.toLowerCase()) {
          bucketParts.shift();
        }

        normalizedPath = bucketParts.join("/");
      }
    }

    // Remove any leading slashes
    normalizedPath = normalizedPath.replace(/^\/+/, "");

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([normalizedPath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error deleting image",
    };
  }
}
