"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MAX_SUB_CATEGORIES, type ProductCategory } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ProductCategory[];
  subCategoryOptions: ProductCategory[];
  draftCategory: string;
  draftSubCategories: string[];
  onDraftCategoryChange: (value: string) => void;
  onToggleDraftSubCategory: (value: string) => void;
  onConfirm: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  categories,
  subCategoryOptions,
  draftCategory,
  draftSubCategories,
  onDraftCategoryChange,
  onToggleDraftSubCategory,
  onConfirm,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">카테고리 선택</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[128px_1fr] overflow-hidden rounded-xl border border-gf-border">
          <div className="flex flex-col border-r border-gf-border bg-gf-bg py-2">
            {categories.map((c) => {
              const selected = c.value === draftCategory;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onDraftCategoryChange(c.value)}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium transition-colors",
                    selected ? "bg-gf-white text-gf-orange" : "text-gf-gray1 hover:bg-gf-white",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto bg-gf-white p-3">
            <p className="px-1 pb-1 text-base font-bold text-gf-black">
              업종 소분류{" "}
              <span className="text-gf-orange">
                (최대 {MAX_SUB_CATEGORIES}개까지 선택 · {draftSubCategories.length}/
                {MAX_SUB_CATEGORIES})
              </span>
            </p>
            {subCategoryOptions.map((sc) => {
              const selected = draftSubCategories.includes(sc.value);
              return (
                <div
                  key={sc.value}
                  role="checkbox"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => onToggleDraftSubCategory(sc.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggleDraftSubCategory(sc.value);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl p-3",
                    selected ? "border-2 border-gf-orange" : "border border-gf-border",
                  )}
                >
                  <span className="text-sm font-medium text-gf-black">{sc.label}</span>
                  {selected && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gf-orange text-white">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="bg-gf-white sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-full bg-gf-bg px-6 font-bold text-gf-black hover:bg-gf-border"
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={!draftCategory}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-11 rounded-full px-6 font-bold"
          >
            선택
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
