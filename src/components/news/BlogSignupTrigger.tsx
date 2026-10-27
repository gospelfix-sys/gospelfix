"use client";

import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { useAuth } from "@/hooks/useAuth";
import { authLoadingAtom } from "@/store/atoms/authAtom";

const SHOWN_STORAGE_KEY = "gf_blog_signup_prompt_shown";

interface BlogSignupTriggerProps {
  // 가입 후 돌아올 경로
  next: string;
}

/**
 * 블로그 본문을 끝까지 읽은 비로그인 사용자에게 회원가입 팝업을 한 번 띄운다.
 * 본문 끝에 둔 빈 sentinel이 뷰포트에 들어오면 트리거한다. 모달(내부 div 스크롤)과
 * 풀 페이지(window 스크롤) 모두 root: null로 동일하게 감지된다.
 */
export default function BlogSignupTrigger({ next }: BlogSignupTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, authModalView, openAuthModal } = useAuth();
  const authLoading = useRecoilValue(authLoadingAtom);

  useEffect(() => {
    // /auth/me 응답 전에는 isAuthenticated가 false라 로그인 사용자에게도 뜰 수 있다.
    if (authLoading || isAuthenticated || authModalView) return;

    try {
      if (sessionStorage.getItem(SHOWN_STORAGE_KEY)) return;
    } catch {
      // 저장소 접근이 막힌 환경에서는 세션 내 반복 노출만 감수한다.
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          sessionStorage.setItem(SHOWN_STORAGE_KEY, "1");
        } catch {
          // 무시
        }
        openAuthModal("signup", next);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [authLoading, isAuthenticated, authModalView, openAuthModal, next]);

  return <div ref={sentinelRef} aria-hidden="true" className="h-px" />;
}
