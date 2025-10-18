import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError } from '../../../lib/server/api/utils';
import { createPaymentOrder, verifyPayment } from '../../../lib/server/payments/razorpay';

// Handle different HTTP methods for payments
export async function POST(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const pathname = url.pathname;
    
    if (pathname.includes('/api/payments/create-order')) {
      // Create a new payment order
      const data = await event.request.json();
      const order = await createPaymentOrder({
        amount: data.amount,
        currency: data.currency || 'INR',
        receipt: data.receipt,
        notes: data.notes || {}
      });
      
      return json({ success: true, order });
    } else if (pathname.includes('/api/payments/verify')) {
      // Verify a payment
      const data = await event.request.json();
      const isValid = await verifyPayment(
        data.orderId,
        data.paymentId,
        data.signature
      );
      
      if (!isValid) {
        return json({ success: false, error: 'Payment verification failed' }, { status: 400 });
      }
      
      return json({ success: true });
    } else {
      return json({ error: 'Unknown endpoint' }, { status: 404 });
    }
  } catch (error) {
    return handleApiError(error);
 }
}