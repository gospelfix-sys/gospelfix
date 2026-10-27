import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import { getProductPriceState } from "@/lib/discount";
import { Coupon } from "@/types/coupon.types";
import { PurchasedOrder } from "@/types/order.types";
import { getBestAvailableCoupon } from "@/lib/coupon";
import { getProductBySlug } from "@/lib/api/products";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import RouteModal from "@/components/ui/RouteModal";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailModal({ params }: Props) {
  const { slug } = await params;

  // 리뷰는 ProductDetailView 내부(ReviewSection/ReviewCountBadge)가 각자 Suspense로 감싸
  // 스트리밍하므로, 여기서는 페이지 응답을 블로킹하는 product/coupons/purchasedOrders만 기다린다.
  const [product, coupons, purchasedOrders] = await Promise.all([
    getProductBySlug(slug),
    serverFetch<Coupon[]>("/api/coupons"),
    serverFetch<PurchasedOrder[]>("/api/orders"),
  ]);

  if (!product) notFound();

  const availableCoupon = getBestAvailableCoupon(coupons);
  // 이미 결제 완료한 상품은 쿠폰을 다시 적용해 재구매를 시도할 이유가 없으므로 쿠폰 UI를 숨긴다.
  const alreadyPurchased = purchasedOrders.some((order) => order.product?.id === product.id);

  const priceState = getProductPriceState(product);

  return (
    <RouteModal ariaLabel={product.name}>
      <div className="mx-auto max-w-[2400px]">
        <ProductDetailView
          product={product}
          priceState={priceState}
          availableCoupon={availableCoupon}
          alreadyPurchased={alreadyPurchased}
        />
      </div>
    </RouteModal>
  );
}
