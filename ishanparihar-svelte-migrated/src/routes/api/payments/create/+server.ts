import { json } from '@sveltejs/kit';
import { RazorpayService } from '$lib/server/payments/razorpay';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Authenticate user
    const session = await locals.getSession();
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'INR', receipt, notes } = await request.json();

    if (!amount || amount <= 0) {
      return json({ error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = new RazorpayService();
    
    const order = await razorpay.createOrder({
      amount,
      currency,
      receipt,
      notes
    });

    return json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      created_at: order.created_at
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return json({ error: 'Failed to create payment order' }, { status: 500 });
  }
};