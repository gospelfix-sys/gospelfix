"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { ReferralBanner } from "@/types/referralBanner.types";

const DISMISS_STORAGE_KEY = "gf_referral_banner_dismissed_until";
const DISMISS_DURATION_MS = 1 * 24 * 60 * 60 * 1000; // 1일
const ROTATE_INTERVAL_MS = 5000;
const MESSAGE_FADE_TRANSITION = { duration: 0.4, ease: "easeOut" as const };

interface ReferralCodeCardProps {
  referralCode: string;
  banners: ReferralBanner[];
}

export function ReferralCodeCard({ referralCode, banners }: ReferralCodeCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const cookieConsent = useCookieConsent();

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (document.readyState === "complete") {
      setPageLoaded(true);
      return;
    }
    const handleLoad = () => setPageLoaded(true);
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  // 닫기(X) 버튼을 누르면 1일간 다시 노출되지 않도록 localStorage에 만료 시각을 저장한다.
  useEffect(() => {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    const dismissedUntil = raw ? Number(raw) : 0;
    if (dismissedUntil > Date.now()) {
      setDismissed(true);
    } else if (raw) {
      localStorage.removeItem(DISMISS_STORAGE_KEY);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setDismissed(true);
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  async function handleShareLink() {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("초대 링크가 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  if (dismissed || banners.length === 0) return null;

  const currentBanner = banners[bannerIndex % banners.length];

  return (
    <motion.div
      className={cn(
        "fixed inset-x-4 z-50 transition-[bottom] sm:inset-x-auto sm:right-6",
        cookieConsent === "accepted" ? "bottom-4 sm:bottom-6" : "bottom-40 sm:bottom-24",
      )}
      initial={{ opacity: 0, x: "40%" }}
      animate={pageLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: "40%" }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    >
      <Alert className="w-auto border-white/10 bg-gf-black shadow-lg sm:w-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={MESSAGE_FADE_TRANSITION}
            className="flex flex-col gap-[1.125rem]"
          >
            <AlertTitle className="text-white">{currentBanner.message}</AlertTitle>
            {currentBanner.show_referral_actions && (
              <AlertDescription>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 items-center rounded-full border border-white/15 bg-white/5 px-4 font-mono text-sm font-bold text-white">
                    {referralCode}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyCode}
                    className="rounded-full border border-white/15 bg-transparent text-white hover:bg-white/10"
                  >
                    {copiedCode ? <Check className="size-4" /> : <Copy className="size-4" />}
                    코드 복사
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleShareLink}
                    className="rounded-full bg-gf-orange text-white hover:bg-gf-orange2"
                  >
                    <Share2 className="size-4" />
                    링크 공유
                  </Button>
                </div>
              </AlertDescription>
            )}
          </motion.div>
        </AnimatePresence>
        <AlertAction className="-top-2 -right-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="닫기"
            onClick={handleDismiss}
            className="rounded-full border border-white bg-gf-black text-white hover:bg-gf-black hover:text-white hover:opacity-80"
          >
            <X className="size-3.5" />
          </Button>
        </AlertAction>
      </Alert>
    </motion.div>
  );
}
