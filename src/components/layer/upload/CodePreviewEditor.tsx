"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductCodePreviewItem } from "@/types/product.types";

interface CodePreviewEditorProps {
  items: ProductCodePreviewItem[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProductCodePreviewItem>) => void;
  onRemove: (index: number) => void;
}

export function CodePreviewEditor({ items, onAdd, onUpdate, onRemove }: CodePreviewEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gf-black">
          코드 미리보기{" "}
          <span className="font-normal text-gf-gray2">(비워두면 섹션이 표시되지 않음)</span>
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-3.5 w-3.5" />탭 추가
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="space-y-2 rounded-xl border border-gf-border bg-gf-white p-3"
          >
            <div className="flex items-center justify-between border-b border-gf-border pb-1">
              <span className="text-xs font-semibold text-gf-gray2">탭 {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="h-auto gap-1 px-2 py-1 text-xs text-gf-gray2 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> 삭제
              </Button>
            </div>
            <Input
              value={item.label}
              onChange={(e) => onUpdate(index, { label: e.target.value })}
              placeholder="탭 이름 = 파일명 (예: index.html)"
              className="h-10 rounded-xl bg-gf-white"
            />
            <textarea
              value={item.code}
              onChange={(e) => onUpdate(index, { code: e.target.value })}
              placeholder="실제 코드를 그대로 붙여넣으세요"
              rows={6}
              className={cn(
                "w-full min-w-0 resize-none rounded-xl border border-input bg-gf-white px-3 py-2 font-mono text-xs outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]",
              )}
            />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gf-gray2">
            등록된 코드 탭이 없습니다. &quot;탭 추가&quot;를 눌러 추가하세요.
          </p>
        )}
      </div>
    </div>
  );
}
