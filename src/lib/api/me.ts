import { serverFetchOr } from "@/lib/serverFetch";
import type { AuthMeResponse } from "@/types/auth.types";

/**
 * 현재 세션의 사용자/프로필 정보를 조회한다.
 * 미로그인이거나 호출이 실패하면 null을 반환한다(throw하지 않음).
 */
export async function getMe(): Promise<AuthMeResponse | null> {
  return serverFetchOr<AuthMeResponse | null>("/api/auth/me", null, "getMe");
}
