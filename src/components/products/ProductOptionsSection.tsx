"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { OptionToggle } from "@/components/products/OptionToggle";
import { ProductInfoChips } from "@/components/products/ProductInfoChips";
import { usePurchaseOption } from "@/components/products/PurchaseOptionContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import { ProductPriceState } from "@/lib/discount";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/product.types";

interface ProductOptionsSectionProps {
  product: Product;
  priceState: ProductPriceState;
}

export function ProductOptionsSection({ product, priceState }: ProductOptionsSectionProps) {
  const { purchaseOptions, purchaseOptionId, setPurchaseOptionId } = usePurchaseOption();
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  if (product.price === 0) {
    return (
      <ProductInfoChips
        purchaseOptions={purchaseOptions}
        category={product.category}
        mode="free"
        hasAiStarterKit={product.has_ai_starter_kit}
      />
    );
  }

  const hasInquiryOption = purchaseOptions.some((option) => option.is_inquiry_only);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-black tracking-[-0.03em] text-gf-black">Options</h2>
        {hasInquiryOption && (
          <>
            <button
              type="button"
              onClick={() => setIsFaqOpen(true)}
              aria-label="구매항목 안내 보기"
              className="shrink-0 text-gf-orange"
            >
              <AlertCircle className="size-5" />
            </button>
            <p className="text-sm text-gf-gray2">
              * 별도의 커스터마이징 작업 진행 시, 작업 범위에 따라 가격이 책정됩니다.
            </p>
          </>
        )}
      </div>

      <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
        <DialogContent className="gap-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>단순복사, 커스터마이징이 무엇인가요?</DialogTitle>
          </DialogHeader>
          <div className="border-t border-gf-border" />

          <div className="flex flex-col gap-2">
            <p className="font-bold text-gf-black">단순복사란?</p>
            <p className="text-sm leading-relaxed text-gf-gray1">
              미리 제작된 디자인(레이아웃)을 구매하시면, 담당자가 결제 확인 후 옵션에 안내된
              작업기간 내에 회원님의 쇼핑몰 또는 홈페이지에 동일한 디자인으로 제작해 적용해 드리는
              옵션입니다. 별도의 디자인 수정 작업은 포함되지 않으므로, 이후 직접 수정이 가능하신
              분께 권장합니다. 제작 진행 상황은 마이페이지 주문 내역에서 확인하실 수 있습니다.
            </p>
            <div className="rounded-lg border border-gf-line bg-gf-orange-bg px-4 py-3 text-sm leading-relaxed text-gf-gray1">
              <span className="font-semibold text-gf-black">
                ⚠️ 콘텐츠(내용물)는 포함되지 않아요.
              </span>{" "}
              상세페이지에서 보시는 샘플 화면 속 상품·사진·문구는 디자인을 보여드리기 위한 예시일
              뿐입니다. 실제로 전달되는 템플릿은 내용이 비어 있는 상태이며, 상품 사진·설명 글 등은
              구매 후 회원님이 직접 채워 넣으셔야 합니다.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-bold text-gf-black">커스터마이징이란?</p>
            <p className="text-sm leading-relaxed text-gf-gray1">
              단순복사 디자인을 기반으로 컬러·레이아웃·폰트 등 디자인 요소와 일부 기능을 회원님의
              브랜드에 맞게 수정해 드리는 옵션입니다. 정확한 작업 범위와 비용은 구매 전 카카오 채널
              문의를 통해 안내드립니다.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-gf-gray2">
            * 제작(용역) 제공이 개시된 이후에는 전자상거래법 제17조 제2항 제5호에 따라 청약철회가
            제한될 수 있습니다. 자세한 내용은{" "}
            <LegalDialogTrigger
              type="terms"
              anchor="article-8"
              className="text-gf-orange underline underline-offset-2"
            >
              이용약관
            </LegalDialogTrigger>
            을 참고해 주세요.
          </p>
        </DialogContent>
      </Dialog>

      <div
        role="radiogroup"
        aria-label="구매항목"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {purchaseOptions.map((option) => (
          <OptionToggle
            key={option.id}
            label={option.label}
            priceLabel={
              option.is_inquiry_only
                ? "별도 문의"
                : formatPrice(option.price ?? priceState.effectivePrice)
            }
            description={option.description}
            workPeriodDays={option.work_period_days}
            detail={option.detail}
            isSelected={option.id === purchaseOptionId}
            onClick={() => setPurchaseOptionId(option.id)}
          />
        ))}
      </div>

      <ProductInfoChips
        purchaseOptions={purchaseOptions}
        category={product.category}
        mode="paid"
        hasAiStarterKit={product.has_ai_starter_kit}
      />
    </div>
  );
}
