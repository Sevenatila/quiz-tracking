import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    try {
      if (sessionIdFromSrc) {
        await prisma.quizSession.findUnique({
          where: { sessionId: sessionIdFromSrc },
        });
      }
    } catch (e) {
      console.error('[Vega Webhook] Error finding session:', e);
    }

    console.log(`[Vega Webhook] Purchase received - ${transactionToken} R$${amountInReais}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Vega Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
