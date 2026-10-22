"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouteModalClose } from "@/components/ui/RouteModal";
import { cn } from "@/lib/utils";

interface ProductVisitNavProps {
  demoUrl?: string | null;
}

// 상세페이지 전용 플로팅 네비게이션. TopBar의 CompactNav("검정 알약" 헤더)와 동일한
// 디자인 토큰(rounded-[28px] bg-black + shadow, 오렌지 CTA, 흰 텍스트 로고)을 재사용해
// TopBar가 숨겨지는 /detail 경로에서도 같은 브랜드 아이덴티티를 유지한다.
export function ProductVisitNav({ demoUrl }: ProductVisitNavProps) {
  // RouteModal(인터셉트 모달) 안에서는 뒤로가기 버튼이 popup 최상위에 absolute로 있다.
  // 이 nav가 그 아래 overflow-y-auto 스크롤 컨테이너 안에서 sticky로 있으면 기준
  // containing block이 서로 달라 bottom 값을 아무리 맞춰도 정확히 정렬되지 않는다.
  // 모달 안에서는 fixed로 바꿔 뒤로가기 버튼과 같은 containing block(popup의
  // motion.div — transform이 걸려 fixed 자손의 기준점이 됨)을 공유하게 한다.
  const isInModal = useRouteModalClose() !== null;

  function scrollToProductInfo() {
    document.getElementById("product-info")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // javascript: 등 위험한 스킴이 그대로 href에 들어가지 않도록 http(s)만 허용한다
  // (RichTextEditor.tsx의 링크 삽입 검증과 동일한 화이트리스트 방식).
  const isSafeDemoUrl = !!demoUrl && /^https?:\/\//.test(demoUrl);

  return (
    <nav
      className={cn(
        "pointer-events-none z-40 flex justify-center px-6",
        isInModal ? "fixed inset-x-0 bottom-6" : "sticky bottom-4",
      )}
    >
      <div className="pointer-events-auto flex h-[60px] w-fit items-center gap-2.5 rounded-md bg-black px-2 shadow-[0_1px_20px_rgba(0,0,0,0.25)] sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-0.5 text-base font-black tracking-[-0.03em] text-white"
        >
          <span className="font-kr">GOSPEL</span>
          <span className="font-kr text-gf-orange">FIX</span>
        </Link>

        <div className="h-6 w-px shrink-0 bg-white/20" />

        <Button
          type="button"
          onClick={scrollToProductInfo}
          className="h-11 gap-1.5 rounded-md border border-white/20 bg-transparent px-4 text-sm font-bold text-white/60 shadow-none hover:bg-transparent hover:text-white"
        >
          <Info className="size-4" />
          Info
        </Button>

        {isSafeDemoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 shrink-0 items-center rounded-md bg-gf-orange px-5 text-sm font-bold text-white transition-all duration-200 hover:opacity-80"
          >
            Visit Site
          </a>
        )}
      </div>
    </nav>
  );
}
