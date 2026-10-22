"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getLicenseLabel, LICENSE_OPTIONS } from "@/types/product.types";

interface ProductInfoTicketProps {
  children: React.ReactNode;
  productCode?: string | null;
  categoryLabel: string;
  productionSolution: string;
  designType?: string | null;
  license?: string | null;
}

export function ProductInfoTicket({
  children,
  productCode,
  categoryLabel,
  productionSolution,
  designType,
  license,
}: ProductInfoTicketProps) {
  const [licenseInfoOpen, setLicenseInfoOpen] = useState(false);
  const licenseLabel = getLicenseLabel(license);
  return (
    <div className="rounded-2xl border border-gf-border bg-gf-white">
      <div className="flex flex-col gap-6 px-5 py-5">
        {children}

        {/* 티켓 절취선: 카드 좌우 끝까지 확장해 노치가 카드 테두리에 걸리도록 함 */}
        <div className="relative -mx-5">
          <div className="border-t border-dashed border-gf-border" />
          <div className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gf-bg bg-gf-bg" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full border border-gf-bg bg-gf-bg" />
        </div>

        <div className="flex flex-col gap-3 text-sm">
          {productCode && (
            <div className="flex items-center justify-between">
              <p className="font-bold text-gf-black">제품코드</p>
              <p className="font-mono text-gf-gray1">{productCode}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="font-bold text-gf-black">카테고리</p>
            <p className="text-gf-gray1">{categoryLabel}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gf-black">제작솔루션</p>
            <p className="text-gf-gray1">{productionSolution}</p>
          </div>
          {designType && (
            <div className="flex items-center justify-between">
              <p className="font-bold text-gf-black">디자인구분</p>
              <p className="text-gf-gray1">{designType}</p>
            </div>
          )}
          {licenseLabel && (
            <div className="flex items-center justify-between">
              <p className="font-bold text-gf-black">저작권 및 라이선스</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLicenseInfoOpen(true)}
                className="h-auto gap-1 p-0 text-gf-gray1 hover:bg-transparent hover:text-gf-orange"
              >
                {licenseLabel}
                <Info className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={licenseInfoOpen} onOpenChange={setLicenseInfoOpen}>
        <DialogContent className="gap-5 p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">저작권 및 라이선스 안내</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {LICENSE_OPTIONS.map((option) => {
              const selected = option.value === license;
              return (
                <div
                  key={option.value}
                  className={cn(
                    "rounded-xl p-4",
                    selected ? "border-2 border-gf-orange" : "border border-gf-border",
                  )}
                >
                  <p className="font-bold text-gf-black">
                    {option.label}
                    {selected && (
                      <span className="ml-2 text-xs font-bold text-gf-orange">
                        이 상품에 적용된 라이선스
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gf-gray1">
                    {option.description}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
