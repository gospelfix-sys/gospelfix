"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAX_INFO_CHIPS,
  MAX_INFO_CHIP_LABEL_LENGTH,
  MAX_INFO_CHIP_VALUE_LENGTH,
  type ProductInfoChip,
} from "@/types/product.types";

interface InfoChipEditorProps {
  chips: ProductInfoChip[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProductInfoChip>) => void;
  onRemove: (index: number) => void;
}

export function InfoChipEditor({ chips, onAdd, onUpdate, onRemove }: InfoChipEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {/* 제목은 감싸는 접이식 헤더가 표시하므로 안내 문구만 둔다 */}
        <p className="text-xs text-gf-gray2">
          상세페이지 정보 칩에 표시돼요 (무료 상품은 &quot;결제수단&quot; 칩이 숨겨져요)
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={chips.length >= MAX_INFO_CHIPS}
          className="gap-1"
        >
          <Plus />
          항목 추가 ({chips.length}/{MAX_INFO_CHIPS})
        </Button>
      </div>
      <div className="space-y-2">
        {chips.map((chip, index) => (
          <div key={chip.id} className="flex items-center gap-2">
            <Input
              value={chip.label}
              onChange={(e) => onUpdate(index, { label: e.target.value })}
              aria-label="항목 이름"
              maxLength={MAX_INFO_CHIP_LABEL_LENGTH}
              placeholder="항목 (예: 진행방식)"
              className="h-10 w-[38%] shrink-0 rounded-xl bg-gf-white"
            />
            <Input
              value={chip.value}
              onChange={(e) => onUpdate(index, { value: e.target.value })}
              aria-label="항목 내용"
              maxLength={MAX_INFO_CHIP_VALUE_LENGTH}
              placeholder="내용 (예: 전 과정 온라인)"
              className="h-10 min-w-0 flex-1 rounded-xl bg-gf-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              aria-label="항목 삭제"
              className="shrink-0 text-gf-gray2 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {chips.length === 0 && (
          <p className="text-xs text-gf-gray2">
            항목이 없으면 기본 정보 칩이 표시됩니다. &quot;항목 추가&quot;로 직접 입력하세요.
          </p>
        )}
      </div>
    </div>
  );
}
