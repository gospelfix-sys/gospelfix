import { isAxiosError } from "@/lib/axios/instance";

// Route Handler가 { error } 로 내려준 한국어 메시지를 우선 쓰고, 없으면 fallback을 쓴다.
// 서버 응답 자체가 없는 네트워크 오류에 다른 문구가 필요하면 networkFallback을 넘긴다.
export function getErrorMessage(
  error: unknown,
  fallback: string,
  networkFallback: string = fallback,
): string {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  return networkFallback;
}
