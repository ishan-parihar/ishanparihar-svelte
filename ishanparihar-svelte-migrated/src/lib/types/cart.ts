export interface Service {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  price?: number;
  featured?: boolean;
  cover_image?: string;
  category?: ServiceCategory;
  pricing?: ServicePricing[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ServicePricing {
  id: string;
  type: string;
  price: number;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}