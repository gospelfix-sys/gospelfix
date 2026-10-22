// cms.api `/api/v1/auth/me`가 반환하는 최소 사용자 형태 (Supabase 타입에 의존하지 않는다)
export interface CmsUser {
  id: string;
  email?: string;
}

export interface AuthState {
  user: CmsUser | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

export type OAuthProvider = "google" | "kakao";

// cms.api `GET /api/v1/auth/me` 응답 전체 형태 (src/libs/openapi/schemas/auth.schema.ts의 MeResponseSchema와 동일)
export interface AuthMeResponse {
  user: CmsUser | null;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "user" | "admin" | "seller";
    created_at: string;
    referral_code: string | null;
    // 판매자 전환 신청 시각. NULL이면 신청 안 함 — 관리자가 /users에서 수동으로
    // 승인해야 role이 seller로 바뀐다(자동 승인 없음).
    seller_requested_at: string | null;
  } | null;
}
