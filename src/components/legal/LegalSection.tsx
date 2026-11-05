import type { ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  // 목차 앵커로 이동할 조항에만 넘긴다
  id?: string;
  children: ReactNode;
}

// 약관·개인정보·환불 문서의 조항 하나(제목 + 본문)
export default function LegalSection({ title, id, children }: LegalSectionProps) {
  return (
    <section id={id} className={id ? "scroll-mt-8" : undefined}>
      <h2 className="text-lg font-bold text-gf-black mb-4">{title}</h2>
      {children}
    </section>
  );
}
