# Phase 3: E-commerce & Payments Migration Manual

## Overview

**Duration**: 2 weeks
**Priority**: 🟡 High
**Team**: 2-3 Full-stack developers
**Dependencies**: Phase 1 & 2 completion

Phase 3 focuses on migrating the complete e-commerce system including service catalog, shopping cart, payment processing, and order management. This is critical for the business operations of the platform.

## Architecture Analysis

### Current Next.js E-commerce Architecture

#### 1. **Services Management System**
- **Service Catalog** - Products/services database with categories
- **Pricing System** - Multiple pricing tiers, billing periods, currencies
- **Service Categories** - Hierarchical categorization with sorting
- **Service Management** - CRUD operations with admin interface

#### 2. **Shopping Cart System**
- **Cart State Management** - Zustand store with persistence
- **Cart Operations** - Add, remove, update quantities
- **Cart Calculations** - Subtotals, taxes, discounts
- **Guest Cart** - Temporary storage for non-logged-in users

#### 3. **Payment Processing**
- **Razorpay Integration** - Indian payment gateway
- **Payment Forms** - Secure payment collection
- **Order Processing** - Payment verification and order creation
- **Webhook Handling** - Payment status updates

#### 4. **Order Management**
- **Order Creation** - From cart to order conversion
- **Order Tracking** - Status updates and notifications
- **Order History** - Customer order management
- **Admin Order Management** - Order processing and fulfillment

### Target SvelteKit E-commerce Architecture

#### 1. **Services Structure**
```
src/routes/
├── services/
│   ├── +page.svelte              # Services listing
│   ├── [slug]/
│   │   └── +page.svelte          # Service details
│   └── category/
│       └── [category]/
│           └── +page.svelte      # Category pages
├── cart/
│   ├── +page.svelte              # Shopping cart
│   └── +server.ts                # Cart API
├── checkout/
│   ├── +page.svelte              # Checkout process
│   ├── payment/
│   │   └── +page.svelte          # Payment form
│   └── success/
│       └── +page.svelte          # Order confirmation
└── account/
    └── orders/
        ├── +page.svelte          # Order history
        └── [orderId]/
            └── +page.svelte      # Order details
```

#### 2. **Component Architecture**
- **Svelte Stores** - Cart state with persistence
- **Form Actions** - SvelteKit form actions for checkout
- **Payment Integration** - Razorpay SDK integration
- **Order Management** - Real-time order status updates

## Implementation Guide

### Week 1: Services Catalog & Shopping Cart

#### Day 1-3: Services Catalog Migration

**1. Services API Routes**
```typescript
// src/lib/server/api/routes/services/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

const getServicesSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(12),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  serviceType: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional()
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const params = Object.fromEntries(url.searchParams);
    const query = validateRequest(getServicesSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 12,
      category: params.category,
      featured: params.featured === 'true' ? true : undefined,
      serviceType: params.serviceType,
      search: params.search,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined
    });
    
    const supabase = createServiceRoleClient();
    const offset = (query.page - 1) * query.limit;
    
    // Build query with filters
    let dbQuery = supabase
      .from('products_services')
      .select(`
        *,
        category:service_categories!category_id(*),
        pricing:service_pricing!service_id(*)
      `, { count: 'exact' })
      .eq('published', true)
      .eq('available', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (query.category) {
      dbQuery = dbQuery.eq('service_categories.slug', query.category);
    }
    
    if (query.featured !== undefined) {
      dbQuery = dbQuery.eq('featured', query.featured);
    }
    
    if (query.serviceType) {
      dbQuery = dbQuery.eq('service_type', query.serviceType);
    }
    
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      dbQuery = dbQuery.gte('base_price', query.minPrice || 0)
                     .lte('base_price', query.maxPrice || 999999);
    }
    
    if (query.search) {
      dbQuery = dbQuery.or(`
        title.ilike.%${query.search}%,
        excerpt.ilike.%${query.search}%,
        description.ilike.%${query.search}%
      `);
    }
    
    const { data: services, error, count } = await dbQuery
      .range(offset, offset + query.limit - 1);
    
    if (error) throw error;
    
    return json({
      services: services || [],
      total: count || 0,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (err) {
    return handleApiError(err);
  }
}
```

**2. Services Listing Page**
```svelte
<!-- src/routes/services/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ServicesGrid from '$components/services/ServicesGrid.svelte';
  import ServicesFilters from '$components/services/ServicesFilters.svelte';
  import ServicesHero from '$components/services/ServicesHero.svelte';
  import { apiClient } from '$lib/api/client';
  
  let services = [];
  let categories = [];
  let loading = true;
  let pagination = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  };
  
  let filters = {
    category: '',
    serviceType: '',
    featured: false,
    search: '',
    minPrice: null,
    maxPrice: null
  };
  
  onMount(async () => {
    await Promise.all([
      loadServices(),
      loadCategories()
    ]);
    
    // Parse URL parameters
    const urlParams = new URLSearchParams($page.url.search);
    if (urlParams.toString()) {
      filters = {
        category: urlParams.get('category') || '',
        serviceType: urlParams.get('serviceType') || '',
        featured: urlParams.get('featured') === 'true',
        search: urlParams.get('search') || '',
        minPrice: urlParams.get('minPrice') ? parseFloat(urlParams.get('minPrice')) : null,
        maxPrice: urlParams.get('maxPrice') ? parseFloat(urlParams.get('maxPrice')) : null
      };
      await loadServices();
    }
  });
  
  async function loadServices() {
    try {
      loading = true;
      const response = await apiClient.services.getServices({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      services = response.services;
      pagination = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      };
      
      // Update URL with filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== false) {
          params.set(key, value.toString());
        }
      });
      
      const newUrl = `${$page.url.pathname}?${params.toString()}`;
      if (newUrl !== $page.url.href) {
        goto(newUrl, { replaceState: true, noScroll: true });
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      loading = false;
    }
  }
  
  async function loadCategories() {
    try {
      categories = await apiClient.services.getCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }
  
  function handleFilterChange(newFilters) {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    loadServices();
  }
  
  function handlePageChange(newPage) {
    pagination.page = newPage;
    loadServices();
  }
</script>

<svelte:head>
  <title>Services - Our Offerings</title>
  <meta name="description" content="Explore our comprehensive range of services designed to help you grow." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Hero Section -->
  <ServicesHero />
  
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Filters -->
    <ServicesFilters 
      {filters}
      {categories}
      on:change={(e) => handleFilterChange(e.detail)}
    />
    
    <!-- Services Grid -->
    <ServicesGrid 
      {services}
      {loading}
      {pagination}
      on:pageChange={(e) => handlePageChange(e.detail)}
    />
    
    <!-- No Results -->
    {#if !loading && services.length === 0}
    <div class="text-center py-12">
      <div class="text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No services found</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or search terms.
        </p>
      </div>
    </div>
    {/if}
  </div>
</div>
```

#### Day 4-5: Shopping Cart Implementation

**1. Cart Store with Svelte 5 Runes**
```typescript
// src/lib/stores/cart.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { CartItem, CartState } from '$lib/types/cart';

// Cart state with persistence
function createCartStore() {
  const { subscribe, set, update } = writable<CartState>({
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0,
    isLoading: false,
    error: null
  });
  
  // Load cart from localStorage on client side
  if (browser) {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        set(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }
  
  return {
    subscribe,
    
    // Add item to cart
    addItem: (service: CartItem['service'], quantity: number = 1) => {
      update(state => {
        const existingItemIndex = state.items.findIndex(
          item => item.service.id === service.id
        );
        
        let newItems;
        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = state.items.map((item, index) => {
            if (index === existingItemIndex) {
              return {
                ...item,
                quantity: item.quantity + quantity
              };
            }
            return item;
          });
        } else {
          // Add new item
          newItems = [...state.items, { service, quantity }];
        }
        
        const newState = {
          ...state,
          items: newItems,
          error: null
        };
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('cart', JSON.stringify(newState));
        }
        
        return newState;
      });
    },
    
    // Remove item from cart
    removeItem: (serviceId: string) => {
      update(state => {
        const newItems = state.items.filter(item => item.service.id !== serviceId);
        const newState = {
          ...state,
          items: newItems
        };
        
        if (browser) {
          localStorage.setItem('cart', JSON.stringify(newState));
        }
        
        return newState;
      });
    },
    
    // Update item quantity
    updateQuantity: (serviceId: string, quantity: number) => {
      if (quantity <= 0) {
        cartStore.removeItem(serviceId);
        return;
      }
      
      update(state => {
        const newItems = state.items.map(item => {
          if (item.service.id === serviceId) {
            return { ...item, quantity };
          }
          return item;
        });
        
        const newState = {
          ...state,
          items: newItems
        };
        
        if (browser) {
          localStorage.setItem('cart', JSON.stringify(newState));
        }
        
        return newState;
      });
    },
    
    // Clear cart
    clearCart: () => {
      const emptyState = {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null
      };
      
      set(emptyState);
      
      if (browser) {
        localStorage.removeItem('cart');
      }
    },
    
    // Set loading state
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    
    // Set error
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    }
  };
}

export const cartStore = createCartStore();

// Derived values for calculations
derived(cartStore, $cart => {
  const subtotal = $cart.items.reduce((sum, item) => {
    const price = item.service.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const itemCount = $cart.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate tax (assuming 18% GST for India)
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total,
    itemCount
  };
});
```

**2. Shopping Cart Page**
```svelte
<!-- src/routes/cart/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { cartStore } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import CartItem from '$components/cart/CartItem.svelte';
  import CartSummary from '$components/cart/CartSummary.svelte';
  import EmptyCart from '$components/cart/EmptyCart.svelte';
  
  let cart;
  let cartCalculations;
  
  $cart = cartStore;
  $cartCalculations = {
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  };
  
  // Subscribe to cart changes
  onMount(() => {
    const unsubscribe = cartStore.subscribe(state => {
      // Recalculate totals
      const subtotal = state.items.reduce((sum, item) => {
        const price = item.service.base_price || 0;
        return sum + (price * item.quantity);
      }, 0);
      
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      $cartCalculations = { subtotal, tax, total, itemCount };
    });
    
    return unsubscribe;
  });
  
  function handleCheckout() {
    if ($cart.items.length === 0) return;
    goto('/checkout');
  }
  
  function handleContinueShopping() {
    goto('/services');
  }
  
  function handleItemUpdate(serviceId: string, quantity: number) {
    cartStore.updateQuantity(serviceId, quantity);
  }
  
  function handleItemRemove(serviceId: string) {
    cartStore.removeItem(serviceId);
  }
</script>

<svelte:head>
  <title>Shopping Cart</title>
  <meta name="description" content="Review your selected services and proceed to checkout." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Header -->
  <div class="bg-white dark:bg-gray-800 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Shopping Cart
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Review your selected services before checkout
      </p>
    </div>
  </div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if $cart.items.length === 0}
      <EmptyCart on:continueShopping={handleContinueShopping} />
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          {#each $cart.items as item (item.service.id)}
            <CartItem 
              item={item}
              on:update={(e) => handleItemUpdate(item.service.id, e.detail)}
              on:remove={() => handleItemRemove(item.service.id)}
            />
          {/each}
          
          <!-- Continue Shopping -->
          <div class="mt-6">
            <button 
              on:click={handleContinueShopping}
              class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
        
        <!-- Cart Summary -->
        <div class="lg:col-span-1">
          <CartSummary 
            subtotal={$cartCalculations.subtotal}
            tax={$cartCalculations.tax}
            total={$cartCalculations.total}
            itemCount={$cartCalculations.itemCount}
            {isLoading={$cart.isLoading}
            {error={$cart.error}
            on:checkout={handleCheckout}
          />
        </div>
      </div>
    {/if}
  </div>
</div>
```

### Week 2: Payment Processing & Order Management

#### Day 6-8: Payment Integration

**1. Razorpay Integration**
```typescript
// src/lib/server/payments/razorpay.ts
import Razorpay from 'razorpay';
import { createServiceRoleClient } from '../supabase';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export interface PaymentOrder {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}

export async function createPaymentOrder(order: PaymentOrder) {
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: order.amount * 100, // Razorpay expects amount in paise
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
      payment_capture: 1
    });
    
    return razorpayOrder;
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    throw new Error('Payment order creation failed');
  }
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

export async function createCustomerOrder(
  userId: string,
  items: any[],
  total: number,
  paymentId: string
) {
  const supabase = createServiceRoleClient();
  
  try {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: total,
        currency: 'INR',
        status: 'paid',
        payment_id: paymentId,
        payment_status: 'completed',
        order_number: generateOrderNumber(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      service_id: item.service.id,
      service_title: item.service.title,
      quantity: item.quantity,
      unit_price: item.service.base_price,
      total_price: item.service.base_price * item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return order;
  } catch (error) {
    console.error('Failed to create customer order:', error);
    throw new Error('Order creation failed');
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}
```

**2. Checkout Process**
```svelte
<!-- src/routes/checkout/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import cartStore from '$lib/stores/cart';
  import CheckoutForm from '$components/checkout/CheckoutForm.svelte';
  import OrderSummary from '$components/checkout/OrderSummary.svelte';
  import { apiClient } from '$lib/api/client';
  
  let cart;
  let user = null;
  let loading = true;
  let paymentOrder = null;
  let error = null;
  
  $cart = cartStore;
  
  onMount(async () => {
    // Check if cart is empty
    if ($cart.items.length === 0) {
      goto('/cart');
      return;
    }
    
    // Load user data
    try {
      user = await apiClient.user.getProfile();
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
    
    loading = false;
  });
  
  async function handleCheckout(checkoutData) {
    try {
      cartStore.setLoading(true);
      error = null;
      
      // Create payment order
      const orderData = {
        amount: $cartCalculations.total,
        currency: 'INR',
        receipt: `receipt-${Date.now()}`,
        notes: {
          user_id: user?.id || 'guest',
          items_count: $cart.items.length
        }
      };
      
      paymentOrder = await apiClient.payments.createOrder(orderData);
      
      // Initialize Razorpay
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Your Company',
        description: 'Purchase of services',
        order_id: paymentOrder.id,
        handler: async function(response) {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: checkoutData.fullName,
          email: checkoutData.email,
          contact: checkoutData.phone
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            cartStore.setLoading(false);
          }
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.open();
      
    } catch (err) {
      error = err.message;
      cartStore.setLoading(false);
    }
  }
  
  async function handlePaymentSuccess(response) {
    try {
      // Verify payment
      const isVerified = await apiClient.payments.verifyPayment({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });
      
      if (!isVerified) {
        throw new Error('Payment verification failed');
      }
      
      // Create order in database
      const order = await apiClient.orders.create({
        items: $cart.items,
        total: $cartCalculations.total,
        paymentId: response.razorpay_payment_id
      });
      
      // Clear cart
      cartStore.clearCart();
      
      // Redirect to success page
      goto(`/checkout/success?order_id=${order.id}`);
      
    } catch (err) {
      error = err.message;
      cartStore.setLoading(false);
    }
  }
  
  // Calculate totals
  $: cartCalculations = {
    subtotal: $cart.items.reduce((sum, item) => {
      const price = item.service.base_price || 0;
      return sum + (price * item.quantity);
    }, 0),
    tax: 0,
    total: 0,
    itemCount: $cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };
  
  $: cartCalculations.tax = cartCalculations.subtotal * 0.18;
  $: cartCalculations.total = cartCalculations.subtotal + cartCalculations.tax;
</script>

<svelte:head>
  <title>Checkout - Complete Your Purchase</title>
  <meta name="description" content="Complete your purchase securely with our checkout process." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  {#if loading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Checkout Form -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Checkout Information
          </h2>
          
          {#if error}
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p class="text-red-600 dark:text-red-400">{error}</p>
            </div>
          {/if}
          
          <CheckoutForm 
            {user}
            {isLoading={$cart.isLoading}
            on:checkout={(e) => handleCheckout(e.detail)}
          />
        </div>
        
        <!-- Order Summary -->
        <div>
          <OrderSummary 
            items={$cart.items}
            subtotal={cartCalculations.subtotal}
            tax={cartCalculations.tax}
            total={cartCalculations.total}
          />
        </div>
      </div>
    </div>
  {/if}
</div>
```

#### Day 9-10: Order Management

**1. Order Management API**
```typescript
// src/lib/server/api/routes/orders/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAuth } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const session = await requireAuth(event);
    const supabase = createServiceRoleClient();
    
    const url = new URL(event.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          service:products_services (*)
        )
      `, { count: 'exact' })
      .eq('user_id', session.user.userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: orders, error, count } = await query
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      orders: orders || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(event: RequestEvent) {
  try {
    const session = await requireAuth(event);
    const data = await event.request.json();
    
    const supabase = createServiceRoleClient();
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.userId,
        total_amount: data.total,
        currency: data.currency || 'INR',
        status: 'pending',
        payment_id: data.paymentId,
        order_number: generateOrderNumber(),
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      service_id: item.service.id,
      service_title: item.service.title,
      quantity: item.quantity,
      unit_price: item.service.base_price,
      total_price: item.service.base_price * item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return json({ success: true, order });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Migration Strategy

### 1. **Payment Security**
- **PCI Compliance**: Ensure all payment data is handled securely
- **Webhook Verification**: Implement secure webhook signature verification
- **Error Handling**: Robust error handling for payment failures
- **Logging**: Comprehensive payment logging for debugging

### 2. **State Management**
- **Cart Persistence**: Local storage with server sync
- **Race Conditions**: Handle concurrent cart updates
- **Optimistic Updates**: Immediate UI updates with server confirmation

### 3. **User Experience**
- **Progressive Enhancement**: Cart works without JavaScript
- **Mobile Optimization**: Touch-friendly interface
- **Loading States**: Clear feedback during payment processing
- **Error Recovery**: Graceful handling of payment failures

## Common Issues & Solutions

### 1. **Cart State Synchronization**
**Problem**: Cart state not syncing between tabs
**Solution**: Use localStorage events for cross-tab communication
```typescript
// In cart store
if (browser) {
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      set(JSON.parse(e.newValue || '{}'));
    }
  });
}
```

### 2. **Payment Verification**
**Problem**: Payment verification failing
**Solution**: Ensure proper signature verification
```typescript
const crypto = require('crypto');
const generatedSignature = crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');
```

### 3. **Order Creation Race Conditions**
**Problem**: Duplicate orders on payment success
**Solution**: Use idempotency keys and database constraints
```typescript
const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

## Deliverables

### Code Deliverables
- [ ] Complete services catalog system
- [ ] Shopping cart with persistence
- [ ] Payment processing integration
- [ ] Order management system
- [ ] Customer order history
- [ ] Admin order management

### Documentation Deliverables
- [ ] Payment integration guide
- [ ] Order management documentation
- [ ] API documentation for e-commerce
- [ ] Security compliance documentation

### Testing Deliverables
- [ ] Payment flow testing
- [ ] Cart functionality tests
- [ ] Order management tests
- [ ] Security testing

## Success Criteria

### Technical Metrics
- [ ] Payment processing working with 99% success rate
- [ ] Cart state management reliable
- [ ] Order creation without duplicates
- [ ] Mobile-responsive checkout
- [ ] Page load times <2 seconds

### Functional Metrics
- [ ] Complete e-commerce workflow
- [ ] Secure payment processing
- [ ] Order tracking functionality
- [ ] Customer order management
- [ ] Admin order processing

## Next Phase Preparation

Upon completion of Phase 3, the team will have:
1. **Complete e-commerce system** with payment processing
2. **Robust order management** for customers and admins
3. **Secure payment integration** with Razorpay
4. **Shopping cart system** with persistence
5. **Service catalog** with advanced filtering

This foundation enables the team to proceed with **Phase 4: Advanced Features Migration** with a fully functional e-commerce platform.

---

**Phase 3 Status**: 🔄 Ready to Start
**Dependencies**: Phase 1 & 2 completion
**Blocked By**: Payment gateway setup
**Next Phase**: Phase 4 - Advanced Features Migration
