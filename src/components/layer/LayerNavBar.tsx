"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { HeaderProfileMenu } from "@/components/layer/HeaderProfileMenu";
import { SectionToggle } from "@/components/layout/SectionToggle";
import { LAYER_NAV_ITEMS } from "@/components/layer/layerNav";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { userProfileAtom } from "@/store/atoms/userAtom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cartItemCountSelector } from "@/store/selectors/cartSelector";
import { cn } from "@/lib/utils";
import {
  PANEL_ENTER_TRANSITION,
  PANEL_EXIT_TRANSITION,
  POPOVER_ENTER_TRANSITION,
  POPOVER_EXIT_TRANSITION,
} from "@/components/ui/motionPresets";

// 검색 모드 전환: 일반 바는 제자리에서 사라지고, 검색창은 검색 버튼이 있던 오른쪽에서 짧게 밀려 들어온다.
const barVariants: Variants = {
  hidden: { opacity: 0, transition: POPOVER_EXIT_TRANSITION },
  shown: { opacity: 1, transition: POPOVER_ENTER_TRANSITION },
};
const searchVariants: Variants = {
  hidden: { opacity: 0, x: 12, transition: POPOVER_EXIT_TRANSITION },
  shown: { opacity: 1, x: 0, transition: POPOVER_ENTER_TRANSITION },
};

// 모바일 드로어: 오버레이는 페이드, 패널은 오른쪽 바깥에서 슬라이드
const drawerOverlayVariants: Variants = {
  hidden: { opacity: 0, transition: PANEL_EXIT_TRANSITION },
  shown: { opacity: 1, transition: PANEL_ENTER_TRANSITION },
};
const drawerPanelVariants: Variants = {
  hidden: { x: "100%", transition: PANEL_EXIT_TRANSITION },
  shown: { x: 0, transition: PANEL_ENTER_TRANSITION },
};

// 업로드 버튼 아래 티커: 같은 문구 두 벌을 -50%까지 흘려 이음새 없이 반복한다
const TICKER_TRANSITION = { duration: 9, ease: "linear", repeat: Infinity } as const;

interface LayerNavLinksProps {
  variant: "bar" | "drawer";
  onNavigate?: () => void;
}

// 네비 링크 목록. HOME 활성 판정에 useSearchParams가 필요해 Suspense 경계 안에서만 렌더링한다.
function LayerNavLinks({ variant, onNavigate }: LayerNavLinksProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navContext = {
    pathname,
    category: searchParams.get("category") ?? "all",
    price: searchParams.get("price") ?? "",
  };

  return (
    <>
      {LAYER_NAV_ITEMS.map((item) => {
        const active = item.isActive(navContext);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "no-underline transition-colors",
              variant === "bar"
                ? cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold",
                    // 검은 알약 헤더 위에서 쓰므로 다크 스코프 토큰이 아닌 white 계열을 쓴다
                    active ? "text-white" : "text-white/60 hover:text-white",
                  )
                : cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 text-base font-bold",
                    active
                      ? "border-gf-orange bg-gf-orange-bg text-gf-orange"
                      : "border-transparent text-gf-gray2 hover:bg-gf-bg hover:text-gf-black",
                  ),
            )}
          >
            {variant === "drawer" && (
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  active ? "bg-gf-orange text-white" : "bg-gf-bg text-gf-gray2",
                )}
              >
                <Icon width={22} height={22} />
              </span>
            )}
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

// 검색 인풋은 시각적 배치만 구현한다(실제 상품 검색 기능은 백엔드에 아직 없어 별도 후속 작업).
// 로그인 후 마이페이지/로그아웃 진입점은 HeaderProfileMenu가 담당한다.
// "작품 업로드"는 seller/admin만 실제로 작품을 등록할 수 있어(마이페이지 상품 CRUD 셀프서비스),
// 로그인한 일반 회원에게는 버튼을 숨기지 않고 비활성화 상태로 보여준다 —
// 존재를 알려주되 /mypage/settings의 "판매자 신청"으로 유도하기 위함.
export function LayerNavBar() {
  const user = useRecoilValue(authUserAtom);
  const loading = useRecoilValue(authLoadingAtom);
  const profile = useRecoilValue(userProfileAtom);
  const cartItemCount = useRecoilValue(cartItemCountSelector);
  const { openCart } = useCart();
  const { openAuthModal } = useAuth();
  const canUploadWork = profile?.role === "seller" || profile?.role === "admin";
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 무한 반복 티커는 움직임 감소 설정에서 정지 상태로 둔다(MotionConfig는 반복 모션을 멈추지 않음)
  const shouldReduceMotion = useReducedMotion();

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* 화면 위에 떠 있는 검은 알약 헤더(/layer 넓은 상태와 동일). fixed라 문서 흐름에서 빠지므로
          콘텐츠 상단 여백은 LayerShell이 한 번만 확보한다. */}
      <header className="fixed left-1/2 top-[20px] z-30 flex h-16 w-[1280px] max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center rounded-2xl bg-black px-4 shadow-[0_1px_20px_rgba(0,0,0,0.25)] sm:px-6 lg:px-8 xl:px-[60px]">
        {/* popLayout: 나가는 쪽을 레이아웃에서 빼 두 상태가 같은 자리에서 교차 페이드한다.
            새 쪽이 클릭과 같은 렌더에 마운트되어 autoFocus(모바일 키보드)도 그대로 동작한다. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {searchOpen ? (
            // 검색 모드: 바 전체를 입력창으로 전환
            <motion.div
              key="search"
              variants={searchVariants}
              initial="hidden"
              animate="shown"
              exit="hidden"
              className="flex w-full items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  autoFocus
                  placeholder="검색어를 입력해주세요"
                  className="h-10 rounded-full border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/50"
                />
              </div>
              <Button
                onClick={() => setSearchOpen(false)}
                aria-label="검색 닫기"
                variant="ghost"
                size="icon-lg"
                className="shrink-0 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X width={18} height={18} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              variants={barVariants}
              initial="hidden"
              animate="shown"
              exit="hidden"
              className="flex w-full items-center gap-4"
            >
              <Link
                href="/"
                aria-label="홈으로 이동"
                className="flex shrink-0 items-center gap-0.5 text-lg font-black tracking-[-0.03em] no-underline text-white"
              >
                <span className="font-kr">GOSPEL</span>
                <span className="font-kr text-gf-orange">FIX</span>
              </Link>

              {/* 섹션 토글 — 좁은 화면에서는 넘치므로 md 이상에서만 노출(모바일은 드로어 안에 둔다) */}
              <SectionToggle className="hidden md:grid" />

              {/* 데스크톱 네비 링크 */}
              <nav className="hidden items-center gap-1 lg:flex">
                <Suspense fallback={null}>
                  <LayerNavLinks variant="bar" />
                </Suspense>
              </nav>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Button
                  onClick={() => setSearchOpen(true)}
                  aria-label="검색 열기"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-white/10 text-white shadow-none hover:bg-white/20"
                >
                  <Search width={18} height={18} strokeWidth={2.5} />
                </Button>

                {!loading && user && (
                  <div className="relative hidden sm:inline-flex">
                    {canUploadWork ? (
                      <Link href="/upload" className={buttonVariants({ variant: "default" })}>
                        작품 업로드
                      </Link>
                    ) : (
                      <Button disabled title="판매자 전환 후 이용할 수 있어요 (마이페이지 > 설정)">
                        작품 업로드
                      </Button>
                    )}
                    {!canUploadWork && (
                      // 다크 스코프에서 bg-gf-black은 밝은 색이 되므로 비반전 색(흰 배경/검정 글씨)을 쓴다
                      <span className="absolute top-full left-1/2 mt-1.5 flex w-28 -translate-x-1/2 items-center overflow-hidden rounded-full bg-white py-0.5 text-[10px] font-bold text-black">
                        <motion.span
                          animate={shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }}
                          transition={TICKER_TRANSITION}
                          className="flex shrink-0 gap-8 pr-8 whitespace-nowrap"
                        >
                          <span>🔥 판매자만 이용가능합니다. 🔥</span>
                          <span>🔥 판매자만 이용가능합니다. 🔥</span>
                        </motion.span>
                      </span>
                    )}
                  </div>
                )}

                {!loading && !user && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => openAuthModal("login")}
                      className="text-white hover:bg-white/10 hover:text-white"
                    >
                      로그인
                    </Button>
                    {/* 모바일은 폭이 부족해 회원가입을 드로어로 넘긴다 */}
                    <Button
                      variant="default"
                      onClick={() => openAuthModal("signup")}
                      className="hidden sm:inline-flex"
                    >
                      회원가입
                    </Button>
                  </>
                )}

                {!loading && user && (
                  <>
                    <Button
                      onClick={openCart}
                      aria-label="장바구니 열기"
                      size="icon"
                      className="relative h-10 w-10 rounded-full bg-white/10 text-white shadow-none hover:bg-white/20"
                    >
                      <ShoppingCart width={18} height={18} strokeWidth={2.5} />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gf-orange px-1 text-[11px] font-bold text-white ring-2 ring-black">
                          {cartItemCount}
                        </span>
                      )}
                    </Button>
                    <HeaderProfileMenu />
                  </>
                )}

                {/* 모바일 햄버거 */}
                <Button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="메뉴 열기"
                  variant="ghost"
                  size="icon-lg"
                  className="shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white lg:hidden"
                >
                  <Menu width={18} height={18} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 모바일 드로어: 닫힐 때도 퇴장 모션이 끝난 뒤 언마운트되도록 AnimatePresence로 감싼다 */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer"
            initial="hidden"
            animate="shown"
            exit="hidden"
            className="fixed inset-0 z-[45] lg:hidden"
          >
            <motion.div
              variants={drawerOverlayVariants}
              onClick={closeDrawer}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              variants={drawerPanelVariants}
              className="absolute right-0 top-0 flex h-full w-[260px] flex-col bg-gf-white"
            >
              <Button
                onClick={closeDrawer}
                aria-label="메뉴 닫기"
                variant="ghost"
                size="icon-lg"
                // ghost variant 기본 hover를 무력화 — 닫기 버튼은 hover 피드백 없이 동일한 배경 유지
                className="absolute right-3 top-5 h-9 w-9 rounded-full bg-gf-bg text-gf-gray2 hover:bg-gf-bg hover:text-gf-gray2"
              >
                <X width={20} height={20} />
              </Button>
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-0.5 px-5 py-6 text-lg font-black tracking-[-0.03em] no-underline text-gf-black"
              >
                <span className="font-kr">GOSPEL</span>
                <span className="font-kr text-gf-orange">FIX</span>
              </Link>
              <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-6">
                {/* 모바일 바에는 섹션 토글이 없으므로 드로어 상단에 둔다 */}
                <SectionToggle className="mb-2 self-start md:hidden" onNavigate={closeDrawer} />
                <Suspense fallback={null}>
                  <LayerNavLinks variant="drawer" onNavigate={closeDrawer} />
                </Suspense>
                {!loading && !user && (
                  <Button
                    variant="default"
                    onClick={() => {
                      closeDrawer();
                      openAuthModal("signup");
                    }}
                    className="mt-3 sm:hidden"
                  >
                    회원가입
                  </Button>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
