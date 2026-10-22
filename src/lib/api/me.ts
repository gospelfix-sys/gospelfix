import { serverFetch } from "@/lib/serverFetch";
import { AuthMeResponse } from "@/types/auth.types";

/**
 * 현재 세션의 사용자/프로필 정보를 조회한다.
 * 미로그인이거나 호출이 실패하면 null을 반환한다(throw하지 않음).
 */
export async function getMe(): Promise<AuthMeResponse | null> {
  try {
    return await serverFetch<AuthMeResponse>("/api/auth/me");
  } catch (error) {
    console.error("[getMe] /api/auth/me 호출 실패", error);
    return null;
  }
}
