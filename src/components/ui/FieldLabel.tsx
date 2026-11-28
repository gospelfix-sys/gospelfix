import type { ReactNode } from "react";

interface FieldLabelProps {
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}

// 폼 입력칸 라벨. 필수는 라벨 옆 빨간 점, 선택은 "(선택)"으로 구분한다. 점의 의미는 폼 상단 안내문이 설명한다.
export function FieldLabel({ htmlFor, optional = false, children }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="inline-flex items-center gap-1 text-sm font-medium">
      {children}
      {optional ? (
        <span className="text-xs font-normal text-muted-foreground">(선택)</span>
      ) : (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-destructive" />
      )}
    </label>
  );
}
