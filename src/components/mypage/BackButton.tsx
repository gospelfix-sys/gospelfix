"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// 이전 화면(어느 경로에서 진입했는지)에 관계없이 브라우저 히스토리로 되돌아간다 —
// /mypage는 LayerSidebar 프로필 메뉴 등 여러 경로에서 진입할 수 있어 고정된
// href 대신 router.back()을 사용한다.
export function BackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => router.back()}
      className="gap-1.5 rounded-full border-gf-orange bg-gf-orange-bg px-4 py-2.5 text-sm font-semibold text-gf-orange hover:bg-gf-orange-bg"
    >
      <ArrowLeft className="h-4 w-4" />
      뒤로가기
    </Button>
  );
}
