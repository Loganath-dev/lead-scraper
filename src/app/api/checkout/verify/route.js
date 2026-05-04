import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId,
      userId
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId || !userId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid signature, possible tampering' }, { status: 400 });
    }

    // Payment is verified, upgrade user in database
    const creditsToGrant = planId === 'pro' ? 2500 : 1000;

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        subscription_tier: planId,
        credits_remaining: creditsToGrant 
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database Update Error:', updateError);
      return NextResponse.json({ error: 'Payment verified but failed to update profile' }, { status: 500 });
    }

    console.log(`[PAYMENT SUCCESS] User ${userId} upgraded to ${planId}`);
    return NextResponse.json({ success: true, message: 'Subscription upgraded successfully' });

  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
