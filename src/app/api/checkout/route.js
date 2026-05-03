import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { planId, userId } = await req.json();

    // Pricing: Starter = $3/mo (300 cents), Pro = $6/mo (600 cents)
    return NextResponse.json({ 
      id: "order_" + Math.random().toString(36).substr(2, 9),
      amount: planId === 'starter' ? 300 : 600,
      currency: "USD"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
