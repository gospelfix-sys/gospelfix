import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

// 소개·서비스·추천 대상 섹션이 함께 쓰는 카드. 아이콘이 있으면 아이콘 사각형 아래에 텍스트를 두고,
// 없으면 제목과 설명만 좁은 간격으로 붙인다.
export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  if (!Icon) {
    return (
      <div className={cn("gf-feature-card flex flex-col gap-2 rounded-2xl border p-6", className)}>
        <h3 className="text-base font-bold text-gf-black">{title}</h3>
        <p className="text-sm leading-relaxed text-gf-gray2">{description}</p>
      </div>
    );
  }

  return (
    <div className={cn("gf-feature-card flex flex-col gap-4 rounded-2xl border p-6", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gf-orange-bg">
        <Icon className="h-5 w-5 text-gf-orange" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-bold text-gf-black">{title}</h3>
        <p className="text-sm leading-relaxed text-gf-gray2">{description}</p>
      </div>
    </div>
  );
}
