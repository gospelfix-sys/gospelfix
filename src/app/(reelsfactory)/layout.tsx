import { ReducedMotionConfig } from "@/components/ui/ReducedMotionConfig";

interface ReelsfactoryLayoutProps {
  children: React.ReactNode;
}

// (public)의 TopBar·Footer·@modal 없이 독립 화면으로 쓰려고 별도 route group으로 뺐다.
// 루트 레이아웃의 Provider(PostHog·Recoil·Auth·Cart)와 쿠키 동의 배너는 그대로 상속한다.
export default function ReelsfactoryLayout({ children }: ReelsfactoryLayoutProps) {
  return <ReducedMotionConfig>{children}</ReducedMotionConfig>;
}
