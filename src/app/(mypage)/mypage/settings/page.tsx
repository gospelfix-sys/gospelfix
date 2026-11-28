import { getMe } from "@/lib/api/me";
import { BackButton } from "@/components/mypage/BackButton";
import { AccountSettingsCards } from "@/components/mypage/AccountSettingsCards";
import { ThemeSettingsCard } from "@/components/mypage/ThemeSettingsCard";

export const dynamic = "force-dynamic";

export default async function MypageSettingsPage() {
  const me = await getMe();
  const user = me?.user ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-sm text-muted-foreground">계정 관리와 상세 설정을 할 수 있어요.</p>
        </div>
        <BackButton />
      </div>
      <ThemeSettingsCard />
      <AccountSettingsCards email={user?.email ?? ""} />
    </div>
  );
}
