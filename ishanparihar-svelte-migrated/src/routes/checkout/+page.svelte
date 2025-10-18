<script lang="ts">
  import { cartStore } from '$lib/stores/cart';
  import CartSummary from '$lib/components/cart/CartSummary.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  const { state: cartState } = cartStore;
  let currentStep = $state(0); // 0: shipping, 1: payment, 2: review
  let isProcessing = $state(false);
  let error = $state<string | null>(null);
  let razorpayLoaded = $state(false);

  let shippingInfo = $state({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  let billingInfo = $state({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  onMount(async () => {
    // Load Razorpay script dynamically
    if (browser) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        razorpayLoaded = true;
      };
      script.onerror = () => {
        error = 'Failed to load payment gateway. Please try again later.';
      };
      document.head.appendChild(script);
    }
  });

  const handleShippingSubmit = (e: Event) => {
    e.preventDefault();
    if (validateShipping()) {
      currentStep = 1;
    }
  };

  const handleBillingSubmit = (e: Event) => {
    e.preventDefault();
    if (validateBilling()) {
      currentStep = 2;
    }
  };

   const handlePaymentSubmit = async (e: Event) => {
     e.preventDefault();
     isProcessing = true;
     error = null;

     try {
       if (!razorpayLoaded) {
         throw new Error('Payment gateway is still loading. Please try again in a moment.');
       }

       // Step 1: Create payment order with Razorpay
       const paymentData = {
         amount: cartState.total, // amount in smallest currency unit (paise for INR)
         currency: 'INR',
         receipt: `receipt_${Date.now()}`,
         notes: {
           user_id: 'user-id-placeholder', // Replace with actual user ID when available
         }
       };

       const paymentResponse = await fetch('/api/payments/create', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(paymentData)
       });

       if (!paymentResponse.ok) {
         const paymentError = await paymentResponse.json();
         throw new Error(paymentError.error || 'Failed to create payment order');
       }

       const paymentOrder = await paymentResponse.json();

       // Step 2: Initialize Razorpay checkout
       const options = {
         key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with actual key from env
         amount: paymentOrder.amount,
         currency: paymentOrder.currency,
         name: 'Service Platform',
         description: 'Order Payment',
         order_id: paymentOrder.id,
         handler: async function(response: any) {
           // Payment successful - now create the actual order in our database
           try {
                const orderData = {
                  items: cartState.items.map(item => ({
                    service_id: item.service.id,
                    service_title: item.service.title,
                    quantity: item.quantity,
                    unit_price: item.service.price || 0,
                    total_price: (item.service.price || 0) * item.quantity
                  })),
               shipping_address: {
                 first_name: shippingInfo.firstName,
                 last_name: shippingInfo.lastName,
                 email: shippingInfo.email,
                 phone: shippingInfo.phone,
                 address: shippingInfo.address,
                 city: shippingInfo.city,
                 state: shippingInfo.state,
                 zip_code: shippingInfo.zipCode,
                 country: shippingInfo.country
               },
               billing_address: !billingInfo.sameAsShipping ? {
                 first_name: billingInfo.firstName,
                 last_name: billingInfo.lastName,
                 email: billingInfo.email,
                 phone: billingInfo.phone,
                 address: billingInfo.address,
                 city: billingInfo.city,
                 state: billingInfo.state,
                 zip_code: billingInfo.zipCode,
                 country: billingInfo.country
               } : undefined,
               payment_id: response.razorpay_order_id, // This is the Razorpay order ID from the payment response
               total_amount: cartState.total,
               currency: 'INR'
             };

             const orderResponse = await fetch('/api/orders/create', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               body: JSON.stringify(orderData)
             });

             if (!orderResponse.ok) {
               const orderError = await orderResponse.json();
               console.error('Order creation failed:', orderError);
               error = orderError.error || 'Failed to create order';
               return;
             }

             const orderResult = await orderResponse.json();
             
             // Clear cart and redirect to success page
             cartStore.clearCart();
             if (browser) {
               goto('/checkout/success');
             }
           } catch (orderErr) {
             console.error('Order creation error:', orderErr);
             error = 'Payment succeeded but order creation failed';
           }
         },
         prefill: {
           name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
           email: shippingInfo.email,
           contact: shippingInfo.phone
         },
         theme: {
           color: '#3b82f6' // Tailwind blue-500
         }
       };

       const razorpay = new (window as any).Razorpay(options);
       razorpay.open();
     } catch (err) {
       error = (err as Error).message || 'Payment processing failed. Please try again.';
       console.error('Payment error:', err);
     } finally {
       isProcessing = false;
     }
   };

  const validateShipping = (): boolean => {
    if (!shippingInfo.firstName.trim() || !shippingInfo.lastName.trim()) {
      error = 'Please enter your full name';
      return false;
    }
    if (!shippingInfo.email.trim() || !isValidEmail(shippingInfo.email)) {
      error = 'Please enter a valid email address';
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      error = 'Please enter a phone number';
      return false;
    }
    if (!shippingInfo.address.trim() || !shippingInfo.city.trim() || !shippingInfo.state.trim() || !shippingInfo.zipCode.trim()) {
      error = 'Please fill in all address fields';
      return false;
    }
    
    error = null;
    return true;
  };

  const validateBilling = (): boolean => {
    if (!billingInfo.sameAsShipping) {
      if (!billingInfo.firstName.trim() || !billingInfo.lastName.trim()) {
        error = 'Please enter your full name';
        return false;
      }
      if (!billingInfo.email.trim() || !isValidEmail(billingInfo.email)) {
        error = 'Please enter a valid email address';
        return false;
      }
      if (!billingInfo.phone.trim()) {
        error = 'Please enter a phone number';
        return false;
      }
      if (!billingInfo.address.trim() || !billingInfo.city.trim() || !billingInfo.state.trim() || !billingInfo.zipCode.trim()) {
        error = 'Please fill in all address fields';
        return false;
      }
    }
    
    error = null;
    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      currentStep = step;
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      currentStep--;
    }
  };

  // When same as shipping is checked, sync billing info
  $effect(() => {
    if (billingInfo.sameAsShipping) {
      billingInfo.firstName = shippingInfo.firstName;
      billingInfo.lastName = shippingInfo.lastName;
      billingInfo.email = shippingInfo.email;
      billingInfo.phone = shippingInfo.phone;
      billingInfo.address = shippingInfo.address;
      billingInfo.city = shippingInfo.city;
      billingInfo.state = shippingInfo.state;
      billingInfo.zipCode = shippingInfo.zipCode;
      billingInfo.country = shippingInfo.country;
    }
  });
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

  <!-- Progress Steps -->
  <div class="mb-8">
    <nav aria-label="Checkout steps" class="flex justify-between">
      {#each ['Shipping', 'Payment', 'Review'] as stepName, i}
        <div class="flex items-center">
           <button
             type="button"
             class="flex items-center"
             onclick={() => goToStep(i)}
             disabled={i > currentStep}
           >
            <span class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </span>
            <span class="ml-2 text-sm font-medium text-gray-700">{stepName}</span>
          </button>
          
          {#if i < 2}
            <div class={`ml-2 h-0.5 w-16 ${
              i < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
          {/if}
        </div>
      {/each}
    </nav>
  </div>

  {#if error}
    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
      {#if currentStep === 0}
        <!-- Shipping Information Step -->
         <form onsubmit={handleShippingSubmit}>
          <div class="bg-white shadow sm:rounded-md">
            <div class="px-4 py-5 sm:p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="shipping-first-name" class="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="shipping-first-name"
                    type="text"
                    bind:value={shippingInfo.firstName}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label for="shipping-last-name" class="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="shipping-last-name"
                    type="text"
                    bind:value={shippingInfo.lastName}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label for="shipping-email" class="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="shipping-email"
                    type="email"
                    bind:value={shippingInfo.email}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label for="shipping-phone" class="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="shipping-phone"
                    type="tel"
                    bind:value={shippingInfo.phone}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label for="shipping-address" class="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    id="shipping-address"
                    type="text"
                    bind:value={shippingInfo.address}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label for="shipping-city" class="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    id="shipping-city"
                    type="text"
                    bind:value={shippingInfo.city}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label for="shipping-state" class="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    id="shipping-state"
                    type="text"
                    bind:value={shippingInfo.state}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label for="shipping-zip" class="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    id="shipping-zip"
                    type="text"
                    bind:value={shippingInfo.zipCode}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label for="shipping-country" class="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="shipping-country"
                    bind:value={shippingInfo.country}
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
             <Button type="submit" class="ml-3">
               Continue to Payment
             </Button>
             <Button type="button" variant="outline" onclick={() => goto('/cart')}>
               Back to Cart
             </Button>
            </div>
          </div>
        </form>
      {/if}

      {#if currentStep === 1}
        <!-- Payment Information Step -->
               <form onsubmit={handlePaymentSubmit}>
          <div class="bg-white shadow sm:rounded-md">
            <div class="px-4 py-5 sm:p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
              
              <!-- Billing Information -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <input
                    id="same-as-shipping"
                    type="checkbox"
                    bind:checked={billingInfo.sameAsShipping}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="same-as-shipping" class="ml-2 block text-sm text-gray-900">
                    Billing address same as shipping address
                  </label>
                </div>
                
                {#if !billingInfo.sameAsShipping}
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="billing-first-name" class="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        id="billing-first-name"
                        type="text"
                        bind:value={billingInfo.firstName}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div>
                      <label for="billing-last-name" class="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        id="billing-last-name"
                        type="text"
                        bind:value={billingInfo.lastName}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div class="sm:col-span-2">
                      <label for="billing-email" class="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        id="billing-email"
                        type="email"
                        bind:value={billingInfo.email}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div class="sm:col-span-2">
                      <label for="billing-phone" class="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        id="billing-phone"
                        type="tel"
                        bind:value={billingInfo.phone}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div class="sm:col-span-2">
                      <label for="billing-address" class="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <input
                        id="billing-address"
                        type="text"
                        bind:value={billingInfo.address}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div>
                      <label for="billing-city" class="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        id="billing-city"
                        type="text"
                        bind:value={billingInfo.city}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div>
                      <label for="billing-state" class="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        id="billing-state"
                        type="text"
                        bind:value={billingInfo.state}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div>
                      <label for="billing-zip" class="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        id="billing-zip"
                        type="text"
                        bind:value={billingInfo.zipCode}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!billingInfo.sameAsShipping}
                      />
                    </div>
                    
                    <div>
                      <label for="billing-country" class="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        id="billing-country"
                        bind:value={billingInfo.country}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                   </div>
                {/if}
              </div>
              
              <!-- Payment Method -->
              <div class="mb-6">
                <h3 class="text-md font-medium text-gray-900 mb-3">Payment Method</h3>
                
                <div class="space-y-2">
                  <div class="flex items-center">
                    <input
                      id="payment-razorpay"
                      name="payment-method"
                      type="radio"
                      checked
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label for="payment-razorpay" class="ml-3 block text-sm text-gray-700">
                      Razorpay (Credit/Debit Card, Net Banking, UPI)
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="payment-cod"
                      name="payment-method"
                      type="radio"
                      disabled
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label for="payment-cod" class="ml-3 block text-sm text-gray-700">
                      Cash on Delivery (Coming Soon)
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Card Details Placeholder -->
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-md font-medium text-gray-900 mb-3">Card Details</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div class="sm:col-span-2">
                     <label for="card-number" class="block text-sm font-medium text-gray-700 mb-1">
                       Card Number
                     </label>
                     <input
                       id="card-number"
                       type="text"
                       placeholder="1234 5678 9012 3456"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       disabled
                     />
                   </div>
                   
                   <div>
                     <label for="expiry-date" class="block text-sm font-medium text-gray-700 mb-1">
                       Expiry Date
                     </label>
                     <input
                       id="expiry-date"
                       type="text"
                       placeholder="MM/YY"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       disabled
                     />
                   </div>
                   
                   <div>
                     <label for="cvc" class="block text-sm font-medium text-gray-700 mb-1">
                       CVC
                     </label>
                     <input
                       id="cvc"
                       type="text"
                       placeholder="123"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       disabled
                     />
                   </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" disabled={isProcessing}>
                {#if isProcessing}
                  Processing Payment...
                {:else}
                  Place Order
                {/if}
              </Button>
               <Button type="button" variant="outline" onclick={goBack} class="mr-2">
                 Back
               </Button>
               <Button type="button" variant="outline" onclick={() => goto('/cart')}>
                 Back to Cart
               </Button>
            </div>
          </div>
        </form>
      {/if}

      {#if currentStep === 2}
        <!-- Order Review Step -->
        <div class="bg-white shadow sm:rounded-md">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Review Your Order</h2>
            
            <div class="mb-6">
              <h3 class="text-md font-medium text-gray-900 mb-2">Shipping Information</h3>
              <div class="bg-gray-50 p-4 rounded-md">
                <p class="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p>{shippingInfo.email}</p>
                <p>{shippingInfo.phone}</p>
                <p>{shippingInfo.address}</p>
                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <p>{shippingInfo.country}</p>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="text-md font-medium text-gray-900 mb-2">Billing Information</h3>
              <div class="bg-gray-50 p-4 rounded-md">
                {#if billingInfo.sameAsShipping}
                  <p class="text-sm italic">Same as shipping address</p>
                {:else}
                  <p class="font-medium">{billingInfo.firstName} {billingInfo.lastName}</p>
                  <p>{billingInfo.email}</p>
                  <p>{billingInfo.phone}</p>
                  <p>{billingInfo.address}</p>
                  <p>{billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}</p>
                  <p>{billingInfo.country}</p>
                {/if}
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="text-md font-medium text-gray-900 mb-2">Payment Method</h3>
              <div class="bg-gray-50 p-4 rounded-md">
                <p>Razorpay (Credit/Debit Card, Net Banking, UPI)</p>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="text-md font-medium text-gray-900 mb-2">Order Items</h3>
              <div class="bg-gray-50 p-4 rounded-md">
                {#each cartState.items as item (item.service.id)}
                  <div class="flex justify-between py-2 border-b border-gray-200 last:border-0">
                    <div>
                      <p class="font-medium">{item.service.title}</p>
                      <p class="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p>₹{(item.service.price || 0) * item.quantity}</p>
                  </div>
                {/each}
              </div>
            </div>
            
            <div class="border-t border-gray-200 pt-6">
              <form onsubmit={handlePaymentSubmit}>
                <div class="flex justify-end space-x-3">
                   <Button type="button" variant="outline" onclick={goBack}>
                     Back
                   </Button>
                   <Button type="button" variant="outline" onclick={() => goto('/cart')}>
                     Back to Cart
                   </Button>
                   <Button type="submit" disabled={isProcessing}>
                    {#if isProcessing}
                      Placing Order...
                    {:else}
                      Place Order
                    {/if}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="lg:col-span-1">
      <div class="sticky top-8">
        <CartSummary onCheckout={() => {}} />
      </div>
    </div>
  </div>
</div>