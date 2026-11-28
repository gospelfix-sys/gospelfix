import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SellerType } from "@/types/seller.types";
import { SellerIdentityPanel } from "@/components/mypage/SellerIdentityPanel";

type Role = "user" | "admin" | "seller";

interface RoleCardProps {
  role: Role;
  // 판매자 신청 때 고른 유형. 신청 이력이 없으면 null
  sellerType: SellerType | null;
}

interface RoleGuide {
  key: Exclude<Role, "admin">;
  label: string;
  summary: string;
  features: string[];
}

const ROLE_LABEL: Record<Role, string> = {
  user: "일반 사용자",
  seller: "판매자",
  admin: "관리자",
};

const SELLER_TYPE_LABEL: Record<SellerType, string> = {
  individual: "개인",
  business: "사업자",
};

const ROLE_GUIDES: RoleGuide[] = [
  {
    key: "user",
    label: "일반 사용자",
    summary: "작품을 둘러보고 구매하는 기본 권한이에요.",
    features: [
      "작품 둘러보기, 장바구니 담기, 구매",
      "구매 내역과 혜택(쿠폰) 확인",
      "프로필·계정 설정 관리",
      "작품 등록과 판매는 할 수 없어요",
    ],
  },
  {
    key: "seller",
    label: "판매자",
    summary: "직접 만든 작품을 등록하고 판매할 수 있는 권한이에요.",
    features: [
      "일반 사용자가 쓰는 모든 기능",
      "상단 '작품 업로드'로 내 작품 등록",
      "'내 상품'에서 등록한 작품 수정과 상태 확인",
      "등록한 작품은 관리자 검토·승인 후에 판매돼요",
    ],
  },
];

// 마이페이지 프로필의 "권한" 카드 — 현재 권한과 일반 사용자/판매자의 차이를 함께 보여준다.
// 판매자 전환은 신청 후 관리자가 승인해야 하며, 두 권한 칸 바로 아래에 신청 영역을 붙여
// 혜택을 읽은 자리에서 바로 신청할 수 있게 한다.
export function RoleCard({ role, sellerType }: RoleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>권한</CardDescription>
        <CardTitle className="text-base">{ROLE_LABEL[role]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          판매자가 되면 직접 만든 작품을 올려 판매할 수 있어요. 일반 사용자는 설정 없이 바로 구매할
          수 있고, 판매자는 신청 후 관리자가 승인하면 될 수 있어요.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLE_GUIDES.map((guide) => {
            const isCurrent = guide.key === role;
            return (
              <div
                key={guide.key}
                className={cn(
                  "rounded-xl border p-4",
                  isCurrent ? "border-gf-orange bg-gf-orange-bg" : "border-border",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{guide.label}</span>
                  {isCurrent && (
                    <span className="rounded-full bg-gf-orange px-2 py-0.5 text-xs font-medium text-white">
                      현재
                    </span>
                  )}
                  {guide.key === "seller" && sellerType && (
                    <span className="rounded-full border border-gf-orange px-2 py-0.5 text-xs font-medium text-gf-orange">
                      {SELLER_TYPE_LABEL[sellerType]}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{guide.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-sm">
                  {guide.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        {/* 신청 영역을 판매자 칸 안에 두면 옆 칸이 늘어나 빈 공간이 생기므로 두 칸 아래 전체 너비로 둔다 */}
        {(role === "user" || role === "seller") && <SellerIdentityPanel role={role} />}
      </CardContent>
    </Card>
  );
}
