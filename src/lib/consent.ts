export interface ConsentState {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
}

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false,
};

const CONSENT_COOKIE_NAME = 'tonsberglivet_consent';

export function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
    if (cookie) {
      const value = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
      return { ...value, necessary: true, decided: true };
    }
  } catch (e) {
    console.error('Failed to parse consent cookie:', e);
  }
  return DEFAULT_CONSENT;
}

export function saveConsent(consent: Omit<ConsentState, 'necessary' | 'decided'>): ConsentState {
  const fullState: ConsentState = {
    necessary: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
    decided: true,
  };

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(fullState)
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  // Dispatch custom event for dynamic script loaders
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('consentChange', { detail: fullState }));
  }

  return fullState;
}
