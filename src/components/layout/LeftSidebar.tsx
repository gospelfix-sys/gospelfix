"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutGrid,
  Globe,
  LayoutDashboard,
  Palette,
  ChevronDown,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FALLBACK_PRODUCT_CATEGORIES } from "@/types/product.types";

// FALLBACK_PRODUCT_CATEGORIES의 value("all" 제외)와 1:1 대응하는 아이콘. 카테고리가
// 추가/삭제되면 여기도 함께 갱신할 것. 이 컴포넌트는 어디서도 렌더링되지 않는 죽은
// 코드로 확인됨(2026-08-27) — cms.api 동적 카테고리 API 연동 대상에서 제외했다.
const CATEGORY_ICONS: Record<string, typeof LayoutGrid> = {
  website: Globe,
  ux_ui: LayoutDashboard,
  branding: Palette,
};

const NAV_ITEMS = [
  { href: "/", label: "템플릿 전체", icon: LayoutGrid },
  ...FALLBACK_PRODUCT_CATEGORIES.filter((c) => c.value !== "all").map((c) => ({
    href: `/?category=${c.value}`,
    label: c.label,
    icon: CATEGORY_ICONS[c.value] ?? LayoutGrid,
  })),
];

interface LeftSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ open, onClose }: LeftSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useRecoilValue(authUserAtom);
  const loading = useRecoilValue(authLoadingAtom);
  const { signOut, openAuthModal } = useAuth();

  async function handleSignOut() {
    onClose();
    await signOut("/");
  }

  function isActive(href: string) {
    const [hrefPath, hrefQuery] = href.split("?");
    if (!hrefQuery) return pathname === hrefPath && !searchParams.get("category");
    const hrefParams = new URLSearchParams(hrefQuery);
    return pathname === hrefPath && hrefParams.get("category") === searchParams.get("category");
  }

  return (
    <>
      {/* 오버레이 배경 */}
      <div
        className={cn(
          "fixed inset-0 z-[39] bg-black/45 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 사이드바 패널 */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-full w-[300px] flex flex-col bg-white/[0.85] backdrop-blur-[5px] transition-transform duration-300 ease-out",
          open
            ? "translate-x-0 shadow-[-4px_0_40px_rgba(0,0,0,0.12)]"
            : "translate-x-full shadow-none",
        )}
      >
        {/* 상단: 닫기 버튼 + 로고 */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gf-border">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-1 text-[17px] font-black tracking-[-0.03em] no-underline text-gf-black"
          >
            <span className="font-kr">GOSPEL</span>
            <span className="font-kr text-gf-orange -ml-[1px]">FIX</span>
            <span className="text-sm font-black ml-1 text-gf-gray2">MALL</span>
          </Link>
          <Button
            onClick={onClose}
            aria-label="메뉴 닫기"
            size="icon"
            className="ml-auto w-10 h-10 rounded-full flex-shrink-0 transition-all duration-200 hover:opacity-80 bg-gf-orange text-white"
          >
            <X width={18} height={18} strokeWidth={2.5} />
          </Button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 no-underline transition-colors duration-150 border-b border-gf-border",
                  active
                    ? "bg-gf-orange-bg text-gf-orange"
                    : "bg-transparent text-gf-black hover:bg-gf-bg",
                )}
              >
                <Icon
                  width={22}
                  height={22}
                  strokeWidth={active ? 2.2 : 1.7}
                  className={cn("flex-shrink-0", active ? "text-gf-orange" : "text-gf-gray1")}
                />
                <span
                  className={cn(
                    "text-[15px]",
                    active ? "font-bold text-gf-orange" : "font-medium text-gf-black",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 하단: 유저 정보 / 로그인 */}
        <div className="px-5 py-5 border-t border-gf-border">
          {!loading &&
            (user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/mypage"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline transition-all duration-150 hover:opacity-80 bg-gf-bg text-gf-black"
                >
                  <Gauge width={18} height={18} className="text-gf-orange" />
                  <span className="text-sm font-semibold">마이페이지</span>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-150 hover:opacity-80 bg-gf-bg text-gf-gray1 h-auto justify-start"
                >
                  <LogOut width={18} height={18} className="text-gf-gray2" />
                  <span className="text-sm font-semibold">로그아웃</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 hover:opacity-80 bg-gf-bg border border-gf-border">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal("login");
                    }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gf-black outline-none"
                  >
                    <LogIn width={16} height={16} className="text-gf-gray1" />
                    로그인
                  </button>
                  <span className="text-gf-gray3">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal("signup");
                    }}
                    className="text-sm font-bold text-gf-orange outline-none"
                  >
                    <UserPlus width={16} height={16} className="inline mr-1 text-gf-orange" />
                    회원가입
                  </button>
                </div>
                <ChevronDown width={16} height={16} className="text-gf-gray2" />
              </div>
            ))}
        </div>
      </aside>
    </>
  );
}
