export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: (...args: any[]) => void;
  }
}

function isFbqAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

export function generateEventId(sessionId: string, eventName: string): string {
  return `${sessionId}_${eventName}_${Date.now()}`;
}

export function trackFBEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
): void {
  if (!isFbqAvailable()) return;

  const options = eventId ? { eventID: eventId } : {};

  if (params) {
    window.fbq('track', eventName, params, options);
  } else {
    window.fbq('track', eventName, {}, options);
  }
}

export function trackFBCustomEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
): void {
  if (!isFbqAvailable()) return;

  const options = eventId ? { eventID: eventId } : {};

  if (params) {
    window.fbq('trackCustom', eventName, params, options);
  } else {
    window.fbq('trackCustom', eventName, {}, options);
  }
}
