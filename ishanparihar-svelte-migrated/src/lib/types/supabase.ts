
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
