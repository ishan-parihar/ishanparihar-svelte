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
      amount: Math.round(order.amount * 100), // Razorpay expects amount in paise
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
    const crypto = await import('crypto');
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