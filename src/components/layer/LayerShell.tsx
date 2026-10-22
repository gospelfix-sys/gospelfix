"use client";

import { Suspense, useState } from "react";
import { LayerSidebar } from "@/components/layer/LayerSidebar";
import { LayerTopBar } from "@/components/layer/LayerTopBar";

interface LayerShellProps {
  children: React.ReactNode;
}

// 모다(마켓플레이스) 페이지 전용 레이아웃 셸. 모바일 사이드바 열림 상태를 여기서 관리해
// 형제 관계인 LayerSidebar(패널)와 LayerTopBar(햄버거 버튼)가 같은 상태를 공유하게 한다.
export function LayerShell({ children }: LayerShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-gf-bg">
      <Suspense fallback={null}>
        <LayerSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </Suspense>

      <div className="lg:pl-[220px]">
        <LayerTopBar onMenuClick={() => setMobileMenuOpen(true)} />
        {children}
      </div>
    </div>
  );
}
