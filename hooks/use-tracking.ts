'use client';

import { useEffect, useRef, useCallback } from 'react';

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

    // Tracking interno no servidor
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          step,
          ...additionalData,
          ...getUtmParams(),
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
