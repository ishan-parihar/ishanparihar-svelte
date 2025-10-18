import { browser } from '$app/environment';
import type { CartItem, CartState, Service } from '$lib/types/cart';

// Cart state with persistence
function createCartStore() {
  // Initialize state
 let state = $state<CartState>({
    items: [],
    subtotal: 0,
    tax: 0,
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
        state = { ...state, ...parsedCart };
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }

  // Subscribe to state changes to update calculations and persist
  $effect(() => {
    // Calculate derived values
    const subtotal = state.items.reduce((sum, item) => {
      const price = item.service.base_price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate tax (assuming 18% GST for India)
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    // Update state with calculated values
    state.subtotal = subtotal;
    state.tax = tax;
    state.total = total;
    state.itemCount = itemCount;

    // Save to localStorage when state changes
    if (browser) {
      localStorage.setItem('cart', JSON.stringify(state));
    }
  });

  return {
    get state() {
      return state;
    },
    
    // Add item to cart
    addItem: (service: Service, quantity: number = 1) => {
      const existingItemIndex = state.items.findIndex(
        item => item.service.id === service.id
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.items = [...state.items, { service, quantity }];
      }
      
      state.error = null;
    },
    
    // Remove item from cart
    removeItem: (serviceId: string) => {
      state.items = state.items.filter(item => item.service.id !== serviceId);
    },
    
    // Update item quantity
    updateQuantity: (serviceId: string, quantity: number) => {
      if (quantity <= 0) {
        cartStore.removeItem(serviceId);
        return;
      }
      
      const itemIndex = state.items.findIndex(item => item.service.id === serviceId);
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
      }
    },
    
    // Clear cart
    clearCart: () => {
      state.items = [];
      state.subtotal = 0;
      state.total = 0;
      state.itemCount = 0;
      state.error = null;
      
      if (browser) {
        localStorage.removeItem('cart');
      }
    },
    
    // Set loading state
    setLoading: (isLoading: boolean) => {
      state.isLoading = isLoading;
    },
    
    // Set error
    setError: (error: string | null) => {
      state.error = error;
    }
  };
}

export const cartStore = createCartStore();

// Helper functions for cart calculations
export const cartCalculations = () => {
  const state = cartStore.state;
  return {
    subtotal: state.subtotal,
    tax: state.subtotal * 0.18,
    total: state.total,
    itemCount: state.itemCount
  };
};