'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  trackFBEvent,
  trackFBCustomEvent,
  generateEventId,
} from '@/lib/facebook-pixel';

function generateSessionId(): string {
  // Tenta recuperar do localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('quiz_session_id');
    if (stored) return stored;

    // Gera novo ID
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('quiz_session_id', newId);
    return newId;
  }
  return '';
}

function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getFbclid(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('fbclid') || undefined;
}

function mapStepToFBEvent(
  step: string,
  additionalData?: Record<string, any>
): { type: 'standard' | 'custom'; name: string; params?: Record<string, any> } | null {

  // Landing pages -> ViewContent
  if (step === 'landing' || step === 'landing_quiz_oferta' || step === 'landing_es') {
    return {
      type: 'standard',
      name: 'ViewContent',
      params: {
        content_name: 'Quiz Landing',
        content_category: step,
      },
    };
  }

  // Results screens -> Lead
  if (step === 'results' || step === 'results_quiz_oferta' || step === 'results_es') {
    return {
      type: 'standard',
      name: 'Lead',
      params: {
        content_name: 'Quiz Completed',
        value: additionalData?.estimatedLoss || 0,
        currency: step.includes('es') ? 'USD' : 'BRL',
      },
    };
  }

  // Offer CTA click -> InitiateCheckout
  if (
    additionalData?.clickedOffer &&
    (step === 'offer' || step === 'offer_pt' || step === 'offer_quiz_oferta' || step === 'offer_es')
  ) {
    return {
      type: 'standard',
      name: 'InitiateCheckout',
      params: {
        content_name: 'Planilha Financeira',
        value: additionalData?.estimatedLoss || 0,
        currency: step.includes('es') ? 'USD' : 'BRL',
      },
    };
  }

  // Offer screen view (sem click) -> custom ViewOffer
  if (step === 'offer' || step === 'offer_pt' || step === 'offer_quiz_oferta' || step === 'offer_es') {
    return {
      type: 'custom',
      name: 'ViewOffer',
      params: {
        content_name: 'Offer Screen',
        content_category: step,
        value: additionalData?.estimatedLoss || 0,
      },
    };
  }

  // Quiz questions -> custom QuizProgress
  if (step.match(/^(q\d+|es_q\d+)/)) {
    return {
      type: 'custom',
      name: 'QuizProgress',
      params: {
        step: step,
        question_number: step.replace(/\D/g, ''),
      },
    };
  }

  // Back redirect -> custom ExitIntent
  if (step === 'backRedirect') {
    return {
      type: 'custom',
      name: 'ExitIntent',
      params: {
        source: additionalData?.source || 'unknown',
        language: additionalData?.language || 'pt',
      },
    };
  }

  return null;
}

export function useTracking() {
  const sessionId = useRef<string>('');
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && typeof window !== 'undefined') {
      sessionId.current = generateSessionId();
      initialized.current = true;
    }
  }, []);

  const trackStep = useCallback(async (step: string, additionalData?: {
    incomeRange?: string;
    estimatedLoss?: number;
    clickedOffer?: boolean;
    source?: string;
    language?: string;
    paymentIntentId?: string;
    amount?: number;
    currency?: string;
    error?: string;
  }) => {
    if (!sessionId.current) return;

    // Dispara evento do Facebook Pixel
    const fbEvent = mapStepToFBEvent(step, additionalData);
    let eventId: string | undefined;

    if (fbEvent) {
      eventId = generateEventId(sessionId.current, fbEvent.name);
      if (fbEvent.type === 'standard') {
        trackFBEvent(fbEvent.name, fbEvent.params, eventId);
      } else {
        trackFBCustomEvent(fbEvent.name, fbEvent.params, eventId);
      }
    }

    // Captura dados do Facebook para CAPI
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    const fbclid = getFbclid();

    // Tracking interno no servidor + CAPI
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          step,
          ...additionalData,
          ...getUtmParams(),
          eventId,
          fbp,
          fbc,
          fbclid,
          pageUrl: window.location.href,
        }),
      });
    } catch (error) {
      // Silently fail - não queremos atrapalhar a UX
      console.error('Tracking error:', error);
    }
  }, []);

  return { trackStep, sessionId: sessionId.current };
}
