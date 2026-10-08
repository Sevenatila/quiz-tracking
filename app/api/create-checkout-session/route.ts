import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const {
      baseAmount = 9.90,
      orderBumps = [],
      customerEmail,
      successUrl,
      cancelUrl
    } = await request.json();

    // Linha principal do produto
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: 'price_1Sq2SgKCl7aD0UYpHL816zsO',
        quantity: 1,
      }
    ];

    // Adicionar order bumps como line items
    orderBumps.forEach((bump: { id: string; price: number; title: string }) => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: bump.title,
            metadata: {
              order_bump: 'true',
              bump_id: bump.id,
            }
          },
          unit_amount: Math.round(bump.price * 100), // converter para centavos
        },
        quantity: 1,
      });
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/es`,
      customer_email: customerEmail,
      metadata: {
        language: 'es',
        source: 'checkout_session_es',
        order_bumps: orderBumps.map((b: any) => b.id).join(','),
      },
      automatic_tax: {
        enabled: false,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}