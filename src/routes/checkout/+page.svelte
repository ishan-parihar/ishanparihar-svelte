<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { cartStore, cartCalculations } from '$lib/stores/cart';
  import { apiClient } from '$lib/api/client';
  
  let user = $state(null);
  let loading = $state(true);
  let error = $state(null);
  let checkoutData = $state({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  
  // Load user data and check cart
  onMount(async () => {
    // Check if cart is empty
    if (cartStore.state.items.length === 0) {
      goto('/cart');
      return;
    }
    
    // Load user data
    try {
      user = await apiClient.user.getProfile();
      if (user) {
        checkoutData.fullName = user.name || '';
        checkoutData.email = user.email || '';
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
    
    loading = false;
  });
  
  async function handleCheckout() {
    try {
      cartStore.setLoading(true);
      error = null;
      
      // Create payment order
      const orderData = {
        amount: cartCalculations().total,
        currency: 'INR',
        receipt: `receipt-${Date.now()}`,
        notes: {
          user_id: user?.id || 'guest',
          items_count: cartStore.state.items.length
        }
      };
      
      // Create payment order with Razorpay
      const paymentOrder = await apiClient.payments.createOrder(orderData);
      
      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'Your Company',
          description: 'Purchase of services',
          order_id: paymentOrder.id,
          handler: async function(response: any) {
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
        
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.head.appendChild(script);
    } catch (err) {
      error = err.message;
      cartStore.setLoading(false);
    }
  }
  
  async function handlePaymentSuccess(response: any) {
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
        items: cartStore.state.items,
        total: cartCalculations().total,
        paymentId: response.razorpay_payment_id,
        customerName: checkoutData.fullName,
        customerEmail: checkoutData.email,
        customerPhone: checkoutData.phone
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
 $: subtotal = cartStore.state.items.reduce((sum, item) => {
    const price = item.service.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  $: tax = subtotal * 0.18;
  $: total = subtotal + tax;
  $: itemCount = cartStore.state.items.reduce((sum, item) => sum + item.quantity, 0);
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
          <h2 class="text-2xl font-bold text-gray-90 dark:text-white mb-6">
            Checkout Information
          </h2>
          
          {#if error}
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p class="text-red-600 dark:text-red-400">{error}</p>
            </div>
          {/if}
          
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <!-- Contact Information -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
              
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    bind:value={checkoutData.fullName}
                  />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-30 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={checkoutData.email}
                    />
                  </div>
                  
                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-30 mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={checkoutData.phone}
                    />
                  </div>
                </div>
              </div>
            
            <!-- Shipping Address -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Address</h3>
              
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    bind:value={checkoutData.address}
                  />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={checkoutData.city}
                    />
                  </div>
                  
                  <div>
                    <label for="state" class="block text-sm font-medium text-gray-70 dark:text-gray-300 mb-1">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={checkoutData.state}
                    />
                  </div>
                  
                  <div>
                    <label for="zipCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={checkoutData.zipCode}
                    />
                  </div>
                </div>
                
                <div>
                  <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    bind:value={checkoutData.country}
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Place Order Button -->
            <button
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 disabled:opacity-50"
              disabled={cartStore.state.isLoading}
              on:click={handleCheckout}
            >
              {#if cartStore.state.isLoading}
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              {:else}
                Place Order (₹{total.toLocaleString()})
              {/if}
            </button>
          </div>
        
        <!-- Order Summary -->
        <div>
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sticky top-8">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h3>
            
            <div class="space-y-4">
              {#each cartStore.state.items as item}
                <div class="flex justify-between">
                  <div>
                    <p class="text-gray-700 dark:text-gray-300">{item.service.title}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p class="text-gray-900 dark:text-white">₹{(item.service.base_price * item.quantity).toLocaleString()}</p>
                </div>
              {/each}
            </div>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              <div class="flex justify-between text-gray-60 dark:text-gray-300">
                <span>Tax (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div class="flex justify-between text-lg font-semibold text-gray-90 dark:text-white">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>Secure payment processing</p>
              <p class="mt-1">Your information is protected with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>