import { LayerNavBar } from "@/components/layer/LayerNavBar";
import { ReducedMotionConfig } from "@/components/ui/ReducedMotionConfig";

interface LayerShellProps {
  children: React.ReactNode;
}

// 모다(마켓플레이스) 페이지 전용 레이아웃 셸. 루트의 gf-themed가 사용자가 설정에서 고른 테마(기본 라이트)대로
// 하위 전체의 색 토큰을 정한다(globals.css). 모바일 드로어 상태는 LayerNavBar 내부에서 관리한다.
// 셸 아래 모든 모션(네비·히어로·카드·탭)이 움직임 감소 설정을 따르도록 여기서 한 번 감싼다.
export function LayerShell({ children }: LayerShellProps) {
  return (
    <ReducedMotionConfig>
      {/* LayerNavBar는 fixed 알약(top 20px + h 64px)이라 흐름에서 빠진다. 아래 pt는 그만큼 + 12px 여백을
          확보하는 값이며, LayerShellLoading의 fallback과 반드시 같은 값을 유지한다. */}
      <div className="gf-themed min-h-dvh bg-gf-bg pt-24">
        <LayerNavBar />
        {children}
      </div>
    </ReducedMotionConfig>
  );
}
