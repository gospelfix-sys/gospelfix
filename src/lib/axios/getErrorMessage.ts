import { isAxiosError } from "@/lib/axios/instance";

// Route Handler가 { error } 로 내려준 한국어 메시지를 우선 쓰고, 없으면 fallback을 쓴다.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  return fallback;
}
