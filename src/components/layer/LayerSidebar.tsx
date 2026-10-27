"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProfileMenu } from "@/components/layer/SidebarProfileMenu";
import { LAYER_NAV_ITEMS } from "@/components/layer/layerNav";
import { cn } from "@/lib/utils";

// 업로드 에디터용 사이드바는 기존 구성(주요 3개 + 하단 소개)을 유지한다. 블로그는
// 상단 네비 전용이라 제외 — 항목 정의 자체는 layerNav.ts 단일 상수를 읽는다.
const SIDEBAR_MAIN_HREFS = ["/", "/free-resources", "/creator"];
const SIDEBAR_BOTTOM_HREFS = ["/introduce"];
const SIDEBAR_MAIN_ITEMS = LAYER_NAV_ITEMS.filter((item) =>
  SIDEBAR_MAIN_HREFS.includes(item.href),
);
const SIDEBAR_BOTTOM_ITEMS = LAYER_NAV_ITEMS.filter((item) =>
  SIDEBAR_BOTTOM_HREFS.includes(item.href),
);

interface LayerSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function LayerSidebar({ open, onClose }: LayerSidebarProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "all";
  const currentPrice = searchParams.get("price") ?? "";

  return (
    <>
      {/* 데스크톱: 항상 고정 노출 */}
      <div className="hidden lg:flex fixed left-0 top-0 z-20 h-dvh w-[220px] flex-col border-r border-gf-border bg-gf-white">
        <SidebarContent
          currentCategory={currentCategory}
          currentPrice={currentPrice}
          onNavigate={onClose}
        />
      </div>

      {/* 모바일: 슬라이드인 드로어 */}
      <div
        aria-hidden={!open}
        className={cn("fixed inset-0 z-[45] lg:hidden", !open && "pointer-events-none")}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute right-0 top-0 flex h-full w-[260px] flex-col bg-gf-white transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <Button
            onClick={onClose}
            aria-label="메뉴 닫기"
            variant="ghost"
            size="icon-lg"
            // ghost variant 기본 hover(hover:bg-muted)를 의도적으로 무력화 — 닫기 버튼은 hover 피드백 없이 항상 동일한 회색 배경 유지
            className="absolute right-3 top-5 h-9 w-9 rounded-full bg-gf-bg text-gf-gray2 hover:bg-gf-bg hover:text-gf-gray2"
          >
            <X width={20} height={20} />
          </Button>
          <SidebarContent
            currentCategory={currentCategory}
            currentPrice={currentPrice}
            onNavigate={onClose}
          />
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  currentCategory,
  currentPrice,
  onNavigate,
}: {
  currentCategory: string;
  currentPrice: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const navContext = { pathname, category: currentCategory, price: currentPrice };

  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-0.5 px-5 py-6 text-lg font-black tracking-[-0.03em] no-underline text-gf-black"
      >
        <span className="font-kr">GOSPEL</span>
        <span className="font-kr text-gf-orange">FIX</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1.5 px-3">
        {SIDEBAR_MAIN_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={item.isActive(navContext)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="px-3 pb-2">
        {SIDEBAR_BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={item.isActive(navContext)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <SidebarProfileMenu onNavigate={onNavigate} />
    </>
  );
}

interface SidebarLinkProps {
  href?: string;
  icon?: LucideIcon;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
  // href 없이 이 사유만 넘기면 비활성(준비 중) 항목으로 렌더링된다.
  disabledReason?: string;
}

function SidebarLink({ href, icon: Icon, label, active, onNavigate, disabledReason }: SidebarLinkProps) {
  const content = (
    <>
      {Icon && (
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            active ? "bg-gf-orange text-white" : "bg-gf-bg text-gf-gray2",
          )}
        >
          <Icon width={22} height={22} />
        </span>
      )}
      {label}
    </>
  );

  if (!href) {
    return (
      <div
        title={disabledReason}
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-base font-bold text-gf-gray2 opacity-40"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-3 text-base font-bold no-underline transition-colors",
        active
          ? "border-gf-orange bg-gf-orange-bg text-gf-orange"
          : "border-transparent text-gf-gray2 hover:bg-gf-bg hover:text-gf-black",
      )}
    >
      {content}
    </Link>
  );
}
