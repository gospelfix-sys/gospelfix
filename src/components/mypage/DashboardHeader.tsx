"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export default function DashboardHeader({ email, fullName, avatarUrl }: DashboardHeaderProps) {
  const { signOut, isLoading } = useAuth();

  // 이름 또는 이메일 앞글자를 아바타 폴백으로 사용
  const initials = (fullName ?? email).charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b bg-gf-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-0.5 text-lg font-black tracking-[-0.03em] no-underline text-gf-black"
        >
          <span className="font-kr">GOSPEL</span>
          <span className="font-kr text-gf-orange">FIX</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar size="default">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName ?? email} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-sm">
              <p className="font-medium leading-none">{fullName ?? email}</p>
              {fullName && <p className="text-xs text-muted-foreground mt-0.5">{email}</p>}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => signOut()} disabled={isLoading}>
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
