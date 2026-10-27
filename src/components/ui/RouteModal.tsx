"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ROUTE_MODAL_BACKDROP_CLASS,
  ROUTE_MODAL_BODY_CLASS,
  ROUTE_MODAL_FADE_TRANSITION,
  ROUTE_MODAL_PANEL_CLASS,
  ROUTE_MODAL_PANEL_HIDDEN,
  ROUTE_MODAL_PANEL_SHOWN,
  clearRouteModalOverlaySnapshot,
  readRouteModalOverlayState,
} from "@/components/ui/routeModalBackdrop";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const FADE_TRANSITION = ROUTE_MODAL_FADE_TRANSITION;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const RouteModalContext = React.createContext<(() => void) | null>(null);

/**
 * 모달 내부 콘텐츠에서 "닫기"가 필요할 때 쓴다. RouteModal 밖(전체 페이지 버전)에서는
 * null을 반환하므로, 호출부에서 null이면 일반 <Link> 이동으로 폴백해야 한다.
 * router.back()으로 직접 이동하면 exit 애니메이션 없이 DOM이 즉시 사라지므로
 * 반드시 이 함수(setOpen(false) → onExitComplete → router.back())를 거쳐야 한다.
 */
export function useRouteModalClose(): (() => void) | null {
  return React.useContext(RouteModalContext);
}

/**
 * Intercepting Route(가로챈 URL)가 곧 "열림" 상태다. 모든 닫기 트리거(X·오버레이·Esc)는
 * setOpen(false)만 호출하고, AnimatePresence의 onExitComplete(backdrop·popup 두 요소의
 * exit 애니메이션이 실제로 전부 끝난 뒤에만 호출됨)에서만 router.back()을 호출한다.
 * router.back()을 애니메이션 도중에 호출하면 @modal 슬롯이 즉시 언마운트되어
 * fadeOut이 재생될 기회 없이 DOM이 통째로 사라지므로, 이 순서를 반드시 지켜야 한다.
 * news/detail 등 도메인을 모르는 범용 wrapper — children만 렌더링한다.
 */
export default function RouteModal({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  // 로딩 오버레이(backdrop + 스켈레톤 패널)가 떠 있었다면 그 진행값에서 이어 움직여 깜빡임·
  // 이중 backdrop·패널 재등장을 막는다. useState 초기화라 첫 렌더 값으로 고정되고, 읽기 함수는
  // 순수해 StrictMode 이중 호출에도 안전하다.
  const [initialOverlay] = React.useState(readRouteModalOverlayState);

  // useEffect면 로딩 backdrop이 사라진 뒤 portal이 그려지기 전에 한 프레임이 페인트되어
  // backdrop이 깜빡인다. 페인트 전에 마운트를 확정해 빈 프레임을 없앤다.
  useIsomorphicLayoutEffect(() => {
    clearRouteModalOverlaySnapshot();
    setMounted(true);
  }, []);

  // mounted가 true가 되어 popup이 실제로 DOM에 렌더된 뒤에만 close 버튼으로 포커스를 옮길 수 있다.
  React.useEffect(() => {
    if (!mounted) return;
    closeButtonRef.current?.focus();
  }, [mounted]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "Tab" && popupRef.current) {
        const focusable = popupRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // overflow: hidden만으로 배경 스크롤을 막으면 브라우저에 따라(특히 html에 걸 때)
    // 스크롤 위치가 0으로 초기화되는 경우가 있다. 현재 스크롤 위치만큼 body를 위로
    // 올린 채 position: fixed로 고정해 시각적 위치를 그대로 유지하고, 닫힐 때
    // window.scrollTo()로 원래 위치를 복원한다.
    const scrollY = window.scrollY;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.documentElement.style.overflow = originalHtmlOverflow;

      // globals.css의 html { scroll-behavior: smooth }가 기본 scrollTo(behavior: "auto")에도
      // 적용되어, 닫을 때 스크롤이 상단(0)에서부터 애니메이션으로 내려오는 문제가 있었다.
      // behavior: "instant"로 명시해 CSS와 무관하게 항상 즉시 이동시킨다.
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence onExitComplete={() => router.back()}>
      {open
        ? [
            <motion.div
              key="backdrop"
              className={ROUTE_MODAL_BACKDROP_CLASS}
              initial={{ opacity: initialOverlay.backdropOpacity }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE_TRANSITION}
              onClick={() => setOpen(false)}
            />,
            <motion.div
              key="popup"
              ref={popupRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              className={ROUTE_MODAL_PANEL_CLASS}
              initial={{ opacity: initialOverlay.panelOpacity, y: initialOverlay.panelY }}
              animate={ROUTE_MODAL_PANEL_SHOWN}
              exit={ROUTE_MODAL_PANEL_HIDDEN}
              transition={FADE_TRANSITION}
            >
              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="뒤로가기"
                className="absolute bottom-6 right-4 z-10 size-[60px] rounded-xl bg-black text-white hover:bg-black hover:text-white hover:opacity-100 dark:hover:bg-black"
              >
                <ArrowLeft size={28} />
              </Button>
              <div className={ROUTE_MODAL_BODY_CLASS}>
                <RouteModalContext.Provider value={() => setOpen(false)}>
                  {children}
                </RouteModalContext.Provider>
              </div>
            </motion.div>,
          ]
        : null}
    </AnimatePresence>,
    document.body,
  );
}
