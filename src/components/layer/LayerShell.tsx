import { LayerNavBar } from "@/components/layer/LayerNavBar";
import { ReducedMotionConfig } from "@/components/ui/ReducedMotionConfig";

interface LayerShellProps {
  children: React.ReactNode;
}

// 모다(마켓플레이스) 페이지 전용 레이아웃 셸. 루트의 gf-dark가 하위 전체의 색 토큰을
// 다크로 덮어쓴다(globals.css). 모바일 드로어 상태는 LayerNavBar 내부에서 관리한다.
// 셸 아래 모든 모션(네비·히어로·카드·탭)이 움직임 감소 설정을 따르도록 여기서 한 번 감싼다.
export function LayerShell({ children }: LayerShellProps) {
  return (
    <ReducedMotionConfig>
      <div className="gf-dark min-h-dvh bg-gf-bg">
        <LayerNavBar />
        {children}
      </div>
    </ReducedMotionConfig>
  );
}
