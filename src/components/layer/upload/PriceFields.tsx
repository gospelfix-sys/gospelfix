"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimeField } from "@/components/layer/upload/DateTimeField";
import { cn } from "@/lib/utils";

interface PriceFieldsProps {
  priceType: "free" | "paid";
  price: number;
  supplyPrice: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  onPriceTypeChange: (type: "free" | "paid") => void;
  onPriceChange: (price: number) => void;
  onSupplyPriceChange: (supplyPrice: number | null) => void;
  onDiscountStartsAtChange: (value: string | null) => void;
  onDiscountEndsAtChange: (value: string | null) => void;
}

// 판매 가격 / 공급원가 / 할인 기간
export function PriceFields({
  priceType,
  price,
  supplyPrice,
  discountStartsAt,
  discountEndsAt,
  onPriceTypeChange,
  onPriceChange,
  onSupplyPriceChange,
  onDiscountStartsAtChange,
  onDiscountEndsAtChange,
}: PriceFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gf-black">
          판매 가격{" "}
          <span className="font-normal text-gf-gray2">
            (할인 기간 내에만 적용, 종료 시 공급원가로 자동 복귀)
          </span>
        </h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={priceType === "free" ? "default" : "outline"}
            size="sm"
            className={cn("flex-1", priceType !== "free" && "bg-gf-white")}
            onClick={() => onPriceTypeChange("free")}
          >
            무료 (FREE)
          </Button>
          <Button
            type="button"
            variant={priceType === "paid" ? "default" : "outline"}
            size="sm"
            className={cn("flex-1", priceType !== "paid" && "bg-gf-white")}
            onClick={() => onPriceTypeChange("paid")}
          >
            유료
          </Button>
        </div>
        {priceType === "paid" && (
          <Input
            type="text"
            inputMode="numeric"
            value={price === 0 ? "" : price.toLocaleString("ko-KR")}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              onPriceChange(raw === "" ? 0 : parseInt(raw, 10));
            }}
            placeholder="판매 가격 (원)"
            className="h-10 rounded-xl bg-gf-white"
          />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gf-black">
          공급원가{" "}
          <span className="font-normal text-gf-gray2">(취소선 참고가, 미입력 시 숨김)</span>
        </h2>
        <Input
          type="text"
          inputMode="numeric"
          value={supplyPrice ? supplyPrice.toLocaleString("ko-KR") : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            onSupplyPriceChange(raw === "" ? null : parseInt(raw, 10));
          }}
          placeholder="예: 58,000"
          className="h-10 rounded-xl bg-gf-white"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gf-black">
          할인 기간 <span className="font-normal text-gf-gray2">(선택)</span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <DateTimeField
            value={discountStartsAt}
            onChange={onDiscountStartsAtChange}
            placeholder="시작일"
          />
          <DateTimeField
            value={discountEndsAt}
            onChange={onDiscountEndsAtChange}
            placeholder="종료일"
          />
        </div>
      </div>
    </>
  );
}
