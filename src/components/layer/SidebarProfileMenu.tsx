"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { ChevronDown, ChevronUp, LogOut, Package, Receipt, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authUserAtom } from "@/store/atoms/authAtom";
import { userProfileAtom } from "@/store/atoms/userAtom";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProfileMenuProps {
  onNavigate?: () => void;
}

// 사이드바 하단 프로필 트리거 — 클릭하면 위쪽으로 설정/프로필/구매·혜택/(seller·admin 한정
// 내 상품)/로그아웃 팝오버가 열린다.
// 로그아웃 상태의 로그인 진입점은 LayerTopBar의 "로그인" 버튼이 담당하므로
// 여기서는 user가 없으면 아무것도 렌더링하지 않는다.
export function SidebarProfileMenu({ onNavigate }: SidebarProfileMenuProps) {
  const user = useRecoilValue(authUserAtom);
  const profile = useRecoilValue(userProfileAtom);
  // 상품 CRUD는 판매자 셀프서비스 기능이라 seller/admin에게만 "내 상품" 메뉴를 노출한다
  // (MypageSidebar의 SELLER_NAV_ITEM과 동일 기준 — project_product_crud_migration_to_mypage 메모리 참고).
  const canSell = profile?.role === "seller" || profile?.role === "admin";
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const displayName = profile?.full_name ?? user.email ?? "사용자";
  const initials = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    onNavigate?.();
    await signOut("/");
  }

  return (
    <div ref={containerRef} className="relative mt-2 border-t border-gf-border px-3 pb-3 pt-3">
      {open && (
        <div className="absolute inset-x-3 bottom-full mb-2 rounded-2xl border border-gf-border bg-gf-white p-2 shadow-lg">
          <Link
            href="/mypage/settings"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 no-underline transition-colors hover:bg-gf-bg hover:text-gf-black"
          >
            <Settings className="h-4 w-4" />
            설정
          </Link>
          <Link
            href="/mypage"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 no-underline transition-colors hover:bg-gf-bg hover:text-gf-black"
          >
            <User className="h-4 w-4" />
            프로필
          </Link>
          <Link
            href="/mypage/orders"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 no-underline transition-colors hover:bg-gf-bg hover:text-gf-black"
          >
            <Receipt className="h-4 w-4" />
            구매 / 혜택
          </Link>
          {canSell && (
            <Link
              href="/mypage/products"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 no-underline transition-colors hover:bg-gf-bg hover:text-gf-black"
            >
              <Package className="h-4 w-4" />내 상품
            </Link>
          )}
          <div className="my-1 border-t border-gf-border" />
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="h-auto w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 hover:bg-gf-bg hover:text-gf-black"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="h-auto w-full justify-start gap-2.5 rounded-xl px-2 py-2 hover:bg-gf-bg"
      >
        <Avatar size="default">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
          <AvatarFallback className="bg-gf-orange-bg text-gf-orange">{initials}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-gf-black">
          {displayName}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gf-gray2" />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0 text-gf-gray2" />
        )}
      </Button>
    </div>
  );
}
