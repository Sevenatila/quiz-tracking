import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendCAPIEvent } from '@/lib/facebook-capi';

export const dynamic = 'force-dynamic';

interface VegaWebhookPayload {
  tansaction_token: string; // typo é da API da Vega
  external_code?: string;
  transaction_amount: number; // em centavos
  freight_amount?: number;
  automatic_discount?: number;
  products?: Array<{
    title: string;
    code: string;
    amount: number;
    quantity: number;
    original_amount: number;
  }>;
  customer: {
    full_name: string;
    email: string;
    cellphone?: string;
    identification_number?: string;
  };
  customer_address?: Record<string, string>;
  utms?: {
    src?: string;
    utm_medium?: string;
    utm_source?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  payment_status: string; // approved, pending, refused, in_process, chargeback, refunded
  payment_type: string;
  date_created: string;
  date_approved?: string;
  date_refunded?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VegaWebhookPayload = await request.json();

    console.log('[Vega Webhook] Received:', body.payment_status, body.tansaction_token);

    // Só processa pagamentos aprovados
    if (body.payment_status !== 'approved') {
      return NextResponse.json({ received: true });
    }

    const amountInReais = body.transaction_amount / 100;
    const transactionToken = body.tansaction_token;

    // Busca a sessão do quiz pelo sessionId passado via src na URL do checkout
    // Fallback: sessão mais recente com clickedOffer se src não estiver disponível
    const sessionIdFromSrc = body.utms?.src;
    let session = null;
    try {
      if (sessionIdFromSrc) {
        session = await prisma.quizSession.findUnique({
          where: { sessionId: sessionIdFromSrc },
        });
      }
      if (!session) {
        session = await prisma.quizSession.findFirst({
          where: { clickedOffer: true },
          orderBy: { clickedOfferAt: 'desc' },
        });
      }
    } catch (e) {
      console.error('[Vega Webhook] Error finding session:', e);
    }

    // Envia Purchase para Facebook CAPI
    await sendCAPIEvent({
      event_name: 'Purchase',
      event_id: `purchase_${transactionToken}`,
      user_data: {
        fbp: session?.fbp || undefined,
        fbc: session?.fbc || undefined,
        fbclid: session?.fbclid || undefined,
        external_id: session?.sessionId || undefined,
        em: body.customer?.email || undefined,
        ph: body.customer?.cellphone || undefined,
      },
      custom_data: {
        value: amountInReais,
        currency: 'BRL',
        content_name: body.products?.[0]?.title || 'Planilha Financeira',
        content_type: 'product',
        order_id: transactionToken,
      },
    });

    console.log(`[Vega Webhook] Purchase sent - ${transactionToken} R$${amountInReais}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Vega Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
