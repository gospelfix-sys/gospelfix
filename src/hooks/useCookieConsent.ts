"use client";

import { useEffect, useState } from "react";

export type ConsentStatus = "accepted" | null;

export const COOKIE_CONSENT_KEY = "gf_cookie_consent";

export function parseConsentStatus(value: string | null): ConsentStatus {
  if (value === "accepted") return value;
  return null;
}

export function useCookieConsent(): ConsentStatus {
  const [status, setStatus] = useState<ConsentStatus>(null);

  useEffect(() => {
    setStatus(parseConsentStatus(localStorage.getItem(COOKIE_CONSENT_KEY)));

    function handleConsent(e: Event) {
      const detail = (e as CustomEvent<{ status: ConsentStatus }>).detail;
      setStatus(detail.status);
    }

    window.addEventListener("cookieConsent", handleConsent);
    return () => window.removeEventListener("cookieConsent", handleConsent);
  }, []);

  return status;
}
