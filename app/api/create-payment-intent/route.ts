import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata = {} } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // converter para centavos
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        language: 'es',
        product: 'plantilla_finanzas',
        product_id: 'prod_TndkEofl99cDIY',
        price_id: 'price_1Sq2SgKCl7aD0UYpHL816zsO',
        base_price_id: 'price_1Sq2SgKCl7aD0UYpHL816zsO',
        ...metadata,
      },
      receipt_email: metadata.customer_email && metadata.customer_email !== 'not_provided_yet'
        ? metadata.customer_email
        : undefined,
    });

    // Salvar pedido inicial no banco (status: pending)
    if (metadata.customer_email && metadata.customer_email !== 'not_provided_yet') {
      await prisma.order.create({
        data: {
          stripePaymentIntentId: paymentIntent.id,
          customerEmail: metadata.customer_email,
          amount: amount,
          currency: currency,
          status: 'pending',
          source: metadata.source || 'unknown',
          baseAmount: parseFloat(metadata.base_amount || '0'),
          orderBumps: metadata.order_bumps?.split(',').filter(Boolean) || [],
          orderBumpPrices: metadata.order_bump_prices?.split(',').filter(Boolean) || [],
          orderBumpProducts: metadata.order_bump_products?.split(',').filter(Boolean) || []
        }
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}