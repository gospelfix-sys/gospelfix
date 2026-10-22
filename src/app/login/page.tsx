"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { sanitizeInternalPath } from "@/lib/utils";

const KAKAO_ERROR_MESSAGES: Record<string, string> = {
  denied: "카카오 로그인이 취소되었거나 인증에 실패했습니다.",
  state: "요청이 만료되었습니다. 다시 시도해주세요.",
  failed: "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
  config: "카카오 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
};

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuth();

  useEffect(() => {
    const next = sanitizeInternalPath(searchParams.get("next"), "/mypage");
    const view = searchParams.get("view") === "signup" ? "signup" : "login";
    const kakaoError = searchParams.get("kakaoError");
    const errorMessage = kakaoError
      ? (KAKAO_ERROR_MESSAGES[kakaoError] ?? KAKAO_ERROR_MESSAGES.failed)
      : undefined;
    openAuthModal(view, next, undefined, errorMessage);
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirect />
    </Suspense>
  );
}
