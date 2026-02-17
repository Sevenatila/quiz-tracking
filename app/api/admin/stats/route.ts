import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Senha simples para acesso admin (em produção, use autenticação real)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'quiz2024';

export async function GET(request: NextRequest) {
  try {
    // Verificar senha via query param ou header
    const password = request.nextUrl.searchParams.get('key') || request.headers.get('x-admin-key');
    
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Período de análise (últimos 30 dias por padrão)
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total de sessões
    const totalSessions = await prisma.quizSession.count({
      where: { startedAt: { gte: startDate } }
    });

    // Funil por etapa - lógica corrigida
    const funnelSteps = ['landing', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'results', 'offer'];
    const funnel: Record<string, number> = {};

    // Para cada etapa, contar quem chegou nela ou passou por ela
    for (const step of funnelSteps) {
      const stepIndex = funnelSteps.indexOf(step);

      // Contar usuários que chegaram nesta etapa ou foram além dela
      const futureSteps = funnelSteps.slice(stepIndex);

      funnel[step] = await prisma.quizSession.count({
        where: {
          startedAt: { gte: startDate },
          currentStep: { in: futureSteps }
        }
      });
    }

    // Cliques na oferta
    const offerClicks = await prisma.quizSession.count({
      where: {
        startedAt: { gte: startDate },
        clickedOffer: true
      }
    });

    // Distribuição de renda
    const incomeDistribution = await prisma.quizSession.groupBy({
      by: ['incomeRange'],
      where: {
        startedAt: { gte: startDate },
        incomeRange: { not: null }
      },
      _count: { incomeRange: true }
    });

    // Média de perda estimada
    const avgLoss = await prisma.quizSession.aggregate({
      where: {
        startedAt: { gte: startDate },
        estimatedLoss: { not: null }
      },
      _avg: { estimatedLoss: true }
    });

    // Sessões por dia (últimos 7 dias)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await prisma.quizSession.count({
        where: {
          startedAt: { gte: date, lt: nextDate }
        }
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Taxa de conversão
    const conversionRate = totalSessions > 0 ? (offerClicks / totalSessions * 100).toFixed(2) : '0';
    const completionRate = totalSessions > 0 ? (funnel['results'] / totalSessions * 100).toFixed(2) : '0';

    return NextResponse.json({
      period: { days, startDate: startDate.toISOString() },
      overview: {
        totalSessions,
        offerClicks,
        conversionRate: `${conversionRate}%`,
        completionRate: `${completionRate}%`,
        avgEstimatedLoss: avgLoss._avg.estimatedLoss || 0
      },
      funnel,
      incomeDistribution: incomeDistribution.map((i: { incomeRange: string | null; _count: { incomeRange: number } }) => ({
        range: i.incomeRange,
        count: i._count.incomeRange
      })),
      dailyStats: last7Days
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
