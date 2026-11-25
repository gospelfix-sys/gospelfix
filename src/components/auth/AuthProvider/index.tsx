"use client";

import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import axiosInstance from "@/lib/axios/instance";
import { authUserAtom, authLoadingAtom } from "@/store/atoms/authAtom";
import { userProfileAtom, type UserProfile } from "@/store/atoms/userAtom";
import { signupCouponAtom } from "@/store/atoms/couponAtom";
import { fetchSignupCoupon } from "@/lib/coupon";
import AuthModal from "@/components/auth/AuthModal";
import SignupCouponModal from "@/components/coupon/SignupCouponModal";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setAuthUser = useSetRecoilState(authUserAtom);
  const setAuthLoading = useSetRecoilState(authLoadingAtom);
  const setUserProfile = useSetRecoilState(userProfileAtom);
  const setSignupCoupon = useSetRecoilState(signupCouponAtom);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      try {
        // 비로그인은 200 + user null로 오지만, 5xx 등 그 외 상태에서 axios가 던지지 않게
        // validateStatus로 직접 분기 처리한다(전역 401 인터셉터의 /login 리다이렉트도 피한다).
        const res = await axiosInstance.get("/auth/me", { validateStatus: () => true });
        if (res.status !== 200) {
          if (!cancelled) {
            setAuthUser(null);
            setUserProfile(null);
          }
          return;
        }
        const { user, profile } = res.data;
        if (!cancelled) {
          setAuthUser(user ?? null);
          setUserProfile((profile as UserProfile) ?? null);
        }
      } catch {
        if (!cancelled) {
          setAuthUser(null);
          setUserProfile(null);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [setAuthUser, setAuthLoading, setUserProfile]);

  useEffect(() => {
    // 공개 페이지는 middleware에서 토큰을 선제 갱신하지 않으므로(TTFB 블로킹 방지), 마운트
    // 시점에 백그라운드로 갱신을 트리거한다. 응답을 기다리거나 상태에 반영하지 않아도
    // 되고, 성공하면 이후 요청부터 갱신된 쿠키가 자동으로 쓰인다.
    fetch("/api/auth/refresh", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  useEffect(() => {
    // 소셜(카카오·구글) 신규가입은 signUp()을 거치지 않는 풀 리다이렉트라, lib/cmsApi/oauth.ts가 실어 보낸
    // 이 쿼리 플래그로 가입 축하 쿠폰 안내를 대신 트리거한다. 새로고침 시 재발급 안내가 다시
    // 뜨지 않도록 확인 즉시 URL에서 플래그를 제거한다.
    const params = new URLSearchParams(window.location.search);
    if (params.get("newUser") !== "1") return;
    params.delete("newUser");
    const cleanedSearch = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (cleanedSearch ? `?${cleanedSearch}` : ""),
    );
    fetchSignupCoupon().then((coupon) => {
      if (coupon) setSignupCoupon(coupon);
    });
  }, [setSignupCoupon]);

  return (
    <>
      {children}
      <AuthModal />
      <SignupCouponModal />
    </>
  );
}
