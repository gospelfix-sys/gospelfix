import { Suspense } from "react";
import type { Product, ProductSellerInfo } from "@/types/product.types";
import { getProductSeller } from "@/lib/api/productSeller";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProductDetailHeaderProps {
  product: Product;
}

interface ProductHeaderContentProps {
  name: string;
  registeredAt: string;
  seller: ProductSellerInfo["seller"];
}

function ProductHeaderContent({ name, registeredAt, seller }: ProductHeaderContentProps) {
  return (
    <header className="flex flex-col gap-3">
      {/* 구매 패널이 이미 h1로 상품명을 갖고 있어 문서에 h1이 둘이 되지 않도록 h2를 쓴다. */}
      <h2 className="text-2xl font-black leading-tight tracking-[-0.03em] text-gf-black md:text-3xl">
        {name}
      </h2>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gf-gray2">
        {seller && (
          <div className="flex items-center gap-2">
            <Avatar>
              {seller.avatar_url && <AvatarImage src={seller.avatar_url} alt={seller.name} />}
              <AvatarFallback>{seller.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-gf-black">{seller.name}</span>
            {seller.handle && <span>@{seller.handle}</span>}
          </div>
        )}
        <time dateTime={registeredAt}>{formatDate(registeredAt)} 등록</time>
      </div>
    </header>
  );
}

async function ProductSellerHeader({ product }: ProductDetailHeaderProps) {
  const info = await getProductSeller(product.id);
  return (
    <ProductHeaderContent
      name={product.name}
      registeredAt={info?.registered_at ?? product.created_at}
      seller={info?.seller ?? null}
    />
  );
}

// 판매자 조회가 느리거나 실패해도 제목·등록일은 바로 보이게, 판매자 정보만 Suspense로 늦게 채운다.
export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  return (
    <Suspense
      fallback={
        <ProductHeaderContent
          name={product.name}
          registeredAt={product.created_at}
          seller={null}
        />
      }
    >
      <ProductSellerHeader product={product} />
    </Suspense>
  );
}
