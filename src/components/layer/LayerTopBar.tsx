"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { userProfileAtom } from "@/store/atoms/userAtom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cartItemCountSelector } from "@/store/selectors/cartSelector";

interface LayerTopBarProps {
  onMenuClick: () => void;
}

// 검색 인풋은 이번 범위에서 시각적 배치만 구현한다(실제 상품 검색 기능은 백엔드에 아직
// 없어 별도 후속 작업으로 분리) — placeholder.
// 비로그인 사용자를 위한 로그인 버튼은 장바구니 버튼 바로 왼쪽에 있고, 로그인 후
// 마이페이지/로그아웃 진입점은 LayerSidebar 하단의 SidebarProfileMenu가 담당한다.
// "작품 업로드"는 seller/admin만 실제로 작품을 등록할 수 있어(마이페이지 상품 CRUD 셀프서비스),
// 로그인한 일반 회원에게는 버튼을 숨기지 않고 비활성화 상태로 보여준다 —
// 존재를 알려주되 /mypage/settings의 "판매자 신청"으로 유도하기 위함.
export function LayerTopBar({ onMenuClick }: LayerTopBarProps) {
  const user = useRecoilValue(authUserAtom);
  const loading = useRecoilValue(authLoadingAtom);
  const profile = useRecoilValue(userProfileAtom);
  const cartItemCount = useRecoilValue(cartItemCountSelector);
  const { openCart } = useCart();
  const { openAuthModal } = useAuth();
  const canUploadWork = profile?.role === "seller" || profile?.role === "admin";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const actionButtons = (
    <>
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
            <span className="absolute top-full left-1/2 mt-1.5 flex w-28 -translate-x-1/2 items-center overflow-hidden rounded-full bg-gf-black py-0.5 text-[10px] font-bold text-white">
              <span className="flex shrink-0 animate-[ticker_9s_linear_infinite] gap-8 pr-8 whitespace-nowrap">
                <span>🔥 판매자만 이용가능합니다. 🔥</span>
                <span>🔥 판매자만 이용가능합니다. 🔥</span>
              </span>
            </span>
          )}
        </div>
      )}

      {!loading && !user && (
        <Button variant="default" onClick={() => openAuthModal("login")}>
          로그인
        </Button>
      )}

      {!loading && user && (
        <Button
          onClick={openCart}
          aria-label="장바구니 열기"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-gf-bg text-gf-black shadow-none hover:bg-gf-orange-bg"
        >
          <ShoppingCart width={18} height={18} strokeWidth={2.5} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gf-orange px-1 text-[11px] font-bold text-white ring-2 ring-gf-white">
              {cartItemCount}
            </span>
          )}
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gf-border bg-gf-white px-4 lg:px-6">
      {/* 데스크톱: 검색창 항상 노출, 사이드바가 상시 표시되어 햄버거 없음 */}
      <div className="relative hidden w-full max-w-md lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gf-gray2" />
        <Input placeholder="검색어를 입력해주세요" className="h-10 rounded-full pl-9" />
      </div>
      <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">{actionButtons}</div>

      {/* 모바일: 검색은 아이콘 클릭 시에만 입력 필드로 전환, 햄버거는 맨 오른쪽 고정 */}
      {mobileSearchOpen ? (
        <div className="flex w-full items-center gap-2 lg:hidden">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gf-gray2" />
            <Input autoFocus placeholder="검색어를 입력해주세요" className="h-10 rounded-full pl-9" />
          </div>
          <Button
            onClick={() => setMobileSearchOpen(false)}
            aria-label="검색 닫기"
            variant="ghost"
            size="icon-lg"
            className="shrink-0 rounded-full text-gf-gray2"
          >
            <X width={18} height={18} />
          </Button>
        </div>
      ) : (
        <div className="flex w-full items-center gap-2 lg:hidden">
          <Link href="/" aria-label="홈으로 이동" className="shrink-0">
            <Image src="/logo_bk.webp" alt="GospelFix" width={40} height={40} />
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actionButtons}
            <Button
              onClick={() => setMobileSearchOpen(true)}
              aria-label="검색 열기"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-gf-bg text-gf-black shadow-none hover:bg-gf-orange-bg"
            >
              <Search width={18} height={18} strokeWidth={2.5} />
            </Button>
          </div>

          <Button
            onClick={onMenuClick}
            aria-label="메뉴 열기"
            variant="ghost"
            size="icon-lg"
            className="shrink-0 rounded-full text-gf-gray2"
          >
            <Menu width={18} height={18} />
          </Button>
        </div>
      )}
    </header>
  );
}
