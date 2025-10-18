import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PRIVATE_ENV } from '$lib/env';
import { getSupabase } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-Razorpay-Signature');
    
    if (!signature) {
      return json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature using secret
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', PRIVATE_ENV.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch');
      return json({ error: 'Invalid signature' }, { status: 400 });
    }

    const webhookData = JSON.parse(body);
    const { event, payload } = webhookData;

    console.log('Razorpay webhook received:', event, payload);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(payload.order.entity, payload.payment.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return json({ error: 'Webhook processing failed' }, { status: 500 });
  }
};

async function handlePaymentCaptured(payment: any) {
  console.log('Payment captured:', payment);
  // In a real implementation, you would update the order status in the database to 'paid'
  // and send a confirmation email to the customer
  try {
    // Update order status in database
    // await updateOrderStatus(payment.order_id, 'paid');
    
    // Send confirmation email to customer
    // await sendOrderConfirmationEmail(payment.order_id);
    
    console.log(`Payment ${payment.id} for order ${payment.order_id} captured successfully`);
  } catch (error) {
    console.error('Error handling payment capture:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  console.log('Payment failed:', payment);
  // In a real implementation, you would update the order status in the database to 'failed'
  // and potentially send a notification to the customer
  try {
    // Update order status in database
    // await updateOrderStatus(payment.order_id, 'failed');
    
    // Send notification to customer about failed payment
    // await sendPaymentFailureNotification(payment.order_id);
    
    console.log(`Payment ${payment.id} for order ${payment.order_id} failed`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

 async function handleOrderPaid(order: any, payment: any) {
   console.log('Order paid:', order, payment);
   try {
     // Update the order status in the database to 'paid'
     const supabase = getSupabase();
     
     // First, try to match the order using the Razorpay order ID which was stored as razorpay_order_id during order creation
     const { data, error } = await supabase
       .from('orders')
       .update({ 
         status: 'paid',
         payment_id: payment.id, // Store the actual payment ID from Razorpay
         updated_at: new Date().toISOString()
       })
       .eq('razorpay_order_id', order.id) // Match by the Razorpay order ID (which was stored as razorpay_order_id during order creation)
       .select()
       .single();
     
     if (error) {
       console.error('Error updating order status by razorpay_order_id:', error);
       
       // If that doesn't work, try a more general approach - matching by order number that might contain the Razorpay order ID
       const { data: fallbackData, error: fallbackError } = await supabase
         .from('orders')
         .update({ 
           status: 'paid',
           payment_id: payment.id,
           updated_at: new Date().toISOString()
         })
         .ilike('order_number', `%${order.id}%`) // Try matching by order number that contains the Razorpay order ID
         .select()
         .single();
       
       if (fallbackError) {
         console.error('Error updating order status by order number:', fallbackError);
         // If still failing, we might be dealing with the different table structure
         // Try matching by payment_id field (in case the original was stored in payment_id instead of razorpay_order_id)
         const { data: alternateData, error: alternateError } = await supabase
           .from('orders')
           .update({ 
             status: 'paid',
             payment_id: payment.id,
             updated_at: new Date().toISOString()
           })
           .eq('payment_id', order.id) // Try matching by payment_id field
           .select()
           .single();
           
         if (alternateError) {
           console.error('All attempts to match order failed:', alternateError);
           // Log the details for debugging
           console.log(`Could not find order for Razorpay order ${order.id} and payment ${payment.id}`);
           console.log('Payment details:', { 
             payment_id: payment.id, 
             order_id: payment.order_id, 
             razorpay_signature: payment.signature 
           });
           return; // Exit without throwing error to avoid webhook retries
         } else {
           console.log(`Order ${alternateData.id} status updated to paid with payment ${payment.id} (using alternate matching)`);
         }
       } else {
         console.log(`Order ${fallbackData.id} status updated to paid with payment ${payment.id} (using order number matching)`);
       }
     } else {
       console.log(`Order ${data.id} status updated to paid with payment ${payment.id}`);
     }
     
     // TODO: Send order confirmation email to customer
     // await sendOrderConfirmationEmail(data?.id || fallbackData?.id || alternateData?.id);
     
   } catch (error) {
     console.error('Error handling order payment:', error);
   }
 }