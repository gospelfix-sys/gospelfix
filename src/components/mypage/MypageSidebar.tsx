"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Receipt, MessageSquare, Settings, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// "프로필"(/mypage)이 조회+편집(이름/아바타)을 모두 담당하므로 별도의 "프로필 설정"
// 항목은 두지 않는다 — 사용자 피드백: 두 메뉴가 중복돼 보여 하나로 합쳐달라는 요청.
// "보관함"(결제 대기중 + 구매한 상품 다운로드)은 "구매 / 혜택"에 통합됐다 — 별도 메뉴 삭제.
const NAV_ITEMS = [
  { href: "/mypage", label: "프로필", icon: User },
  { href: "/mypage/orders", label: "구매 / 혜택", icon: Receipt },
  { href: "/mypage/reviews", label: "작성한 댓글", icon: MessageSquare },
  { href: "/mypage/settings", label: "설정", icon: Settings },
];

// seller/admin에게만 노출 — 상품 CRUD는 판매자 셀프서비스 기능이라 일반 회원에게는
// 의미가 없다(project_product_crud_migration_to_mypage 메모리 참고).
const SELLER_NAV_ITEM = { href: "/mypage/products", label: "내 상품", icon: Package };

export function MypageSidebar({ canSell = false }: { canSell?: boolean }) {
  const pathname = usePathname();
  const navItems = canSell ? [...NAV_ITEMS, SELLER_NAV_ITEM] : NAV_ITEMS;

  return (
    <nav
      className={cn(
        "shrink-0",
        "flex gap-1 overflow-x-auto pb-2",
        "md:w-56 md:flex-col md:overflow-visible md:pb-0",
      )}
    >
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium no-underline transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
