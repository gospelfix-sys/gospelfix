import { getMe } from "@/lib/api/me";
import { serverFetch } from "@/lib/serverFetch";
import { PendingOrder, PurchasedOrder } from "@/types/order.types";
import { Coupon } from "@/types/coupon.types";
import { OrdersTabs } from "@/components/mypage/OrdersTabs";

export const dynamic = "force-dynamic";

export default async function MypageOrdersPage() {
  const me = await getMe();
  // orders/pendingOrders/coupons 모두 me.user 여부에만 의존하고 서로 무관하므로 병렬로 가져온다.
  const [allOrders, pendingOrders, coupons] = me?.user
    ? await Promise.all([
        serverFetch<PurchasedOrder[]>("/api/orders"),
        serverFetch<PendingOrder[]>("/api/orders/pending"),
        serverFetch<Coupon[]>("/api/coupons"),
      ])
    : ([[], [], []] as [PurchasedOrder[], PendingOrder[], Coupon[]]);
  // 상품이 삭제되어 product가 null인 주문은 다운로드도 불가능하므로 목록에서 숨긴다.
  const orders = allOrders.filter((order) => order.product !== null);
  const pendingOrdersWithProduct = pendingOrders.filter((order) => order.product !== null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">구매 / 혜택</h1>
      <OrdersTabs pendingOrders={pendingOrdersWithProduct} coupons={coupons} orders={orders} />
    </div>
  );
}
