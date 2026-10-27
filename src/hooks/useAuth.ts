"use client";

import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios/instance";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { userProfileAtom, type UserProfile } from "@/store/atoms/userAtom";
import { authModalAtom, type AuthModalView } from "@/store/atoms/uiAtom";
import { signupCouponAtom } from "@/store/atoms/couponAtom";
import { isAuthenticatedSelector, isAdminSelector } from "@/store/selectors/authSelector";
import type { OAuthProvider } from "@/types/auth.types";
import { fetchSignupCoupon } from "@/lib/coupon";

async function postJson<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? "요청 처리에 실패했습니다.");
  }
  return data as T;
}

export function useAuth() {
  const router = useRouter();

  const user = useRecoilValue(authUserAtom);
  const setAuthUser = useSetRecoilState(authUserAtom);
  const setUserProfile = useSetRecoilState(userProfileAtom);
  const [isLoading, setIsLoading] = useRecoilState(authLoadingAtom);
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const isAdmin = useRecoilValue(isAdminSelector);
  const [authModal, setAuthModal] = useRecoilState(authModalAtom);
  const setSignupCoupon = useSetRecoilState(signupCouponAtom);

  const resetAuthUser = useResetRecoilState(authUserAtom);
  const resetUserProfile = useResetRecoilState(userProfileAtom);
  const resetSignupCoupon = useResetRecoilState(signupCouponAtom);

  // 로그인/회원가입 직후 httpOnly 쿠키는 서버에 이미 반영됐지만, AuthProvider의
  // /api/auth/me 호출은 최초 마운트 시 한 번뿐이라 router.refresh()로는 갱신되지 않는다.
  // 여기서 같은 엔드포인트를 다시 불러 authUserAtom/userProfileAtom을 즉시 동기화한다.
  const refreshAuthUser = useCallback(async () => {
    const res = await axiosInstance.get("/auth/me", { validateStatus: () => true });
    if (res.status !== 200) {
      setAuthUser(null);
      setUserProfile(null);
      return;
    }
    const { user: fetchedUser, profile } = res.data;
    setAuthUser(fetchedUser ?? null);
    setUserProfile((profile as UserProfile) ?? null);
  }, [setAuthUser, setUserProfile]);

  const signIn = useCallback(
    async (email: string, password: string, redirectTo = "/") => {
      setIsLoading(true);
      try {
        await postJson("/api/auth/login", { email, password });
        await refreshAuthUser();
      } finally {
        setIsLoading(false);
      }
      router.push(redirectTo);
      router.refresh();
    },
    [router, setIsLoading, refreshAuthUser],
  );

  const signUp = useCallback(
    async (email: string, password: string, referralCode?: string) => {
      setIsLoading(true);
      try {
        const data = await postJson<{ status?: "confirmation_required" }>("/api/auth/signup", {
          email,
          password,
          referralCode,
        });
        const confirmationRequired = data.status === "confirmation_required";
        if (!confirmationRequired) {
          // cms.api는 가입 쿠폰을 /api/auth/signup 응답을 반환하기 전에 이미 발급하므로,
          // 여기서 refreshAuthUser()와 쿠폰 조회는 서로의 결과에 의존하지 않아 병렬로
          // 실행해도 레이스 컨디션이 없다.
          const [, signupCoupon] = await Promise.all([refreshAuthUser(), fetchSignupCoupon()]);
          if (signupCoupon) setSignupCoupon(signupCoupon);
        }
        return { confirmationRequired };
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, refreshAuthUser, setSignupCoupon],
  );

  const signInWithOAuth = useCallback(
    (provider: OAuthProvider) => {
      if (provider !== "kakao") {
        throw new Error(`${provider} 소셜 로그인은 현재 준비 중입니다.`);
      }
      const params = new URLSearchParams({
        next: authModal.next,
        view: authModal.view === "signup" ? "signup" : "login",
      });
      if (authModal.referralCode) params.set("referralCode", authModal.referralCode);
      window.location.href = `/api/auth/kakao?${params.toString()}`;
    },
    [authModal.next, authModal.referralCode, authModal.view],
  );

  const signOut = useCallback(
    async (redirectTo = "/login") => {
      try {
        await postJson("/api/auth/logout");
      } finally {
        resetAuthUser();
        resetUserProfile();
        resetSignupCoupon();
        router.push(redirectTo);
        router.refresh();
      }
    },
    [router, resetAuthUser, resetUserProfile, resetSignupCoupon],
  );

  const openAuthModal = useCallback(
    (view: AuthModalView, next?: string, referralCode?: string, error?: string) => {
      setAuthModal((prev) => ({ view, next: next ?? prev.next, referralCode, error }));
    },
    [setAuthModal],
  );

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, view: null }));
  }, [setAuthModal]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    authModalView: authModal.view,
    authModalNext: authModal.next,
    authModalReferralCode: authModal.referralCode,
    authModalError: authModal.error,
    openAuthModal,
    closeAuthModal,
  };
}
