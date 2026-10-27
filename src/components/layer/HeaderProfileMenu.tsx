"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { LogOut } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PROFILE_MENU_ITEMS } from "@/components/layer/profileMenuItems";
import { authUserAtom } from "@/store/atoms/authAtom";
import { userProfileAtom } from "@/store/atoms/userAtom";
import { useAuth } from "@/hooks/useAuth";
import { POPOVER_ENTER_TRANSITION, POPOVER_EXIT_TRANSITION } from "@/components/ui/motionPresets";

// 아바타(우측 상단)에서 펼쳐지는 느낌이 나도록 origin-top-right 기준으로 살짝 커지며 내려온다
const menuVariants: Variants = {
  closed: { opacity: 0, scale: 0.96, y: -4, transition: POPOVER_EXIT_TRANSITION },
  open: { opacity: 1, scale: 1, y: 0, transition: POPOVER_ENTER_TRANSITION },
};

// 상단 네비 우측 아바타 트리거 — 클릭하면 아래쪽으로 설정/프로필/구매·혜택/(seller·admin 한정
// 내 상품)/로그아웃 드롭다운이 열린다. 비로그인이면 렌더링하지 않는다(로그인 버튼은 LayerNavBar 담당).
export function HeaderProfileMenu() {
  const user = useRecoilValue(authUserAtom);
  const profile = useRecoilValue(userProfileAtom);
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
    await signOut("/");
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="프로필 메뉴 열기"
        className="h-10 w-10 rounded-full p-0"
      >
        <Avatar size="default">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
          <AvatarFallback className="bg-gf-orange-bg text-gf-orange">{initials}</AvatarFallback>
        </Avatar>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="profile-menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute right-0 top-[calc(100%+8px)] z-30 w-52 origin-top-right rounded-2xl border border-gf-border bg-gf-white p-2 shadow-lg"
          >
            <p className="truncate px-3 py-2 text-xs font-semibold text-gf-gray2">{displayName}</p>
            {PROFILE_MENU_ITEMS.filter((item) => !item.sellerOnly || canSell).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 no-underline transition-colors hover:bg-gf-bg hover:text-gf-black"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <div className="my-1 border-t border-gf-border" />
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="h-auto w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gf-gray2 hover:bg-gf-bg hover:text-gf-black"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
