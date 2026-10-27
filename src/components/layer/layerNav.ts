import {
  BookOpen,
  CloudDownload,
  Home,
  Info,
  Shapes,
  type LucideIcon,
} from "lucide-react";

// 활성 판정에 필요한 현재 위치 정보
export interface LayerNavContext {
  pathname: string;
  category: string;
  price: string;
}

export interface LayerNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (ctx: LayerNavContext) => boolean;
}

// LayerShell 상단 네비와 업로드 에디터용 LayerSidebar가 함께 읽는 단일 정의.
// 새 LayerShell 페이지를 추가하면 여기에 등록한다(안 하면 고아 라우트).
export const LAYER_NAV_ITEMS: LayerNavItem[] = [
  {
    href: "/",
    label: "HOME",
    icon: Home,
    isActive: ({ pathname, category, price }) =>
      pathname === "/" && category === "all" && price === "",
  },
  {
    href: "/free-resources",
    label: "FREE RESOURCES",
    icon: CloudDownload,
    isActive: ({ pathname }) => pathname === "/free-resources",
  },
  {
    href: "/creator",
    label: "CREATOR",
    icon: Shapes,
    isActive: ({ pathname }) => pathname === "/creator",
  },
  {
    href: "/blog",
    label: "블로그",
    icon: BookOpen,
    isActive: ({ pathname }) => pathname === "/blog" || pathname.startsWith("/blog/"),
  },
  {
    href: "/introduce",
    label: "소개",
    icon: Info,
    isActive: ({ pathname }) => pathname === "/introduce",
  },
];
