"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableRowProps {
  id: string;
  // true면 핸들을 숨기고 드래그를 막는다(항목이 하나뿐일 때). 자리는 유지해 입력칸 정렬이 흔들리지 않는다.
  disabled?: boolean;
  children: ReactNode;
}

// 입력칸이 있는 한 줄. 입력 안의 텍스트 선택과 충돌하지 않게 드래그는 왼쪽 핸들에서만 시작한다.
export function SortableRow({ id, disabled = false, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      // dnd-kit이 드래그 위치를 transform 값으로 계산해 주므로 이 한 곳만 인라인으로 적용한다.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative flex items-center gap-1", isDragging && "z-20 opacity-60 shadow-lg")}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="드래그해서 순서 변경"
        disabled={disabled}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          "shrink-0 cursor-grab touch-none text-gf-gray2 active:cursor-grabbing",
          disabled && "invisible",
        )}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      {children}
    </div>
  );
}
