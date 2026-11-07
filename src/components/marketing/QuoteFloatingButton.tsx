"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  PANEL_ENTER_TRANSITION,
  PRESS_SCALE,
  PRESS_TRANSITION,
} from "@/components/ui/motionPresets";
import { QuoteChatModal } from "@/components/quote/chat/QuoteChatModal";
import { cn } from "@/lib/utils";
import { COOKIE_BANNER_HIDDEN_PATHS, useCookieConsent } from "@/hooks/useCookieConsent";

const DISMISS_KEY = "gf_quote_cta_dismissed_date";

// 인물은 카드가 자리 잡은 뒤 1초 쉬었다가 카드 안쪽에서 솟아오르듯 등장한다(시선을 한 번 더
// 끄는 연출이라 일반 UI보다 길게 잡는다).
const MODEL_RISE_TRANSITION = { duration: 0.9, ease: "easeOut", delay: 1 } satisfies Transition;

// 버튼 호버 시 인물만 살짝 들린다. "hover"/"rest" 라벨은 버튼의 whileHover·initial에서 전파된다.
const MODEL_LIFT_VARIANTS = {
  hover: { y: -4, transition: { duration: 0.3, ease: "easeOut" } },
  rest: { y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} satisfies Variants;

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function QuoteFloatingButton() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const consentStatus = useCookieConsent();
  const pathname = usePathname();
  // 배너가 숨겨진 경로에서는 배너 높이만큼 띄울 필요가 없다
  const cookieBannerShown =
    consentStatus === null && !COOKIE_BANNER_HIDDEN_PATHS.includes(pathname);
  // 움직임 감소 설정에서는 이동·스케일을 빼고 페이드만 남긴다.
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setVisible(window.localStorage.getItem(DISMISS_KEY) !== getTodayKey());
  }, []);

  function hideForToday() {
    window.localStorage.setItem(DISMISS_KEY, getTodayKey());
    setVisible(false);
  }

  function hideNow() {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={PANEL_ENTER_TRANSITION}
      className={cn(
        "fixed right-4 z-30 flex flex-col items-center gap-2 sm:bottom-[60px] sm:right-8",
        cookieBannerShown ? "bottom-36" : "bottom-4",
      )}
    >
      <motion.button
        type="button"
        onClick={() => setChatOpen(true)}
        initial="rest"
        whileHover={shouldReduceMotion ? undefined : "hover"}
        whileTap={shouldReduceMotion ? undefined : { scale: PRESS_SCALE }}
        transition={PRESS_TRANSITION}
        className="relative block h-[150px] w-[245px]"
      >
        {/* 입체 플랫폼 카드 */}
        <div className="absolute inset-x-0 bottom-0 h-[150px] overflow-visible rounded-[26px] bg-white shadow-[0_18px_30px_-14px_rgba(17,17,17,0.35)] ring-1 ring-black/[0.04]" />

        {/* 인물 이미지 - 카드 프레임을 뚫고 튀어나오는 레이어 (추후 교체 예정) */}
        {/* 1초 대기 후 아래에서 위로 페이드인 (opacity/translateY는 이 래퍼가 전담, 아래 hover 리프트와 transform 충돌 방지) */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={MODEL_RISE_TRANSITION}
          className="absolute left-1/2 -top-[30px] -ml-[100px] h-[149px] w-[200px]"
        >
          <motion.div
            variants={MODEL_LIFT_VARIANTS}
            className="relative h-full w-full drop-shadow-[0_14px_18px_rgba(0,0,0,0.4)]"
          >
            <Image
              src="/ad/cta-model-v1.png"
              alt=""
              fill
              sizes="200px"
              className="object-contain object-bottom"
            />
          </motion.div>
        </motion.div>

        {/* CTA 알약 - 카드 하단과 겹치며 입체감 형성 */}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-1.5 rounded-full bg-gf-black py-3 shadow-[0_10px_20px_-6px_rgba(17,17,17,0.55)]">
          <span className="text-sm font-extrabold text-white whitespace-nowrap sm:text-base">
            챗봇으로 상담신청
          </span>
          <span className="text-sm font-extrabold text-white sm:text-base" aria-hidden="true">
            →
          </span>
        </div>
      </motion.button>

      {/* 오늘 그만보기 / 닫기 */}
      <div className="flex w-[245px] items-center justify-between rounded-full bg-white px-4 py-2 shadow-[0_6px_16px_-4px_rgba(17,17,17,0.25)] ring-1 ring-black/[0.06]">
        <Button
          variant="link"
          onClick={hideForToday}
          className="h-auto p-0 text-xs font-normal text-gf-gray2 no-underline hover:text-gf-black"
        >
          오늘 그만보기
        </Button>
        <Button
          variant="link"
          onClick={hideNow}
          className="h-auto p-0 text-xs font-semibold text-gf-black no-underline hover:text-gf-orange"
        >
          닫기
        </Button>
      </div>

      <QuoteChatModal open={chatOpen} onOpenChange={setChatOpen} />
    </motion.div>
  );
}
