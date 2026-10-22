import Link from "next/link";
import { getMe } from "@/lib/api/me";
import { serverFetch } from "@/lib/serverFetch";
import { buttonVariants } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/mypage/EmptyStateCard";
import { MyProductsList } from "@/components/mypage/MyProductsList";
import { SellerProduct } from "@/types/product.types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MypageProductsPage() {
  const me = await getMe();
  const canSell = me?.profile?.role === "seller" || me?.profile?.role === "admin";

  if (!canSell) {
    return (
      <EmptyStateCard
        message="판매자로 등록된 계정만 상품을 등록할 수 있습니다."
        actionHref="/"
        actionLabel="쇼핑몰 보기"
      />
    );
  }

  const products = await serverFetch<SellerProduct[]>("/api/my-products");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">내 상품</h1>
        <Link href="/upload" className={cn(buttonVariants({ size: "sm" }))}>
          새 상품 등록
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyStateCard
          message="등록한 상품이 없습니다."
          actionHref="/upload"
          actionLabel="새 상품 등록하기"
        />
      ) : (
        <MyProductsList products={products} />
      )}
    </div>
  );
}
