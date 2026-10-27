import { Suspense } from "react";
import { Product } from "@/types/product.types";
import { Coupon } from "@/types/coupon.types";
import { ProductPriceState } from "@/lib/discount";
import { isContentHtmlEmpty, sanitizeContentHtml } from "@/lib/sanitizeHtml";
import { PurchaseOptionsPanel } from "@/components/products/PurchaseOptionsPanel";
import { PurchaseOptionProvider } from "@/components/products/PurchaseOptionContext";
import { ProductOptionsSection } from "@/components/products/ProductOptionsSection";
import { CodePreviewSectionLazy } from "@/components/products/CodePreviewSectionLazy";
import { ProseHtml } from "@/components/ui/ProseHtml";
import { ProductVisitNav } from "@/components/products/ProductVisitNav";
import { ReviewSection } from "@/components/products/ReviewSection";
import { ReviewSectionSkeleton } from "@/components/products/ReviewSectionSkeleton";
import { ReviewCountBadge } from "@/components/products/ReviewCountBadge";
import { ReviewCountButton } from "@/components/products/ReviewCountButton";

interface ProductDetailViewProps {
  product: Product;
  priceState: ProductPriceState;
  availableCoupon: Coupon | null;
  alreadyPurchased: boolean;
}

/**
 * 상품 상세 콘텐츠(상세 콘텐츠 + 구매 옵션/상품 정보 + 리뷰). 전체 페이지
 * (detail/[slug]/page.tsx)와 인터셉팅 라우트 모달(@modal/(.)detail/[slug]/page.tsx)이
 * 동일하게 재사용한다 — 두 곳에 복제하면 레이아웃 수정 시 한쪽만 고치는 드리프트가
 * 생기므로, news의 NewsDetailContent와 같은 이유로 여기서 한 번만 정의한다.
 */
export function ProductDetailView({
  product,
  priceState,
  availableCoupon,
  alreadyPurchased,
}: ProductDetailViewProps) {
  const sanitizedContentHtml = product.content_html
    ? sanitizeContentHtml(product.content_html)
    : "";
  const hasContentHtml = !isContentHtmlEmpty(sanitizedContentHtml);
  const hasCodePreview = (product.code_preview ?? []).some(
    (item) => item.code.trim().length > 0,
  );

  return (
    <PurchaseOptionProvider product={product}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 pb-6">
        {/* 상세 콘텐츠(관리자 에디터 본문): 화면 전체 너비, 없으면 렌더링 안 됨 */}
        {hasContentHtml && (
          <ProseHtml html={sanitizedContentHtml} />
        )}

        {/* 구매 옵션(왼쪽) + 상품 정보(오른쪽) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* 상품 정보: 모바일 맨 위, 데스크톱 오른쪽 사이드바(스크롤 고정) */}
          <div id="product-info" className="lg:order-2 lg:sticky lg:top-10 lg:self-start">
            <PurchaseOptionsPanel
              product={product}
              reviewCountSlot={
                <Suspense fallback={<ReviewCountButton count={0} />}>
                  <ReviewCountBadge productId={product.id} />
                </Suspense>
              }
              priceState={priceState}
              availableCoupon={availableCoupon}
              alreadyPurchased={alreadyPurchased}
            />
          </div>

          {/* 구매 옵션: 모바일 상품 정보 아래, 데스크톱 왼쪽 */}
          <div className="flex flex-col gap-10 lg:order-1">
            <ProductOptionsSection product={product} priceState={priceState} />

            {/* 코드 미리보기 — 다운로드 전 코드 품질을 보여주는 신뢰 장치 */}
            {hasCodePreview && <CodePreviewSectionLazy product={product} />}
          </div>
        </div>

        {/* 고객 리뷰 */}
        <div>
          <Suspense fallback={<ReviewSectionSkeleton />}>
            <ReviewSection productId={product.id} />
          </Suspense>
        </div>

        {/* sticky라 이 콘텐츠 흐름이 끝나는 지점(푸터 시작 직전)에서 함께 스크롤되어
            사라진다 — fixed로 화면에 항상 띄우면 페이지 최하단 푸터와 겹치는 문제가 있었다. */}
        <ProductVisitNav demoUrl={product.demo_url} />
      </div>
    </PurchaseOptionProvider>
  );
}
