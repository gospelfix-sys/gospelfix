export function formatRemainingTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return days > 0 ? `${days}일 ${h}:${m}:${s}` : `${h}:${m}:${s}`;
}
