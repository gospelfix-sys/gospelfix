import { notFound } from "next/navigation";
import { Metadata } from "next";
import { serverFetch } from "@/lib/serverFetch";
import { getProductPriceState } from "@/lib/discount";
import { Coupon } from "@/types/coupon.types";
import { PurchasedOrder } from "@/types/order.types";
import { getBestAvailableCoupon } from "@/lib/coupon";
import { getProductBySlug } from "@/lib/api/products";
import { ProductDetailView } from "@/components/products/ProductDetailView";

export const dynamic = "force-dynamic";

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} | 모다`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
      type: "website",
    },
  };
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { slug } = await params;

  // 리뷰는 ProductDetailView 내부(ReviewSection/ReviewCountBadge)가 각자 Suspense로 감싸
  // 스트리밍하므로, 여기서는 페이지 응답을 블로킹하는 product/coupons/purchasedOrders만 기다린다.
  const [product, coupons, purchasedOrders] = await Promise.all([
    getProductBySlug(slug),
    // 비로그인 사용자는 /api/coupons·/api/orders가 빈 배열을 반환하므로 별도 로그인 분기 없이 그대로 호출한다.
    serverFetch<Coupon[]>("/api/coupons"),
    serverFetch<PurchasedOrder[]>("/api/orders"),
  ]);

  if (!product) notFound();

  const availableCoupon = getBestAvailableCoupon(coupons);
  // 이미 결제 완료한 상품은 쿠폰을 다시 적용해 재구매를 시도할 이유가 없으므로 쿠폰 UI를 숨긴다.
  const alreadyPurchased = purchasedOrders.some((order) => order.product?.id === product.id);

  const priceState = getProductPriceState(product);

  return (
    <div className="bg-gf-bg">
      <div className="max-w-[2400px] px-6 lg:px-[40px] pt-20 pb-10">
        <ProductDetailView
          product={product}
          priceState={priceState}
          availableCoupon={availableCoupon}
          alreadyPurchased={alreadyPurchased}
        />
      </div>
    </div>
  );
}
