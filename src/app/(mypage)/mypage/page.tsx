import { getMe } from "@/lib/api/me";
import { getPayoutAccount } from "@/lib/api/payoutAccount";
import { getMySellerType } from "@/lib/api/sellerIdentity";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/mypage/ProfileSettingsForm";
import { BackButton } from "@/components/mypage/BackButton";
import { RoleCard } from "@/components/mypage/RoleCard";
import { PayoutAccountCard } from "@/components/mypage/PayoutAccountCard";

export const dynamic = "force-dynamic";

export default async function MypageProfilePage() {
  const me = await getMe();

  const user = me?.user ?? null;
  const profile = me?.profile ?? null;
  // 정산 계좌는 판매자에게만 필요하다(일반 사용자는 조회하지 않는다)
  const isSeller = profile?.role === "seller";
  const payoutAccount = isSeller ? await getPayoutAccount() : null;
  // 판매자 칸의 유형 배지(개인/사업자)용. 신청 이력이 없는 관리자는 조회하지 않는다.
  const sellerType = profile?.role === "admin" ? null : await getMySellerType();

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">프로필</h1>
        <BackButton />
      </div>

      <div className="space-y-4">
        <RoleCard role={profile?.role ?? "user"} sellerType={sellerType} />
        {isSeller && <PayoutAccountCard account={payoutAccount} />}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>가입일</CardDescription>
            <CardTitle className="text-base">{joinedAt}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <ProfileSettingsForm
        email={user?.email ?? ""}
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
