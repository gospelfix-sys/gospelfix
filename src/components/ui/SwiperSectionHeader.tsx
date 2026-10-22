import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwiperSectionHeaderProps {
  title: string;
  badgeLabel: string;
  subtitle: string;
  actions?: ReactNode;
  paddingClassName?: string;
}

export function SwiperSectionHeader({
  title,
  badgeLabel,
  subtitle,
  actions,
  paddingClassName = "px-6 lg:px-[60px]",
}: SwiperSectionHeaderProps) {
  return (
    <>
      <div className={cn(paddingClassName, "flex items-start justify-between gap-4 mb-3")}>
        <div className="inline-flex items-start gap-1">
          <h2 className="text-4xl font-black text-gf-black leading-tight">{title}</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gf-orange text-white shrink-0 -mt-1">
            {badgeLabel}
          </span>
        </div>
        {actions}
      </div>

      <p className={cn(paddingClassName, "text-sm text-gf-gray2 mb-10")}>{subtitle}</p>
    </>
  );
}
