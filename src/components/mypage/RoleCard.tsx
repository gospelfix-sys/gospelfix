import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SellerRequestButton } from "@/components/mypage/SellerRequestButton";

type Role = "user" | "admin" | "seller";

interface RoleCardProps {
  role: Role;
  sellerRequestedAt: string | null;
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
// 판매자 전환은 신청 후 관리자가 승인해야 하며, 일반 사용자에게는 판매자 칸 아래에
// 신청 버튼을 붙여 혜택을 읽은 자리에서 바로 신청할 수 있게 한다.
export function RoleCard({ role, sellerRequestedAt }: RoleCardProps) {
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
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{guide.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-sm">
                  {guide.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {guide.key === "seller" && role === "user" && (
                  <div className="mt-4">
                    <SellerRequestButton sellerRequestedAt={sellerRequestedAt} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
