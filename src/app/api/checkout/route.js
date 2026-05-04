import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  const razorpay = new Razorpay({
    key_id,
    key_secret,
  });

  console.log('Using Key ID:', key_id?.substring(0, 7));
  try {
    const { planId, userId } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing planId or userId' }, { status: 400 });
    }

    // Pricing: Starter = $4 (400 cents), Pro = $8 (800 cents)
    const amount = planId === 'pro' ? 800 : 400;

    const options = {
      amount: amount * 100, // Razorpay expects amount in smallest currency unit (cents)
      currency: "USD",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        planId,
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json({ error: JSON.stringify(error) || error.message || 'Internal Server Error' }, { status: 500 });
  }
}
