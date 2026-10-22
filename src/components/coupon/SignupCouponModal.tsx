"use client";

import { useRecoilState } from "recoil";
import { CheckCircle2, Clock, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRemainingTime } from "@/lib/countdown";
import { useCountdown } from "@/hooks/useCountdown";
import { signupCouponAtom } from "@/store/atoms/couponAtom";

export default function SignupCouponModal() {
  const [coupon, setCoupon] = useRecoilState(signupCouponAtom);
  const remainingMs = useCountdown(coupon?.expired_at ?? null);

  function close() {
    setCoupon(null);
  }

  if (!coupon) return null;

  return (
    <Dialog open={coupon !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="bg-black p-6 text-center text-white sm:max-w-sm">
        <DialogTitle className="sr-only">회원가입 축하 쿠폰</DialogTitle>

        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gf-orange/15">
          <Gift className="size-7 text-gf-orange" />
        </div>

        <div>
          <p className="text-sm text-white/60">회원가입을 축하해요</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-white">
            {coupon.discount_rate}% 할인 쿠폰을 받았어요
          </h2>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="pointer-events-none absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-black" />
          <div className="pointer-events-none absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-black" />

          <div className="flex items-center gap-1.5 border-b border-dashed border-white/10 px-4 py-2.5 text-left">
            <CheckCircle2 className="size-3.5 shrink-0 text-gf-orange" />
            <span className="truncate text-xs font-bold text-white">{coupon.code}</span>
            <span className="shrink-0 text-xs text-white/50">할인쿠폰</span>
          </div>

          <div className="flex items-center justify-center py-8">
            <span className="text-5xl font-black tracking-tight text-gf-orange sm:text-[clamp(44px,5vw,68px)]">
              {coupon.discount_rate}%
            </span>
          </div>
        </div>

        {remainingMs !== null && remainingMs > 0 && (
          <div className="flex w-full items-center justify-between rounded-xl bg-gf-orange/10 px-4 py-3 text-left">
            <div>
              <p className="text-sm font-semibold text-white">쿠폰 유효기간</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                <Clock className="size-3.5" />
                시간이 지나면 혜택이 사라져요.
              </p>
            </div>
            <span className="shrink-0 text-lg font-black text-gf-orange">
              {formatRemainingTime(remainingMs)}
            </span>
          </div>
        )}

        <Button size="lg" className="h-14 w-full rounded-full text-base font-bold" onClick={close}>
          확인했어요
        </Button>
      </DialogContent>
    </Dialog>
  );
}
