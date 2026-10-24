"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cartItemCountSelector } from "@/store/selectors/cartSelector";
import { Button, buttonVariants } from "@/components/ui/button";
import { NavPopover } from "@/components/layout/NavPopover";
import { cn } from "@/lib/utils";

// LayerShell(자체 사이드바+상단바)이 전역 TopBar 대신 렌더링되는 경로.
const MODA_SHELL_PATHS = ["/upload", "/free-resources", "/creator", "/introduce"];
// "모다" 섹션 탭 활성 상태를 판단할 때 쓴다. 주의: 이 목록의 경로들은 위 hide 조건에서
// 이미 걸러져 TopBar 자체가 렌더링되지 않으므로(그리고 "/"·"/detail"도 마찬가지), 아래
// isLayer는 이 컴포넌트가 실제로 렌더링되는 모든 경로에서 항상 false다 — "모다" 탭은
// 구조상 활성 표시될 일이 없고, CompactNav의 장바구니 버튼도 항상 숨겨진다(의도된 동작:
// 모다 섹션 안에서는 LayerTopBar의 장바구니 버튼을 대신 쓴다). 상수/분기를 남겨둔 건
// 나중에 "모다" 섹션 중 LayerShell을 쓰지 않는 페이지가 다시 생길 경우를 위한 확장
// 지점이라서다.
const MODA_ACTIVE_PATHS = ["/upload"];
// 이 픽셀 구간(0~SCROLL_MORPH_RANGE) 동안 스크롤 값에 비례해 넓은 헤더가 압축 알약으로 좁아진다
const SCROLL_MORPH_RANGE = 300;
const WIDE_WIDTH = 1280;
const COMPACT_WIDTH = 460;

export default function TopBar() {
  const pathname = usePathname();

  // 모다(마켓플레이스) 홈/업로드는 자체 사이드바+상단바(LayerShell)를 쓰므로 전역 TopBar를
  // 렌더링하지 않는다. /detail(상품 상세)은 LayerShell을 쓰진 않지만 자체 네비게이션이
  // 없는 페이지라, 압축 알약 헤더가 콘텐츠 위에 떠 있는 게 불필요해 마찬가지로 숨긴다.
  if (
    pathname === "/" ||
    pathname.startsWith("/detail") ||
    MODA_SHELL_PATHS.some((p) => pathname.startsWith(p))
  )
    return null;

  // 히어로 배너가 있어 헤더가 콘텐츠 위에 겹쳐도 안전한 에이전시 홈("/layer")과 /about만
  // 스크롤에 따라 넓은 헤더 → 압축 알약으로 연속 전환된다. 그 외 페이지는 처음부터 압축 알약
  // 상태로 고정 표시한다.
  const isOverlayHero = pathname === "/layer" || pathname === "/about";

  if (!isOverlayHero) {
    return <CompactNav className="fixed left-1/2 top-[20px] z-30 w-fit -translate-x-1/2" />;
  }

  return <MorphingHeader />;
}

/** 히어로 라우트 전용: 스크롤 값(px)에 비례해 폭·콘텐츠가 연속적으로 전환되는 헤더. */
function MorphingHeader() {
  const { scrollY } = useScroll();

  // 좁은 화면에서는 헤더가 컨테이너의 max-w-[calc(100vw-2rem)]에 항상 눌리기 때문에,
  // 보간 시작값을 WIDE_WIDTH(1280) 그대로 쓰면 실제 렌더링 폭이 그 상한 아래로 내려오기
  // 전까지 스크롤을 아무리 해도 화면상 변화가 없다가 막판에 갑자기 좁아지는 것처럼 보인다.
  // 보간 양 끝을 뷰포트 기준 실제 렌더링 가능한 값으로 맞춰서 스크롤 전 구간에 걸쳐
  // 고르게 좁아지도록 한다.
  const [viewportWidth, setViewportWidth] = useState(WIDE_WIDTH);
  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);
  const effectiveWideWidth = Math.min(WIDE_WIDTH, viewportWidth - 32); // max-w-[calc(100vw-2rem)]와 동일한 값
  const compactWidth = Math.min(COMPACT_WIDTH, viewportWidth * 0.75);

  const width = useTransform(
    scrollY,
    [0, SCROLL_MORPH_RANGE],
    [effectiveWideWidth, compactWidth],
    { clamp: true },
  );
  const wideOpacity = useTransform(scrollY, [0, SCROLL_MORPH_RANGE * 0.6], [1, 0], {
    clamp: true,
  });
  const compactOpacity = useTransform(
    scrollY,
    [SCROLL_MORPH_RANGE * 0.4, SCROLL_MORPH_RANGE],
    [0, 1],
    { clamp: true },
  );

  // 크로스페이드 중 투명해진 레이어가 클릭을 가로채지 않도록, 전환 중간 지점을 기준으로
  // 활성 레이어만 pointer-events를 허용한다.
  const [isCompact, setIsCompact] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setIsCompact(v > SCROLL_MORPH_RANGE / 2));

  return (
    <motion.header
      style={{ width }}
      className="fixed left-1/2 top-[20px] z-30 grid max-w-[calc(100vw-2rem)] -translate-x-1/2"
    >
      <motion.div
        style={{ opacity: wideOpacity }}
        className={cn(
          "col-start-1 row-start-1 h-16 w-full overflow-hidden rounded-2xl bg-black shadow-[0_1px_20px_rgba(0,0,0,0.25)]",
          isCompact && "pointer-events-none",
        )}
      >
        <WideContent />
      </motion.div>

      <motion.div
        style={{ opacity: compactOpacity }}
        className={cn("col-start-1 row-start-1 w-full", !isCompact && "pointer-events-none")}
      >
        <CompactNav className="mx-auto" />
      </motion.div>
    </motion.header>
  );
}

/** 넓은 상태: 로고 + 카테고리 메뉴 + 로그인/회원가입. */
function WideContent() {
  const pathname = usePathname();
  const user = useRecoilValue(authUserAtom);
  const loading = useRecoilValue(authLoadingAtom);
  const { signOut, openAuthModal } = useAuth();

  const isLayer = pathname === "/" || MODA_ACTIVE_PATHS.some((p) => pathname.startsWith(p));
  const isOfficial = !isLayer;

  async function handleSignOut() {
    await signOut("/");
  }

  return (
    <div className="relative flex h-16 items-center justify-between px-6 lg:px-[60px]">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-0.5 text-lg font-black tracking-[-0.03em] no-underline text-white"
        >
          <span className="font-kr">GOSPEL</span>
          <span className="font-kr text-gf-orange">FIX</span>
        </Link>

        {/* 카테고리 메뉴 — 좁은 화면에서는 로고/로그인 버튼과 함께 있으면 넘치므로 데스크톱에서만 노출 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/layer"
            className={cn(
              "text-sm font-bold no-underline transition-colors",
              isOfficial ? "text-white" : "text-white/60 hover:text-white",
            )}
          >
            에이전시
          </Link>
          <Link
            href="/"
            className={cn(
              "text-sm font-bold no-underline transition-colors",
              isLayer ? "text-white" : "text-white/60 hover:text-white",
            )}
          >
            모다
          </Link>
        </nav>
      </div>

      {!loading && (
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/mypage"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "text-white hover:bg-white/10 hover:text-white",
                )}
              >
                마이페이지
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => openAuthModal("login")}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                로그인
              </Button>
              <Button variant="default" onClick={() => openAuthModal("signup")}>
                회원가입
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** 압축 상태: 에이전시/모다 섹션 탭 + (모다에서만) 장바구니 + 햄버거 메뉴. */
function CompactNav({ className }: { className?: string }) {
  const user = useRecoilValue(authUserAtom);
  const loading = useRecoilValue(authLoadingAtom);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const { openCart } = useCart();
  const cartItemCount = useRecoilValue(cartItemCountSelector);

  const isLayer = pathname === "/" || MODA_ACTIVE_PATHS.some((p) => pathname.startsWith(p));
  const isOfficial = !isLayer;
  const section = isOfficial ? "official" : "layer";

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
      <div className="flex items-center gap-2.5 px-3 py-2 sm:px-5">
        {/* 섹션 탭 */}
        <div className="flex items-center gap-1 shrink-0 bg-gf-orange/10 rounded-xl p-1">
          <Link
            href="/layer"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "text-sm font-bold px-4 h-9 flex items-center rounded-lg transition-all duration-200",
              isOfficial
                ? "bg-white text-gf-orange shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                : "text-white/60 hover:text-white",
            )}
          >
            에이전시
          </Link>
          <div className="w-px h-6 bg-white/20 shrink-0 mx-2" />
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "text-sm font-bold px-4 h-9 flex items-center rounded-lg transition-all duration-200",
              isLayer
                ? "bg-white text-gf-orange shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                : "text-white/60 hover:text-white",
            )}
          >
            모다
          </Link>
        </div>

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
