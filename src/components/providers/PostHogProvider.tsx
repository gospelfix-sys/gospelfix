"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import PostHogPageView from "@/components/providers/PostHogPageView";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const consentStatus = useCookieConsent();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || consentStatus !== "accepted" || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, [consentStatus]);

  return (
    <PHProvider client={posthog}>
      {consentStatus === "accepted" && <PostHogPageView />}
      {children}
    </PHProvider>
  );
}
