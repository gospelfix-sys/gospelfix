"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductOption } from "@/types/product.types";

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
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gf-black">
          구매항목 <span className="font-normal text-gf-gray2">(비워두면 단일 가격으로 표시)</span>
        </h2>
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
              placeholder="구매항목명 (예: 단순복사)"
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
            <Input
              value={opt.description ?? ""}
              onChange={(e) => onUpdate(index, { description: e.target.value })}
              placeholder="설명 (예: 디자인 수정작업 불포함)"
              className="h-10 rounded-xl bg-gf-white"
            />
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
