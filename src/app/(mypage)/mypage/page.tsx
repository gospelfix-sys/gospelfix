import { getMe } from "@/lib/api/me";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/mypage/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default async function MypageProfilePage() {
  const me = await getMe();

  const user = me?.user ?? null;
  const profile = me?.profile ?? null;

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">프로필</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>권한</CardDescription>
            <CardTitle className="text-base">
              {profile?.role === "admin" ? "관리자" : "일반 사용자"}
            </CardTitle>
          </CardHeader>
        </Card>
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
