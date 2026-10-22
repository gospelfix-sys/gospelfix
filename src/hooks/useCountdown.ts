"use client";

import { useEffect, useState } from "react";

/** target(ISO 문자열)까지 남은 시간(ms)을 1초마다 갱신한다. 지나면 그 시점부터 멈춘다. */
export function useCountdown(target: string | null): number | null {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;

    const tick = () => {
      const ms = new Date(target).getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) clearInterval(id);
    };

    const id = setInterval(tick, 1000);
    tick();

    return () => clearInterval(id);
  }, [target]);

  return remainingMs;
}
