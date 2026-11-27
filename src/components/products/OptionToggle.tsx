"use client";

import { useState } from "react";
import { cn, formatWorkPeriodDays } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OptionToggleProps {
  label: string;
  priceLabel: string;
  description?: string | null;
  workPeriodDays?: number | string | null;
  detail?: string | null;
  isSelected: boolean;
  onClick: () => void;
}

function splitLabelSuffix(label: string) {
  const match = label.match(/^(.*?)(\(.*\))$/);
  if (!match) return { main: label, suffix: null };
  return { main: match[1].trim(), suffix: match[2] };
}

export function OptionToggle({
  label,
  priceLabel,
  description,
  workPeriodDays,
  detail,
  isSelected,
  onClick,
}: OptionToggleProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { main: dialogTitleMain, suffix: dialogTitleSuffix } = splitLabelSuffix(label);
  // 설명은 여러 줄(\n 구분)로 저장되며, 빈 줄은 표시하지 않는다
  const descriptionLines = (description ?? "").split("\n").filter((line) => line.trim() !== "");

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-4 rounded-2xl bg-gf-white p-6",
        isSelected ? "border-2 border-gf-orange" : "border border-gf-border",
      )}
    >
      <p className="font-bold text-gf-black">{label}</p>

      <div className="flex items-start justify-between gap-4">
        {(descriptionLines.length > 0 || workPeriodDays != null) && (
          <div className="flex flex-col gap-1.5 text-sm text-gf-gray1">
            {descriptionLines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex items-center gap-2">
                <span>{line}</span>
                {lineIndex === 0 && detail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDetailOpen(true);
                    }}
                    className="h-auto shrink-0 rounded-md border-gf-orange bg-transparent py-0.5 font-medium text-gf-orange hover:bg-gf-orange-bg hover:text-gf-orange"
                  >
                    상세보기
                  </Button>
                )}
              </div>
            ))}
            {workPeriodDays != null && (
              <span>작업기간 : {formatWorkPeriodDays(workPeriodDays)}</span>
            )}
          </div>
        )}

        <p
          className={cn(
            "shrink-0 font-en font-black text-2xl",
            isSelected ? "text-gf-orange" : "text-gf-black",
          )}
        >
          {priceLabel}
        </p>
      </div>

      {detail && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="gap-5 p-6 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {dialogTitleSuffix ? (
                    <>
                      {dialogTitleMain}
                      <br />
                      <span className="block">{dialogTitleSuffix}</span>
                    </>
                  ) : (
                    label
                  )}
                </DialogTitle>
              </DialogHeader>
              <p className="rounded-lg bg-gf-bg p-4 text-base leading-relaxed text-gf-gray1">
                {detail}
              </p>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
