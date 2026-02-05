import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendCAPIEvent, mapStepToCAPIEvent } from '@/lib/facebook-capi';

export const dynamic = 'force-dynamic';

function getClientIP(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

// POST - Criar ou atualizar sessão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId, step, incomeRange, estimatedLoss, clickedOffer,
      utmSource, utmMedium, utmCampaign,
      // Dados CAPI (Fase 2)
      eventId, fbp, fbc, fbclid, pageUrl,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;
    const clientIP = getClientIP(request);

    // Upsert - cria se não existe, atualiza se existe
    const session = await prisma.quizSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        currentStep: step || 'landing',
        incomeRange,
        estimatedLoss,
        clickedOffer: clickedOffer || false,
        clickedOfferAt: clickedOffer ? new Date() : null,
        userAgent,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        fbp,
        fbc,
        fbclid,
      },
      update: {
        currentStep: step,
        lastActiveAt: new Date(),
        ...(incomeRange && { incomeRange }),
        ...(estimatedLoss && { estimatedLoss }),
        ...(clickedOffer && { clickedOffer: true, clickedOfferAt: new Date() }),
        ...(step === 'results' || step === 'offer' ? { completedAt: new Date() } : {}),
        ...(fbp && { fbp }),
        ...(fbc && { fbc }),
        ...(fbclid && { fbclid }),
      },
    });

    // Envia evento para Facebook CAPI (apenas eventos padrão)
    const capiEvent = mapStepToCAPIEvent(step, clickedOffer, { estimatedLoss });
    if (capiEvent) {
      // Fire-and-forget: não bloqueia a resposta da API
      sendCAPIEvent({
        event_name: capiEvent.event_name,
        event_id: eventId,
        event_source_url: pageUrl,
        user_data: {
          fbp: fbp || session.fbp || undefined,
          fbc: fbc || session.fbc || undefined,
          fbclid: fbclid || session.fbclid || undefined,
          client_ip_address: clientIP,
          client_user_agent: userAgent,
          external_id: sessionId,
        },
        custom_data: capiEvent.custom_data,
      });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
