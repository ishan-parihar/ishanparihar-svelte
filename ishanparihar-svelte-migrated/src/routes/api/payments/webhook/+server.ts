import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

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
      .createHmac('sha256', env.PRIVATE_RAZORPAY_WEBHOOK_SECRET)
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
  // In a real implementation, you would create an order record in the database
  // and process the order fulfillment
  try {
    // Create order record in database
    // await createOrderRecord(order, payment);
    
    // Process order fulfillment (e.g., generate invoice, update inventory)
    // await processOrderFulfillment(order.id);
    
    // Send order confirmation email
    // await sendOrderConfirmationEmail(order.id);
    
    console.log(`Order ${order.id} paid with payment ${payment.id}`);
  } catch (error) {
    console.error('Error handling order payment:', error);
  }
}