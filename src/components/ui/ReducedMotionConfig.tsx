"use client";

import { MotionConfig } from "motion/react";

interface ReducedMotionConfigProps {
  children: React.ReactNode;
}

// OS의 "동작 줄이기" 설정을 따르도록 하위 motion 컴포넌트의 transform·layout 애니메이션을 끈다
// (opacity 전환은 남는다). 서버 컴포넌트 레이아웃에서도 감쌀 수 있게 작은 클라이언트 경계로 둔다.
export function ReducedMotionConfig({ children }: ReducedMotionConfigProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
