"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  paramKey: string;
  options: FilterOption[];
  placeholder: string;
}

export function FilterDropdown({ paramKey, options, placeholder }: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = searchParams.get(paramKey);
  const currentOption = options.find((option) => option.value === currentValue);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    // 빈 문자열은 "전체"(필터 해제)를 의미 — 파라미터 자체를 지워 기본(미선택) 상태로 되돌린다.
    if (value === "") {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    setOpen(false);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gf-border bg-gf-white px-4 py-2.5 text-sm font-semibold text-gf-black transition-colors hover:bg-gf-bg"
      >
        {currentOption?.label ?? placeholder}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[168px] rounded-2xl border border-gf-border bg-gf-white p-2 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === currentValue;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-gf-orange-bg text-gf-orange"
                    : "text-gf-gray2 hover:bg-gf-bg hover:text-gf-black",
                )}
              >
                {option.label}
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
