"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import AuthDivider from "./AuthDivider";
import AuthSwitchLink from "./AuthSwitchLink";
import GoogleLoginButton from "./GoogleLoginButton";
import KakaoLoginButton from "./KakaoLoginButton";

export default function SocialLoginView() {
  const { authModalError, switchAuthModalView } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <Image src="/logo.webp" alt="GospelFix" width={48} height={48} className="mb-3 rounded-xl" />
      <h2 className="text-xl font-bold text-gf-black">가스펄픽스에 오신 것을 환영합니다</h2>
      <p className="mt-1 mb-6 text-sm text-gf-gray2">간편하게 로그인하고 시작해보세요</p>

      <div className="flex w-full flex-col gap-3">
        <GoogleLoginButton />
        <KakaoLoginButton />

        {authModalError && (
          <p
            role="alert"
            className="rounded-lg bg-[rgba(220,38,38,0.1)] px-3 py-2 text-sm text-destructive"
          >
            {authModalError}
          </p>
        )}
      </div>

      <AuthDivider label="또는" className="mt-4" />

      <AuthSwitchLink
        onClick={() => switchAuthModalView("login")}
        className="mt-4 text-sm text-gf-black"
      >
        다른 방법으로 로그인
      </AuthSwitchLink>

      <p className="mt-5 text-center text-xs text-gf-gray2">
        계속하면{" "}
        <LegalDialogTrigger
          type="terms"
          className="underline underline-offset-2 hover:text-gf-black"
        >
          이용약관
        </LegalDialogTrigger>{" "}
        및{" "}
        <LegalDialogTrigger
          type="privacy"
          className="underline underline-offset-2 hover:text-gf-black"
        >
          개인정보 처리방침
        </LegalDialogTrigger>
        에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
