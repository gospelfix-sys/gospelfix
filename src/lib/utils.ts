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

// Next 14.2의 동적 라우트 params는 한글 같은 비ASCII 문자가 percent-encoding된 채로 들어온다.
// 그대로 encodeURIComponent로 API 경로에 넣으면 이중 인코딩되어(%25ED…) cms.api가 원문 slug를
// 못 찾고 404가 나므로, 경로에 넣기 전에 한 번 디코딩한다. 잘못된 % 시퀀스는 URIError를
// 던지므로 원본을 그대로 돌려줘 정상적인 404 흐름으로 보낸다.
// "."/".."는 인코딩되지 않아 axios가 URL 경로를 정규화해 버리므로(…/api/products/.. → …/api/)
// 디코딩하지 않고 원본(%2E%2E)을 유지해 이중 인코딩된 채로 404가 되게 한다.
export function decodeRouteParam(value: string): string {
  try {
    const decoded = decodeURIComponent(value);
    return decoded === "." || decoded === ".." ? value : decoded;
  } catch {
    return value;
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

// "2026년 10월 27일" 형태. 블로그 카드·상세가 같은 표기를 쓰도록 한 곳에서 정의한다.
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

// 신규 작품의 슬러그 기본값 — 한글 제목은 slugify하면 비어버리므로 숫자만으로 랜덤 생성한다.
// 중복(409)은 서버가 필드 에러로 알려주므로 판매자가 직접 고치거나 재생성할 수 있다.
export function generateRandomSlug(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  // 첫 자리가 0이면 숫자로 읽혔을 때 길이가 줄어 보이므로 1~9로 시작시킨다.
  return Array.from(bytes, (b, i) => (i === 0 ? (b % 9) + 1 : b % 10)).join("");
}

// 상품 상세에 표시되는 제품코드 — 문의 때 쓰는 품번이라 판매자가 짓지 않고 자동 부여한다.
// DB에 유일 제약은 없지만 8자리 숫자 랜덤이라 겹칠 확률은 사실상 무시할 수 있다.
export function generateProductCode(): string {
  return `GF${generateRandomSlug(8)}`;
}
