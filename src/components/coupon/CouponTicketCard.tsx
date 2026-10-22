import { cn } from "@/lib/utils";
import { getCouponSourceLabel, getCouponStatusLabel, isCouponUsable } from "@/lib/coupon";
import type { Coupon } from "@/types/coupon.types";

export function CouponTicketCard({ coupon, className }: { coupon: Coupon; className?: string }) {
  const usable = isCouponUsable(coupon);

  return (
    <div className={cn("relative flex rounded-2xl border border-white/10 bg-black", className)}>
      <div className="flex w-24 shrink-0 items-center justify-center rounded-l-2xl bg-gf-orange/15">
        <span className="text-2xl font-black tracking-tight text-gf-orange">
          {coupon.discount_rate}%
        </span>
      </div>

      <div className="pointer-events-none absolute inset-y-3 left-24 border-l border-dashed border-white/15" />
      <div className="pointer-events-none absolute -top-3 left-24 size-6 -translate-x-1/2 rounded-full bg-gf-bg" />
      <div className="pointer-events-none absolute -bottom-3 left-24 size-6 -translate-x-1/2 rounded-full bg-gf-bg" />

      <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-sm font-bold text-white">{coupon.code}</span>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              usable ? "bg-gf-orange/15 text-gf-orange" : "bg-white/10 text-white/50",
            )}
          >
            {getCouponStatusLabel(coupon)}
          </span>
        </div>
        <p className="text-xs text-white/50">
          {[
            getCouponSourceLabel(coupon.source),
            `${new Date(coupon.expired_at).toLocaleDateString("ko-KR")}까지`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}
