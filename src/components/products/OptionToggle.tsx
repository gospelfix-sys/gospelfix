"use client";

import { useState } from "react";
import { cn, formatWorkPeriodDays } from "@/lib/utils";
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
        {(description || workPeriodDays != null) && (
          <div className="flex flex-col gap-1.5 text-sm text-gf-gray1">
            {description && (
              <div className="flex items-center gap-2">
                <span>{description}</span>
                {detail && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDetailOpen(true);
                    }}
                    className="shrink-0 rounded-md border border-gf-orange px-2 py-0.5 text-xs font-medium text-gf-orange hover:bg-gf-orange-bg"
                  >
                    상세보기
                  </button>
                )}
              </div>
            )}
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
