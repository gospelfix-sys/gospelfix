"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface SortableGalleryImageProps {
  id: string;
  children: ReactNode;
}

// 이미지 묶음의 썸네일 한 칸. 썸네일이 작아 별도 핸들 없이 카드 전체를 잡아 끈다.
// 안의 용도·삭제 버튼은 클릭이 먼저라, 센서의 이동 거리 조건(8px) 덕분에 드래그와 충돌하지 않는다.
export function SortableGalleryImage({ id, children }: SortableGalleryImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  return (
    <div
      // 카드 자체를 activator로 등록해야 안의 버튼에서 누른 Enter/Space가 키보드 드래그로 가로채이지 않는다.
      ref={(element) => {
        setNodeRef(element);
        setActivatorNodeRef(element);
      }}
      // dnd-kit이 드래그 위치를 transform 값으로 계산해 주므로 이 한 곳만 인라인으로 적용한다.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "relative h-24 w-24 cursor-grab touch-none overflow-hidden rounded-lg border border-gf-border bg-gf-gray3 active:cursor-grabbing",
        isDragging && "z-20 opacity-60 shadow-lg",
      )}
    >
      {children}
    </div>
  );
}
