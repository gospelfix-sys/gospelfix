"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ROUTE_MODAL_BACKDROP_CLASS,
  ROUTE_MODAL_FADE_TRANSITION,
  registerRouteModalBackdropSource,
} from "@/components/ui/routeModalBackdrop";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

// 응답이 빠르면 인디케이터가 번쩍였다 사라지는 게 더 거슬리므로, 이 시간 안에 모달이 열리면
// backdrop fade만 보이고 인디케이터는 아예 나타나지 않는다.
const INDICATOR_DELAY_S = 0.4;
const INDICATOR_TRANSITION = { duration: 0.2, ease: "easeOut" as const, delay: INDICATOR_DELAY_S };
const SPIN_TRANSITION = { duration: 0.8, ease: "linear" as const, repeat: Infinity };
// 움직임 감소 설정에서는 회전 대신 느린 opacity 맥동으로 "진행 중"만 알린다.
const PULSE_TRANSITION = {
  duration: 1.2,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "reverse" as const,
};

/**
 * 인터셉트 라우트 모달(RouteModal)의 데이터를 기다리는 동안 보여주는 오버레이.
 * RouteModal과 같은 backdrop을 즉시 fade-in해 클릭에 바로 반응하고, 지연 후에만 작은
 * 로딩 인디케이터를 띄운다. backdrop opacity는 RouteModal이 이어받으므로 교체 순간 깜빡이거나
 * 두 겹으로 어두워지지 않는다.
 *
 * 배경 스크롤 락은 하지 않는다 — RouteModal이 마운트될 때 그 시점의 scrollY로 잠그고 닫을 때
 * 복원하므로, 여기서 먼저 잠그면 body가 fixed로 바뀐 뒤의 scrollY(0)를 RouteModal이 저장해
 * 닫을 때 스크롤 위치가 맨 위로 튄다.
 */
export function RouteModalLoading({ label = "불러오는 중" }: RouteModalLoadingProps) {
  const [mounted, setMounted] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();
  // 스타일로 바인딩하지 않고(인라인 style 금지) 애니메이션 진행값만 기록해 RouteModal에 넘긴다.
  const backdropOpacityRef = React.useRef(0);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return registerRouteModalBackdropSource(() => backdropOpacityRef.current);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        aria-hidden="true"
        className={ROUTE_MODAL_BACKDROP_CLASS}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ROUTE_MODAL_FADE_TRANSITION}
        onUpdate={(latest) => {
          if (typeof latest.opacity === "number") backdropOpacityRef.current = latest.opacity;
        }}
        onAnimationComplete={() => {
          backdropOpacityRef.current = 1;
        }}
      />
      <div
        role="status"
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      >
        <span className="sr-only">{label}</span>
        <motion.div
          className="flex size-12 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.09)]"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={INDICATOR_TRANSITION}
        >
          {shouldReduceMotion ? (
            <motion.span
              className="size-5 rounded-full border-2 border-black/15 border-t-black"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.4 }}
              transition={PULSE_TRANSITION}
            />
          ) : (
            <motion.span
              className="size-5 rounded-full border-2 border-black/15 border-t-black"
              animate={{ rotate: 360 }}
              transition={SPIN_TRANSITION}
            />
          )}
        </motion.div>
      </div>
    </>,
    document.body,
  );
}

/**
 * 아무것도 그리지 않고, 이 모듈(클라이언트 청크)을 목록 화면에서 미리 로드시키기 위한 컴포넌트.
 * 로딩 오버레이의 청크가 아직 없으면 RouteModalLoading 렌더가 청크 로드를 기다리며 suspend되고,
 * 그 사이 더 바깥 경계인 (public)/loading.tsx(사이드바 스켈레톤)가 {modal} 자리에 잠깐 노출된다.
 * @modal/default.tsx에서 렌더해 모달을 열기 전에 청크를 확보한다.
 */
export function RouteModalLoadingPreload() {
  return null;
}

interface RouteModalLoadingProps {
  /** 스크린리더에 읽힐 상태 문구 */
  label?: string;
}
