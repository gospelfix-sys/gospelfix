"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import PostHogPageView from "@/components/providers/PostHogPageView";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface PostHogProviderProps {
  children: React.ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  const consentStatus = useCookieConsent();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || consentStatus !== "accepted" || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      // /pay 송금 링크는 계좌번호·예금주를 # 뒤에 담는다. autocapture 등 모든 이벤트의
      // $current_url에 location.href가 실려 나가므로 fragment는 전송 전에 항상 제거한다
      before_send: (event) => {
        const url = event?.properties?.$current_url;
        if (event && typeof url === "string") {
          event.properties.$current_url = url.split("#")[0];
        }
        return event;
      },
    });
  }, [consentStatus]);

  return (
    <PHProvider client={posthog}>
      {consentStatus === "accepted" && <PostHogPageView />}
      {children}
    </PHProvider>
  );
}
