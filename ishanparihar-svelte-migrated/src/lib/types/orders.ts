/** @typedef {{ 
  service_id: string;
  service_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}} OrderItem */

/** @typedef {{ 
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}} Address */

/** @typedef {{ 
  id: string;
  order_number: string;
  customer_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  total_amount: number;
  currency: string;
  items: OrderItem[];
  shipping_address: Address;
  billing_address?: Address;
  payment_id?: string;
  razorpay_order_id?: string;
  created_at: string;
  updated_at: string;
}} Order */

/** @typedef {{ 
  items: OrderItem[];
  shipping_address: Address;
  billing_address?: Address;
  payment_id?: string; // This will be the Razorpay order ID
  total_amount: number;
  currency: string;
}} CreateOrderRequest */

/** @typedef {{ 
  order: Order;
}} CreateOrderResponse */