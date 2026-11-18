"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableBlockProps {
  id: string;
  className?: string;
  children: ReactNode;
}

// 업로드 캔버스의 블록 한 칸. 드래그는 핸들에서만 시작되게 해서, 에디터 안의 텍스트 선택·입력과
// 충돌하지 않게 한다.
export function SortableBlock({ id, className, children }: SortableBlockProps) {
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
      ref={setNodeRef}
      // dnd-kit이 드래그 위치를 transform 값으로 계산해 주므로 이 한 곳만 인라인으로 적용한다.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", className, isDragging && "z-20 opacity-60 shadow-lg")}
    >
      <SortableHandle
        attributes={attributes}
        listeners={listeners}
        setActivatorNodeRef={setActivatorNodeRef}
      />
      {children}
    </div>
  );
}

interface SortableHandleProps {
  attributes: DraggableAttributes;
  listeners: ReturnType<typeof useSortable>["listeners"];
  setActivatorNodeRef: (element: HTMLElement | null) => void;
}

function SortableHandle({ attributes, listeners, setActivatorNodeRef }: SortableHandleProps) {
  return (
    <Button
      type="button"
      variant="round"
      size="icon-xs"
      aria-label="드래그해서 블록 순서 변경"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      className="absolute left-2 top-2 z-10 cursor-grab touch-none active:cursor-grabbing"
    >
      <GripVertical className="h-3 w-3" />
    </Button>
  );
}
