"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import { type ConsentStatus, COOKIE_CONSENT_KEY, parseConsentStatus } from "@/hooks/useCookieConsent";

function dispatchConsentEvent(status: ConsentStatus) {
  window.dispatchEvent(new CustomEvent("cookieConsent", { detail: { status } }));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = parseConsentStatus(localStorage.getItem(COOKIE_CONSENT_KEY));
    if (saved) {
      // 재방문: 이전 동의 상태를 이벤트로 재발행하여 분석 도구가 초기화될 수 있도록
      dispatchConsentEvent(saved);
    } else {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    dispatchConsentEvent("accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 bg-black px-4 py-3 sm:px-6 sm:py-4">
      <p className="text-sm text-white">
        GOSPELFIX은 더 나은 사용자 경험과 서비스 개선을 위해 쿠키(분석·광고)를 사용합니다.{" "}
        <LegalDialogTrigger
          type="privacy"
          className="underline underline-offset-2 text-white hover:text-white/80"
        >
          개인정보처리방침
        </LegalDialogTrigger>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          onClick={handleAccept}
          className="h-auto rounded border-transparent bg-gf-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gf-orange/90"
        >
          동의
        </Button>
      </div>
    </div>
  );
}
