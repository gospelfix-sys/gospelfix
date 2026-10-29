"use client";

import { cn } from "@/lib/utils";

interface AuthSwitchLinkProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

// 모달 안에서 화면(소셜/로그인/회원가입)을 오가는 텍스트 링크 버튼
export default function AuthSwitchLink({ onClick, className, children }: AuthSwitchLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-semibold text-gf-orange underline-offset-4 outline-none hover:underline",
        className,
      )}
    >
      {children}
    </button>
  );
}
