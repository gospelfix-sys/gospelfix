import { Package, Receipt, Settings, User, type LucideIcon } from "lucide-react";

export interface ProfileMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // true면 seller/admin에게만 노출 (상품 CRUD는 판매자 셀프서비스 기능)
  sellerOnly?: boolean;
}

// SidebarProfileMenu(위로 열림)와 HeaderProfileMenu(아래로 열림)가 공유하는 메뉴 항목.
// 로그아웃은 동작이 달라 각 컴포넌트에서 별도로 렌더링한다.
export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { href: "/mypage/settings", label: "설정", icon: Settings },
  { href: "/mypage", label: "프로필", icon: User },
  { href: "/mypage/orders", label: "구매 / 혜택", icon: Receipt },
  { href: "/mypage/products", label: "내 상품", icon: Package, sellerOnly: true },
];
