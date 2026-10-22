"use client";

import { cn } from "@/lib/utils";

interface QuoteSelectCardProps {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function QuoteSelectCard({
  label,
  description,
  isSelected,
  onClick,
  className,
}: QuoteSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition-all",
        isSelected
          ? "border-[#ff5500] bg-[#fff5f0]"
          : "border-gray-200 bg-white hover:border-gray-300",
        className,
      )}
    >
      <p className={cn("font-semibold text-sm", isSelected ? "text-[#ff5500]" : "text-gray-800")}>
        {label}
      </p>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
    </button>
  );
}
