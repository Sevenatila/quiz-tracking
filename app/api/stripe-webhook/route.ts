import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = headers().get('stripe-signature');

    if (!sig) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook event received:', event.type);

    // Handle payment success events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
    }

    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;
      // Get payment intent if available
      if (charge.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
          await handlePaymentSuccess(paymentIntent);
        } catch (error) {
          console.error('Error retrieving payment intent:', error);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('🎉 Processing successful payment:', paymentIntent.id);

    const metadata = paymentIntent.metadata;

    // Tentar obter email do metadata, billing_details ou charges
    let customerEmail = metadata.customer_email;

    if (!customerEmail || customerEmail === 'not_provided_yet' || customerEmail === 'not_provided') {
      // Tentar obter do payment method billing details
      try {
        if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
          if (charge.billing_details?.email) {
            customerEmail = charge.billing_details.email;
          }
        }
      } catch (error) {
        console.log('Could not retrieve charge details:', error);
      }
    }

    // Fallback
    if (!customerEmail || customerEmail === 'not_provided_yet' || customerEmail === 'not_provided') {
      customerEmail = 'not_provided';
    }

    const source = metadata.source || 'unknown';
    const baseAmount = parseFloat(metadata.base_amount || '0');
    const orderBumps = metadata.order_bumps?.split(',').filter(Boolean) || [];
    const orderBumpPrices = metadata.order_bump_prices?.split(',').filter(Boolean) || [];
    const orderBumpProducts = metadata.order_bump_products?.split(',').filter(Boolean) || [];

    console.log('📧 Customer email:', customerEmail);
    console.log('🌍 Source:', source);
    console.log('💰 Base amount:', baseAmount);
    console.log('🎁 Order bumps:', orderBumps);
    console.log('🏷️ Order bump prices:', orderBumpPrices);
    console.log('📦 Order bump products:', orderBumpProducts);

    // Salvar ou atualizar pedido no banco de dados
    const order = await prisma.order.upsert({
      where: {
        stripePaymentIntentId: paymentIntent.id
      },
      update: {
        status: 'paid',
        paidAt: new Date(),
        amount: paymentIntent.amount_received / 100, // Convert from cents
        customerEmail,
        currency: paymentIntent.currency,
        source,
        baseAmount,
        orderBumps,
        orderBumpPrices,
        orderBumpProducts
      },
      create: {
        stripePaymentIntentId: paymentIntent.id,
        customerEmail,
        amount: paymentIntent.amount_received / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: 'paid',
        paidAt: new Date(),
        source,
        baseAmount,
        orderBumps,
        orderBumpPrices,
        orderBumpProducts
      }
    });

    console.log('💾 Order saved to database:', order.id);

    // Determine language based on source
    const isSpanish = source.includes('_es') || source.includes('es_');

    // TODO: Send email with products (em stand-by por enquanto)
    await sendProductEmail({
      email: customerEmail,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      amount: paymentIntent.amount_received / 100,
      isSpanish,
      orderBumps,
      orderBumpPrices,
      orderBumpProducts
    });

    console.log('✅ Payment processing completed for:', customerEmail);

  } catch (error) {
    console.error('❌ Error processing payment:', error);
  }
}

interface EmailData {
  email: string;
  paymentIntentId: string;
  orderId: string;
  amount: number;
  isSpanish: boolean;
  orderBumps: string[];
  orderBumpPrices: string[];
  orderBumpProducts: string[];
}

async function sendProductEmail(data: EmailData) {
  // TODO: Email em stand-by por enquanto
  console.log('📧 Would send email to:', data.email);
  console.log('🌍 Language: ', data.isSpanish ? 'Spanish' : 'Portuguese');
  console.log('💰 Amount paid:', data.amount);
  console.log('🆔 Order ID:', data.orderId);
  console.log('🎁 Includes order bumps:', data.orderBumps.length > 0 ? data.orderBumps : 'None');

  // Por enquanto, apenas log do link de download que será gerado
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/download/${data.orderId}`;
  console.log('🔗 Download URL would be:', downloadUrl);

  // Marcar como entregue no banco (simular entrega)
  await prisma.order.update({
    where: { id: data.orderId },
    data: {
      productDelivered: true,
      deliveredAt: new Date()
    }
  });

  console.log('✅ Product marked as delivered');
}