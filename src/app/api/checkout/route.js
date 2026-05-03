import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { planId, userId } = await req.json();

    // Pricing: Starter = $4/mo (400 cents), Pro = $8/mo (800 cents)
    return NextResponse.json({ 
      id: "order_" + Math.random().toString(36).substr(2, 9),
      amount: planId === 'starter' ? 400 : 800,
      currency: "USD"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
