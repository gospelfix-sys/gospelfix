"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductOption } from "@/types/product.types";

// 설명은 description 문자열에 줄바꿈(\n)으로 합쳐 저장한다(cms.api 스키마 변경 없이 여러 줄 지원)
const MAX_DESCRIPTION_LINES = 6;

interface OptionalFieldRowProps {
  // 없으면 제거 버튼을 숨긴다(마지막 한 줄은 지울 수 없게 할 때)
  onRemove?: () => void;
  children: React.ReactNode;
}

// 설명 입력 한 줄: 입력칸 + 오른쪽 제거 버튼
function OptionalFieldRow({ onRemove, children }: OptionalFieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="입력칸 제거"
          className="h-8 w-8 shrink-0 text-gf-gray2 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <span className="h-8 w-8 shrink-0" aria-hidden />
      )}
    </div>
  );
}

interface PurchaseOptionEditorProps {
  options: ProductOption[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProductOption>) => void;
  onRemove: (index: number) => void;
}

export function PurchaseOptionEditor({
  options,
  onAdd,
  onUpdate,
  onRemove,
}: PurchaseOptionEditorProps) {
  // 사용자가 직접 늘리거나 줄인 설명 줄 수. 없으면 저장된 줄 수를 따르되 최소 한 줄은 열어 둔다
  const [lineCounts, setLineCounts] = useState<Record<string, number>>({});

  const getDescriptionLines = (opt: ProductOption) => {
    const saved = opt.description ? opt.description.split("\n") : [];
    const count = lineCounts[opt.id] ?? Math.max(saved.length, 1);
    return Array.from({ length: count }, (_, i) => saved[i] ?? "");
  };

  const commitDescriptionLines = (index: number, opt: ProductOption, lines: string[]) => {
    setLineCounts((prev) => ({ ...prev, [opt.id]: lines.length }));
    onUpdate(index, { description: lines.join("\n") });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {/* 제목은 감싸는 접이식 헤더가 표시하므로 안내 문구만 둔다 */}
        <p className="text-xs text-gf-gray2">비워두면 단일 가격으로 표시</p>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          항목 추가
        </Button>
      </div>
      <div className="space-y-3">
        {options.map((opt, index) => (
          <div
            key={opt.id}
            className="space-y-2 rounded-xl border border-gf-border bg-gf-white p-3"
          >
            <div className="flex items-center justify-between border-b border-gf-border pb-1">
              <span className="text-xs font-semibold text-gf-gray2">구매항목 {index + 1}</span>
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
              value={opt.label}
              onChange={(e) => onUpdate(index, { label: e.target.value })}
              placeholder="구매항목명 (예: 개인 이용, 상업 이용)"
              className="h-10 rounded-xl bg-gf-white"
            />
            <label className="flex items-center gap-2 text-xs text-gf-gray2">
              <Checkbox
                checked={opt.is_inquiry_only}
                onCheckedChange={(checked) =>
                  onUpdate(index, { is_inquiry_only: checked === true })
                }
              />
              별도 문의로 표시 (가격 대신 &quot;별도 문의&quot;로 노출)
            </label>
            {!opt.is_inquiry_only && (
              <Input
                type="text"
                inputMode="numeric"
                value={opt.price ? opt.price.toLocaleString("ko-KR") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  onUpdate(index, { price: raw === "" ? 0 : parseInt(raw, 10) });
                }}
                placeholder="판매 가격"
                className="h-10 rounded-xl bg-gf-white"
              />
            )}
            {getDescriptionLines(opt).map((line, lineIndex, lines) => (
              <OptionalFieldRow
                key={lineIndex}
                onRemove={
                  lines.length > 1
                    ? () =>
                        commitDescriptionLines(
                          index,
                          opt,
                          lines.filter((_, i) => i !== lineIndex),
                        )
                    : undefined
                }
              >
                <Input
                  value={line}
                  onChange={(e) =>
                    commitDescriptionLines(
                      index,
                      opt,
                      lines.map((l, i) => (i === lineIndex ? e.target.value : l)),
                    )
                  }
                  placeholder={
                    lineIndex === 0 ? "설명 (예: 디자인 수정작업 불포함)" : `설명 ${lineIndex + 1}`
                  }
                  className="h-10 rounded-xl bg-gf-white"
                />
              </OptionalFieldRow>
            ))}
            {getDescriptionLines(opt).length < MAX_DESCRIPTION_LINES && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    commitDescriptionLines(index, opt, [...getDescriptionLines(opt), ""])
                  }
                  className="h-auto gap-1 px-2 py-1 text-xs text-gf-gray2"
                >
                  <Plus className="h-3 w-3" /> 설명 추가 ({getDescriptionLines(opt).length}/
                  {MAX_DESCRIPTION_LINES})
                </Button>
              </div>
            )}
            <Input
              value={
                typeof opt.work_period_days === "number"
                  ? String(opt.work_period_days)
                  : (opt.work_period_days ?? "")
              }
              onChange={(e) => onUpdate(index, { work_period_days: e.target.value || null })}
              placeholder="작업기간 (숫자 또는 협의)"
              className="h-10 rounded-xl bg-gf-white"
            />
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-gf-gray2">
            등록된 구매항목이 없습니다. &quot;항목 추가&quot;를 눌러 추가하세요.
          </p>
        )}
      </div>
    </div>
  );
}
