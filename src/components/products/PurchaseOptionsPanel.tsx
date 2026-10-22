"use client";

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BuyButton } from "@/components/products/BuyButton";
import { DiscountCountdown } from "@/components/products/DiscountCountdown";
import { LikeButton } from "@/components/products/LikeButton";
import { ProductInfoTicket } from "@/components/products/ProductInfoTicket";
import { ShareButton } from "@/components/products/ShareButton";
import { usePurchaseOption } from "@/components/products/PurchaseOptionContext";
import { WithdrawalNoticeAgreement } from "@/components/widgets/WithdrawalNoticeAgreement";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ProductPriceState } from "@/lib/discount";
import { formatPrice } from "@/lib/utils";
import { isAuthenticatedSelector } from "@/store/selectors/authSelector";
import { getCategoryLabel, Product } from "@/types/product.types";
import { Coupon } from "@/types/coupon.types";

const KAKAO_URL = "https://pf.kakao.com/_CqKlX/chat";

// cms.api에서 아직 값을 내려주지 않는 상품을 위한 기본값
const DEFAULT_PRODUCTION_SOLUTION = "Supabase, Vercel";

interface PurchaseOptionsPanelProps {
  product: Product;
  // 리뷰 개수 배지 — 상위(ProductDetailView)가 Suspense로 감싼 서버 컴포넌트를 슬롯으로 전달한다.
  // 리뷰 조회를 여기서 직접 하지 않는 이유는 페이지 전체 TTFB를 블로킹하지 않기 위함이다.
  reviewCountSlot: React.ReactNode;
  // 요청 시점 기준 가격 상태 — 상위 page.tsx(서버 컴포넌트)에서 1회 계산해 전달한다.
  // 클라이언트 컴포넌트 안에서 직접 Date.now()로 재계산하면 서버 렌더 시각과 hydration 시각이
  // 어긋나 mismatch가 날 수 있어 이 방식을 쓴다.
  priceState: ProductPriceState;
  // 로그인 유저가 보유한 미사용·미만료 쿠폰 중 첫 번째(page.tsx에서 필터링해 전달) — 없으면 null.
  availableCoupon: Coupon | null;
  // 로그인 유저가 이 상품을 이미 결제 완료했는지 여부 — true면 재구매를 유도하는 쿠폰 UI를 숨긴다.
  alreadyPurchased: boolean;
}

// 주요 CTA 버튼(BuyButton 또는 문의 버튼) 옆에 LikeButton을 나란히 배치하는 공통 레이아웃.
// 무료/문의전용/일반 구매 3개 분기가 CTA만 다르고 이 구조는 동일하므로 여기서 한 번만 정의한다.
function PrimaryActionRow({ product, children }: { product: Product; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-1">{children}</div>
      <LikeButton
        productId={product.id}
        productSlug={product.slug}
        initialLikeCount={product.like_count ?? 0}
      />
    </div>
  );
}

export function PurchaseOptionsPanel({
  product,
  reviewCountSlot,
  priceState,
  availableCoupon,
  alreadyPurchased,
}: PurchaseOptionsPanelProps) {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const { openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { selectedOption } = usePurchaseOption();
  const [isWithdrawalNoticeAgreed, setIsWithdrawalNoticeAgreed] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  const isFree = product.price === 0;
  const isInquiryOnly = !isFree && selectedOption.is_inquiry_only;

  const basePrice = selectedOption.price ?? priceState.effectivePrice;
  const couponDiscountAmount =
    isCouponApplied && availableCoupon
      ? Math.floor((basePrice * availableCoupon.discount_rate) / 100)
      : 0;
  const finalPrice = basePrice - couponDiscountAmount;
  const productionSolution = product.production_solution || DEFAULT_PRODUCTION_SOLUTION;
  const categoryLabel = getCategoryLabel(product.category);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      openAuthModal("login", `/detail/${product.slug}`);
      return;
    }
    try {
      await addToCart({
        productId: product.id,
        optionId: selectedOption.id,
        optionLabel: selectedOption.label,
        price: basePrice,
      });
    } catch {
      toast.error("장바구니 담기에 실패했습니다. 다시 시도해주세요.");
    }
  }

  function handleInquiryClick() {
    if (!isAuthenticated) {
      openAuthModal("login", `/detail/${product.slug}`);
      return;
    }
    window.open(KAKAO_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-6">
      <ProductInfoTicket
        productCode={product.product_code}
        categoryLabel={categoryLabel}
        productionSolution={productionSolution}
        designType={product.design_type}
        license={product.license}
      >
        <div>
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-gf-orange-bg text-gf-orange">
              {categoryLabel}
            </span>
            <div className="flex items-center gap-1">
              {reviewCountSlot}
              <ShareButton productName={product.name} />
            </div>
          </div>
          <h1 className="text-2xl font-black leading-snug tracking-[-0.03em] text-gf-black">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-2.5 text-sm leading-relaxed text-gf-gray1">{product.description}</p>
          )}
        </div>

        <div>
          {!isFree && !isInquiryOnly && priceState.strikethroughPrice != null && (
            <p className="mb-1.5 text-sm tracking-[-0.01em] text-gf-gray2 line-through">
              {priceState.discount ? "" : "공급원가 "}
              {formatPrice(priceState.strikethroughPrice)}
            </p>
          )}
          <div className="flex items-baseline gap-1.5 font-en text-gf-orange">
            {isFree ? (
              <span className="font-black text-4xl tracking-[-0.04em]">FREE</span>
            ) : isInquiryOnly ? (
              <span className="font-black text-4xl tracking-[-0.04em]">별도 문의</span>
            ) : (
              <>
                <span className="font-black text-4xl tracking-[-0.04em]">
                  {finalPrice.toLocaleString("ko-KR")}
                </span>
                <span className="text-lg font-bold text-gf-black">원</span>
                {priceState.discount && priceState.discount.percent > 0 && (
                  <span className="text-sm font-bold text-gf-orange">
                    {priceState.discount.percent}%
                  </span>
                )}
              </>
            )}
          </div>
          {!isFree && !isInquiryOnly && priceState.discount && (
            <DiscountCountdown endsAt={priceState.discount.endsAt} />
          )}
        </div>
      </ProductInfoTicket>

      <div className="flex flex-col gap-3">
        {isFree ? (
          <PrimaryActionRow product={product}>
            <BuyButton
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              price={0}
              agreedToWithdrawalNotice
            />
          </PrimaryActionRow>
        ) : (
          <>
            <WithdrawalNoticeAgreement
              checked={isWithdrawalNoticeAgreed}
              onCheckedChange={setIsWithdrawalNoticeAgreed}
            />

            {!isInquiryOnly && availableCoupon && !alreadyPurchased && (
              <label className="flex items-center gap-2 rounded-xl border border-gf-orange bg-gf-orange-bg p-3 text-sm text-gf-black">
                <Checkbox checked={isCouponApplied} onCheckedChange={setIsCouponApplied} />
                <span className="font-semibold">
                  {availableCoupon.discount_rate}% 할인 쿠폰 적용
                </span>
                {isCouponApplied && (
                  <span className="ml-auto font-bold text-gf-orange">
                    -{formatPrice(couponDiscountAmount)}
                  </span>
                )}
              </label>
            )}

            {isInquiryOnly ? (
              <PrimaryActionRow product={product}>
                <Button
                  type="button"
                  size="lg"
                  disabled={!isWithdrawalNoticeAgreed}
                  className="h-14 w-full rounded-2xl text-base font-bold"
                  onClick={handleInquiryClick}
                >
                  카카오 채널로 문의하기
                </Button>
              </PrimaryActionRow>
            ) : (
              <PrimaryActionRow product={product}>
                <BuyButton
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                  price={finalPrice}
                  couponCode={isCouponApplied ? availableCoupon?.code : undefined}
                  agreedToWithdrawalNotice={isWithdrawalNoticeAgreed}
                />
              </PrimaryActionRow>
            )}
          </>
        )}

        {/* 장바구니 담기: 커스터마이징(문의전용) 옵션은 제외, FREE/일반 구매에서만 노출 */}
        {!isInquiryOnly && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-14 w-full rounded-2xl border-2 border-gf-orange text-base font-bold text-gf-orange bg-gf-white"
            onClick={handleAddToCart}
          >
            장바구니 담기
          </Button>
        )}
      </div>
    </div>
  );
}
