export interface Service {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  base_price: number;
  featured?: boolean;
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
  total: number;
 itemCount: number;
  isLoading: boolean;
  error: string | null;
}