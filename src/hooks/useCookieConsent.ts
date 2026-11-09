"use client";

import { useEffect, useState } from "react";

export type ConsentStatus = "accepted" | null;

export const COOKIE_CONSENT_KEY = "gf_cookie_consent";

// 이 경로에서는 동의 배너를 띄우지 않는다(정확 일치). 배너가 가리는 UI(플로팅 버튼 위치 보정 등)도
// 같은 기준을 써야 해서 상수를 여기서 공유한다.
// /reelsfactory는 취업용 개인 포트폴리오라 하단 배너가 화면을 가리지 않게 숨긴다.
export const COOKIE_BANNER_HIDDEN_PATHS = ["/layer", "/reelsfactory"];

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
