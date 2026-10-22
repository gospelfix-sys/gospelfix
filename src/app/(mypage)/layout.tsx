import { getMe } from "@/lib/api/me";
import { getReferralBanners } from "@/lib/api/referralBanners";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { MypageSidebar } from "@/components/mypage/MypageSidebar";
import { ReferralCodeCard } from "@/components/mypage/ReferralCodeCard";
import { BackButton } from "@/components/mypage/BackButton";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [me, banners] = await Promise.all([getMe(), getReferralBanners()]);

  const user = me?.user ?? null;
  const profile = me?.profile ?? null;
  const canSell = profile?.role === "seller" || profile?.role === "admin";

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader
        email={user?.email ?? ""}
        fullName={profile?.full_name ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <div className="mx-auto max-w-[1200px] px-6 pt-4">
        <BackButton />
      </div>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 md:flex-row md:gap-8">
        <MypageSidebar canSell={canSell} />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      {profile?.referral_code && banners.length > 0 && (
        <ReferralCodeCard referralCode={profile.referral_code} banners={banners} />
      )}
    </div>
  );
}
