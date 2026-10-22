import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// startsWith("/") 검사만으로는 "/\evil.com" 같은 백슬래시 변형을 걸러내지 못한다 —
// WHATWG URL 파서는 http(s) 스킴에서 백슬래시를 슬래시와 동일하게 취급해
// new URL("/\\evil.com", origin)이 실제로는 https://evil.com/로 파싱되기 때문이다.
// 플레이스홀더 origin으로 파싱한 뒤 origin이 그대로인지 확인해 이 변형까지 차단한다.
export function sanitizeInternalPath(rawPath: string | null | undefined, fallback = "/"): string {
  if (!rawPath) return fallback;
  try {
    const placeholderOrigin = "http://internal.invalid";
    const parsed = new URL(rawPath, placeholderOrigin);
    if (parsed.origin !== placeholderOrigin) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}

// work_period_days는 숫자(예: 1)뿐 아니라 "협의" 같은 텍스트로도 입력될 수 있고,
// API 응답에서는 숫자가 문자열("1")로 내려올 수도 있어 값 자체가 숫자로 변환 가능한지로 판단한다.
export function formatWorkPeriodDays(value: number | string | null | undefined) {
  if (value == null || (typeof value === "string" && value.trim() === "")) return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? `${numeric}일` : String(value);
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// cms.api ProductForm과 동일한 규칙(gospelfix.cms.api/src/libs/utils.ts) — 판매자가
// 마이페이지에서 등록한 상품도 관리자가 등록한 것과 같은 형태의 slug를 갖도록 맞춘다.
// 슬러그(URL)는 영문 소문자/숫자/하이픈만 허용한다 — 한글·특수문자는 입력 즉시 제거된다.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
