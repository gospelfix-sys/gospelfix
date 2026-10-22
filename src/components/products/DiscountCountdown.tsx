"use client";

import { Clock } from "lucide-react";
import { formatRemainingTime } from "@/lib/countdown";
import { useCountdown } from "@/hooks/useCountdown";

export function DiscountCountdown({ endsAt }: { endsAt: string }) {
  const remainingMs = useCountdown(endsAt);

  if (remainingMs === null || Number.isNaN(remainingMs) || remainingMs <= 0) return null;

  return (
    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-gf-orange">
      <Clock className="size-3.5" />
      {formatRemainingTime(remainingMs)} 남음
    </p>
  );
}
