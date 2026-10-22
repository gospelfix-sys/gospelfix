"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { CmsUser } from "@/types/auth.types";
import { cn } from "@/lib/utils";
import { FALLBACK_PRODUCT_CATEGORIES } from "@/types/product.types";

// cms.api에서 카테고리를 추가/삭제해도 이 네비게이션은 정적 fallback 값 그대로
// 유지한다(부모 체인이 전부 Client Component라 동적 prop 전달 비용이 큼, 2026-08-27 결정).
const LAYER_NAV_ITEMS = [
  { href: "/", linkHref: "/", label: "템플릿 전체" },
  ...FALLBACK_PRODUCT_CATEGORIES.filter((c) => c.value !== "all").map((c) => ({
    href: `/?category=${c.value}`,
    linkHref: `/?category=${c.value}`,
    label: c.label,
  })),
];

const OFFICIAL_NAV_ITEMS = [
  { href: "/about", linkHref: "/about", label: "소개" },
  { href: "/guide", linkHref: "/guide", label: "이용가이드" },
  // href는 활성 상태 매칭 전용(블로그 상세 모달 경로 /blog/[slug]와 매칭되도록 유지),
  // 실제 이동은 linkHref(에이전시 홈페이지 앵커)로 한다 — LAYER_NAV_ITEMS와 동일한
  // href/linkHref 분리 컨벤션.
  { href: "/blog", linkHref: "/layer#blog", label: "블로그" },
];

export function NavPopover({
  menuOpen,
  setMenuOpen,
  user,
  loading,
  handleSignOut,
  section,
}: {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  user: CmsUser | null;
  loading: boolean;
  handleSignOut: () => void;
  section: "layer" | "official";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuth();

  const navItems = section === "official" ? OFFICIAL_NAV_ITEMS : LAYER_NAV_ITEMS;

  function isActive(href: string) {
    const [hrefPath, hrefQuery] = href.split("?");
    if (!hrefQuery) {
      if (section === "official") return pathname.startsWith(hrefPath);
      return pathname === hrefPath && !searchParams.get("category");
    }
    const hrefParams = new URLSearchParams(hrefQuery);
    return pathname === hrefPath && hrefParams.get("category") === searchParams.get("category");
  }

  return (
    <div
      aria-hidden={!menuOpen}
      {...({ inert: !menuOpen ? "" : undefined } as React.HTMLAttributes<HTMLDivElement>)}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-in-out",
        menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">
        <div className="flex flex-col gap-0.5 border-t border-white/10 px-1.5 pt-1.5 pb-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.linkHref}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "px-4 py-1.5 rounded-full no-underline text-sm font-medium whitespace-nowrap transition-all text-center",
                  active ? "text-gf-orange" : "text-white/70 hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {!loading && (
            <>
              <div className="h-px bg-white/10 mx-1.5 my-0.5" />

              {user ? (
                <div className="flex flex-row gap-0.5">
                  <Link
                    href="/mypage"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 px-3 py-1.5 rounded-full no-underline text-sm font-medium whitespace-nowrap transition-all text-center text-white/80 hover:bg-white/10"
                  >
                    마이페이지
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    className="flex-1 px-3 py-1.5 rounded-full h-auto text-sm font-medium whitespace-nowrap transition-all text-center text-white/50 hover:bg-white/10 bg-transparent shadow-none"
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="flex flex-row gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex-1 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all text-center text-white hover:bg-white/10 outline-none"
                  >
                    로그인
                  </button>
                  <div className="w-px bg-white/10 my-1 shrink-0" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal("signup");
                    }}
                    className="flex-1 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all text-center text-white hover:bg-white/10 outline-none"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
