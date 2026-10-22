import { getMe } from "@/lib/api/me";
import { AccountSettingsCards } from "@/components/mypage/AccountSettingsCards";

export const dynamic = "force-dynamic";

export default async function MypageSettingsPage() {
  const me = await getMe();
  const user = me?.user ?? null;
  const profile = me?.profile ?? null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground">계정 관리와 상세 설정을 할 수 있어요.</p>
      </div>
      <AccountSettingsCards
        email={user?.email ?? ""}
        role={profile?.role ?? "user"}
        sellerRequestedAt={profile?.seller_requested_at ?? null}
      />
    </div>
  );
}
