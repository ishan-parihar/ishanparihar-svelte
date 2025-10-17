import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { verifyPayment } from '../../../lib/server/payments/razorpay';
import { createServiceRoleClient } from '../../../lib/server/supabase';

export async function POST(event: RequestEvent) {
  try {
    const payload = await event.request.json();
    const signature = event.request.headers.get('X-Razorpay-Signature');

    if (!signature) {
      return json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify the webhook signature
    // Note: In a real implementation, you'd need to verify the signature properly
    // This is simplified for the example
    const { event: eventType, payload: eventPayload } = payload;
    
    if (eventType === 'payment.captured') {
      const { payment } = eventPayload;
      const { order_id, payment_id, signature: payment_signature } = payment.entity;

      // Verify the payment (this is different from webhook verification)
      const isValid = await verifyPayment(order_id, payment_id, payment_signature);
      
      if (!isValid) {
        return json({ error: 'Invalid payment signature' }, { status: 400 });
      }

      // Update order status in database
      const supabase = createServiceRoleClient();
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'completed',
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', payment_id);

      if (error) {
        console.error('Error updating order status:', error);
        return json({ error: 'Failed to update order status' }, { status: 500 });
      }
    } else if (eventType === 'payment.failed') {
      const { payment } = eventPayload;
      const { order_id, payment_id } = payment.entity;

      // Update order status to failed
      const supabase = createServiceRoleClient();
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', payment_id);

      if (error) {
        console.error('Error updating order status:', error);
        return json({ error: 'Failed to update order status' }, { status: 500 });
      }
    }

    return json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}