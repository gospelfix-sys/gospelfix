"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";
import { Menu, ShoppingCart, X } from "lucide-react";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cartItemCountSelector } from "@/store/selectors/cartSelector";
import { Button } from "@/components/ui/button";
import { NavPopover } from "@/components/layout/NavPopover";
import { MODA_SHELL_PATHS, isModaSection } from "@/components/layout/SectionToggle";
import { cn } from "@/lib/utils";

// 주의: 모다 섹션 경로(MODA_SHELL_PATHS, "/")는 아래 hide 조건에서 이미 걸러져 TopBar 자체가
// 렌더링되지 않으므로, CompactNav의 isLayer는 이 컴포넌트가 실제로 렌더링되는 모든 경로에서
// 항상 false다 — 장바구니 버튼도 항상 숨겨진다(의도된 동작: 모다 섹션 안에서는 LayerNavBar의
// 장바구니 버튼을 대신 쓴다). 분기를 남겨둔 건 모다 섹션 중 LayerShell을 쓰지 않는 페이지가
// 다시 생길 경우를 위한 확장 지점이라서다.
export default function TopBar() {
  const pathname = usePathname();

  // 모다(마켓플레이스) 홈/업로드는 자체 네비(LayerShell의 LayerNavBar, 업로드는 전용 상단바)를 쓰므로 전역 TopBar를
  // 렌더링하지 않는다. /detail(상품 상세)은 LayerShell을 쓰진 않지만 자체 네비게이션이
  // 없는 페이지라, 압축 알약 헤더가 콘텐츠 위에 떠 있는 게 불필요해 마찬가지로 숨긴다.
  if (
    pathname === "/" ||
    pathname.startsWith("/detail") ||
    MODA_SHELL_PATHS.some((p) => pathname.startsWith(p))
  )
    return null;

  // 에이전시 홈(/layer)은 헤더 자체를 숨긴다(넓은 헤더·압축 알약 모두).
  if (pathname === "/layer") return null;

  return <CompactNav className="fixed left-1/2 top-[20px] z-30 w-fit -translate-x-1/2" />;
}

interface CompactNavProps {
  className?: string;
}

/** 압축 상태: 에이전시/모다 섹션 탭 + (모다에서만) 장바구니 + 햄버거 메뉴. */
function CompactNav({ className }: CompactNavProps) {
  const user = useRecoilValue(authUserAtom);
  const loading = useRecoilValue(authLoadingAtom);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const { openCart } = useCart();
  const cartItemCount = useRecoilValue(cartItemCountSelector);

  const isLayer = isModaSection(pathname);
  const section = isLayer ? "layer" : "official";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut("/");
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        "flex w-fit flex-col overflow-hidden rounded-[28px] bg-black shadow-[0_1px_20px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {/* 알약 폭은 메뉴 팝오버가 정하므로, 로고를 왼쪽·버튼을 오른쪽 끝에 둔다 */}
      <div className="flex items-center justify-between gap-8 px-5 py-2 sm:px-7">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-0.5 text-lg font-black tracking-[-0.03em] no-underline text-white"
        >
          <span className="font-kr">GOSPEL</span>
          <span className="font-kr text-gf-orange">FIX</span>
        </Link>

        {/* 장바구니 버튼 — 모다 섹션에서만 노출 */}
        {isLayer && (
          <Button
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            aria-label="장바구니 열기"
            size="icon"
            className="relative w-11 h-11 rounded-full shrink-0 bg-white/10 text-white shadow-none transition-all duration-200 hover:bg-white/20"
          >
            <ShoppingCart width={18} height={18} strokeWidth={2.5} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gf-orange px-1 text-[11px] font-bold text-white ring-2 ring-black">
                {cartItemCount}
              </span>
            )}
          </Button>
        )}

        {/* 메뉴 버튼 */}
        <Button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          size="icon"
          className="w-11 h-11 rounded-full shrink-0 transition-all duration-200 hover:opacity-80 bg-gf-orange text-white shadow-none"
        >
          {menuOpen ? (
            <X width={18} height={18} strokeWidth={2.5} />
          ) : (
            <Menu width={18} height={18} strokeWidth={2.5} />
          )}
        </Button>
      </div>

      <Suspense fallback={null}>
        <NavPopover
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          user={user}
          loading={loading}
          handleSignOut={handleSignOut}
          section={section}
        />
      </Suspense>
    </div>
  );
}
