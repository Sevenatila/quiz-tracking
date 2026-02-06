import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - Criar ou atualizar sessão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId, step, incomeRange, estimatedLoss, clickedOffer,
      utmSource, utmMedium, utmCampaign,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

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
      },
      update: {
        currentStep: step,
        lastActiveAt: new Date(),
        ...(incomeRange && { incomeRange }),
        ...(estimatedLoss && { estimatedLoss }),
        ...(clickedOffer && { clickedOffer: true, clickedOfferAt: new Date() }),
        ...(step === 'results' || step === 'offer' ? { completedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
