"use client";

import { useEffect, useId, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { ReducedMotionConfig } from "@/components/ui/ReducedMotionConfig";
import {
  PRESS_SCALE,
  PRESS_TRANSITION,
  SEGMENT_INDICATOR_TRANSITION,
} from "@/components/ui/motionPresets";

// 모다(마켓플레이스) 섹션에 속하는 경로. LayerShell(LayerNavBar) 페이지와 업로드 에디터가 해당한다.
// TopBar가 이 경로들에서 자신을 숨기는 기준이기도 해서 한 곳에서 같이 쓴다.
export const MODA_SHELL_PATHS = ["/upload", "/resources", "/introduce", "/blog"];

// "/"는 startsWith로 비교하면 전부 매칭되므로 정확 일치로만 판정한다.
export function isModaSection(pathname: string): boolean {
  return pathname === "/" || MODA_SHELL_PATHS.some((p) => pathname.startsWith(p));
}

interface SectionItem {
  key: "agency" | "moda";
  href: string;
  label: string;
}

const SECTION_ITEMS: SectionItem[] = [
  { key: "agency", href: "/layer", label: "에이전시" },
  { key: "moda", href: "/", label: "모다" },
];

interface SectionToggleProps {
  className?: string;
  // 드로어 등에서 링크 클릭 시 닫기 처리를 위해 받는다
  onNavigate?: () => void;
}

const MotionLink = motion.create(Link);

// 탭 피드백은 라벨에만 준다 — 링크 전체를 줄이면 인디케이터의 layout 측정이 함께 틀어진다.
const labelVariants: Variants = {
  tap: { scale: PRESS_SCALE, transition: PRESS_TRANSITION },
};

// 새 탭 열기(⌘/Ctrl/Shift/Alt, 가운데 버튼)는 현재 화면이 이동하지 않으므로 인디케이터도 옮기지 않는다
function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

// 에이전시(/layer) ↔ 모다(/) 섹션 전환 세그먼트 토글. 검은 배경 위에서 쓰는 것을 전제로 한다.
// 에이전시 경로는 TopBar, 모다 경로는 LayerNavBar가 렌더하므로 한 인스턴스 안에서 pathname만으로는
// 활성 항목이 바뀌지 않는다(이동하면 다른 컴포넌트의 토글이 새로 마운트된다). 그래서 누른 즉시
// 선택값을 먼저 반영해, 페이지가 바뀌기 전 그 짧은 사이에 활성 배경이 미끄러지게 한다.
export function SectionToggle({ className, onNavigate }: SectionToggleProps) {
  const pathname = usePathname();
  const routeKey: SectionItem["key"] = isModaSection(pathname) ? "moda" : "agency";
  const [pendingKey, setPendingKey] = useState<SectionItem["key"] | null>(null);
  const activeKey = pendingKey ?? routeKey;
  // 바 + 드로어, WideContent + CompactNav처럼 동시에 여러 개가 마운트되므로 layoutId를 인스턴스별로 분리한다
  const indicatorLayoutId = `section-toggle-indicator-${useId()}`;

  useEffect(() => {
    setPendingKey(null);
  }, [pathname]);

  return (
    // TopBar는 LayerShell(움직임 감소 설정) 밖에 있으므로 토글이 스스로 감싼다
    <ReducedMotionConfig>
      <nav
        aria-label="섹션 전환"
        className={cn(
          "grid shrink-0 grid-cols-2 items-center rounded-full border border-white/15 bg-white/10 p-1",
          className,
        )}
      >
        {SECTION_ITEMS.map((item) => {
          const active = item.key === activeKey;
          return (
            <MotionLink
              key={item.key}
              href={item.href}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                if (isPlainLeftClick(event)) setPendingKey(item.key);
                onNavigate?.();
              }}
              aria-current={item.key === routeKey ? "page" : undefined}
              whileTap="tap"
              className={cn(
                "relative flex h-9 min-w-[68px] items-center justify-center rounded-full px-4 text-sm font-bold no-underline transition-colors duration-200 sm:min-w-[76px] sm:px-5",
                active ? "text-gf-orange" : "text-white/60 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  aria-hidden
                  data-slot="section-toggle-indicator"
                  layoutId={indicatorLayoutId}
                  // 헤더가 fixed이고 스크롤·폭 모핑 중에도 재렌더되므로, 매 렌더 layout 측정을 하면
                  // 이전 위치에서 다시 미끄러져 오는 오작동이 생긴다. 활성 항목이 바뀔 때만 측정한다.
                  layoutDependency={activeKey}
                  transition={SEGMENT_INDICATOR_TRANSITION}
                  // 이동 중 scale 보정이 들어가도 모서리·그림자가 찌그러지지 않도록
                  // motion이 보정할 수 있게 style로 넘긴다(알약 형태, rounded-full과 같은 효과).
                  style={{ borderRadius: 9999, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                  className="absolute inset-0 bg-white"
                />
              )}
              <motion.span variants={labelVariants} className="relative block">
                {item.label}
              </motion.span>
            </MotionLink>
          );
        })}
      </nav>
    </ReducedMotionConfig>
  );
}
