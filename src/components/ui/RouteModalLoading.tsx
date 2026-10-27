"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  ROUTE_MODAL_BACKDROP_CLASS,
  ROUTE_MODAL_BODY_CLASS,
  ROUTE_MODAL_FADE_TRANSITION,
  ROUTE_MODAL_PANEL_HIDDEN,
  ROUTE_MODAL_PANEL_SHOWN,
  type RouteModalTheme,
  registerRouteModalOverlaySource,
  routeModalPanelClass,
} from "@/components/ui/routeModalBackdrop";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleSkeleton } from "@/components/skeletons/ArticleSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * 인터셉트 라우트 모달(RouteModal)의 데이터를 기다리는 동안 보여주는 오버레이.
 * RouteModal과 같은 backdrop과 같은 패널을 클릭 즉시 띄우고, 패널 안에는 본문형 스켈레톤을 둔다.
 * 블로그·상품 상세가 같은 슬롯을 쓰므로 어느 쪽에도 어긋나지 않는 범용 본문 모양을 쓴다.
 * backdrop opacity와 패널 opacity/y는 RouteModal이 이어받으므로, 교체 순간에는 패널이 다시
 * 올라오지 않고 안의 내용만 실제 상세로 바뀐다.
 *
 * 배경 스크롤 락은 하지 않는다 — RouteModal이 마운트될 때 그 시점의 scrollY로 잠그고 닫을 때
 * 복원하므로, 여기서 먼저 잠그면 body가 fixed로 바뀐 뒤의 scrollY(0)를 RouteModal이 저장해
 * 닫을 때 스크롤 위치가 맨 위로 튄다.
 */
export function RouteModalLoading({
  label = "불러오는 중",
  theme = "light",
}: RouteModalLoadingProps) {
  const [mounted, setMounted] = React.useState(false);
  // 스타일로 바인딩하지 않고(인라인 style 금지) 애니메이션 진행값만 기록해 RouteModal에 넘긴다.
  const overlayRef = React.useRef({
    backdropOpacity: 0,
    panelOpacity: ROUTE_MODAL_PANEL_HIDDEN.opacity,
    panelY: ROUTE_MODAL_PANEL_HIDDEN.y,
  });

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return registerRouteModalOverlaySource(() => ({ ...overlayRef.current }));
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
          if (typeof latest.opacity === "number")
            overlayRef.current.backdropOpacity = latest.opacity;
        }}
        onAnimationComplete={() => {
          overlayRef.current.backdropOpacity = 1;
        }}
      />
      <motion.div
        className={routeModalPanelClass(theme)}
        initial={ROUTE_MODAL_PANEL_HIDDEN}
        animate={ROUTE_MODAL_PANEL_SHOWN}
        transition={ROUTE_MODAL_FADE_TRANSITION}
        onUpdate={(latest) => {
          if (typeof latest.opacity === "number") overlayRef.current.panelOpacity = latest.opacity;
          if (typeof latest.y === "number") overlayRef.current.panelY = latest.y;
        }}
        onAnimationComplete={() => {
          overlayRef.current.panelOpacity = ROUTE_MODAL_PANEL_SHOWN.opacity;
          overlayRef.current.panelY = ROUTE_MODAL_PANEL_SHOWN.y;
        }}
      >
        {/* RouteModal의 뒤로가기 버튼 자리. 로딩 중에는 누를 대상이 없으므로 자리표시만 둔다. */}
        <Skeleton className="absolute bottom-6 right-4 z-10 size-[60px] rounded-xl" />
        <SkeletonRegion label={label} className={ROUTE_MODAL_BODY_CLASS}>
          <ArticleSkeleton />
        </SkeletonRegion>
      </motion.div>
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
  /** 실제 모달과 같은 테마여야 교체 순간 색이 튀지 않는다 */
  theme?: RouteModalTheme;
}
