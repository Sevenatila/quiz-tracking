import crypto from 'crypto';

const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_CONVERSIONS_API_TOKEN;
const API_VERSION = 'v18.0';
const CAPI_ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

function hashSHA256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export interface CAPIUserData {
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  external_id?: string;
  em?: string;  // email (will be hashed)
  ph?: string;  // phone (will be hashed)
}

export interface CAPIEventData {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  user_data: CAPIUserData;
  custom_data?: Record<string, any>;
}

export async function sendCAPIEvent(eventData: CAPIEventData): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[CAPI] Missing PIXEL_ID or ACCESS_TOKEN, skipping');
    return;
  }

  const { event_name, event_id, event_source_url, user_data, custom_data } = eventData;

  const processedUserData: Record<string, any> = {};

  if (user_data.fbp) {
    processedUserData.fbp = user_data.fbp;
  }

  // Use fbc if available, otherwise construct from fbclid
  if (user_data.fbc) {
    processedUserData.fbc = user_data.fbc;
  } else if (user_data.fbclid) {
    processedUserData.fbc = `fb.1.${Date.now()}.${user_data.fbclid}`;
  }

  if (user_data.client_ip_address) {
    processedUserData.client_ip_address = user_data.client_ip_address;
  }

  if (user_data.client_user_agent) {
    processedUserData.client_user_agent = user_data.client_user_agent;
  }

  if (user_data.external_id) {
    processedUserData.external_id = [hashSHA256(user_data.external_id)];
  }

  if (user_data.em) {
    processedUserData.em = [hashSHA256(user_data.em)];
  }

  if (user_data.ph) {
    processedUserData.ph = [hashSHA256(user_data.ph.replace(/\D/g, ''))];
  }

  const payload = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        ...(event_id && { event_id }),
        ...(event_source_url && { event_source_url }),
        action_source: 'website' as const,
        user_data: processedUserData,
        ...(custom_data && Object.keys(custom_data).length > 0 && { custom_data }),
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(CAPI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[CAPI] Error response:', response.status, errorBody);
    } else {
      console.log(`[CAPI] Event "${event_name}" sent (event_id: ${event_id})`);
    }
  } catch (error) {
    console.error('[CAPI] Request failed:', error);
  }
}

/**
 * Maps a quiz step to a CAPI event.
 * Uses the same event names as the client-side pixel for de-duplication.
 * Only standard events are sent server-side.
 */
export function mapStepToCAPIEvent(
  step: string,
  clickedOffer?: boolean,
  additionalData?: { estimatedLoss?: number }
): { event_name: string; custom_data?: Record<string, any> } | null {
  // Landing pages -> ViewContent (matches client-side pixel for de-duplication)
  if (step === 'landing' || step === 'landing_quiz_oferta' || step === 'landing_es') {
    return {
      event_name: 'ViewContent',
      custom_data: {
        content_name: 'Quiz Landing',
        content_category: step,
      },
    };
  }

  // Results screens -> Lead
  if (step === 'results' || step === 'results_quiz_oferta' || step === 'results_es') {
    return {
      event_name: 'Lead',
      custom_data: {
        content_name: 'Quiz Completed',
        value: additionalData?.estimatedLoss || 0,
        currency: step.includes('es') ? 'USD' : 'BRL',
      },
    };
  }

  // Offer click -> InitiateCheckout
  if (
    clickedOffer &&
    (step === 'offer' || step === 'offer_pt' || step === 'offer_quiz_oferta' || step === 'offer_es')
  ) {
    return {
      event_name: 'InitiateCheckout',
      custom_data: {
        content_name: 'Planilha Financeira',
        value: additionalData?.estimatedLoss || 0,
        currency: step.includes('es') ? 'USD' : 'BRL',
      },
    };
  }

  return null;
}
