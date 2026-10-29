import { Suspense } from "react";
import { LayerShell } from "@/components/layer/LayerShell";

interface LayerShellLoadingProps {
  children: React.ReactNode;
}

// loading.tsx 전용 LayerShell. LayerShell은 클라이언트 컴포넌트(네비·MotionConfig)를 담고 있어
// 그 청크를 받는 동안 suspend되면 더 바깥 (public)/loading.tsx(홈 스켈레톤)가 잠깐 비친다.
// 그 사이에는 같은 다크 배경 + LayerShell과 같은 상단 여백(pt-24)만 맞춘 정적 셸로 받아, 네비가 들어와도
// 본문 스켈레톤 위치가 움직이지 않게 한다.
export function LayerShellLoading({ children }: LayerShellLoadingProps) {
  return (
    <Suspense
      fallback={
        <div className="gf-dark min-h-dvh bg-gf-bg pt-24">
          {children}
        </div>
      }
    >
      <LayerShell>{children}</LayerShell>
    </Suspense>
  );
}
