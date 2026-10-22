"use client";

import { useState } from "react";
import Image from "next/image";
import { Tab } from "@/components/ui/Tab";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadButton } from "@/components/products/DownloadButton";
import { EmptyStateCard } from "@/components/mypage/EmptyStateCard";
import { PendingOrderCard } from "@/components/mypage/PendingOrderCard";
import { CouponTicketCard } from "@/components/coupon/CouponTicketCard";
import { cn, formatPrice } from "@/lib/utils";
import type { PendingOrder, PurchasedOrder } from "@/types/order.types";
import type { Coupon } from "@/types/coupon.types";

type TabKey = "pending" | "coupons" | "purchased";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending", label: "결제 대기" },
  { key: "coupons", label: "보유 쿠폰" },
  { key: "purchased", label: "구매한 상품" },
];

interface OrdersTabsProps {
  pendingOrders: PendingOrder[];
  coupons: Coupon[];
  orders: PurchasedOrder[];
}

export function OrdersTabs({ pendingOrders, coupons, orders }: OrdersTabsProps) {
  const [tab, setTab] = useState<TabKey>("pending");

  const counts: Record<TabKey, number> = {
    pending: pendingOrders.length,
    coupons: coupons.length,
    purchased: orders.length,
  };

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-gf-border">
        {TABS.map((item) => (
          <Tab
            key={item.key}
            active={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              tab === item.key
                ? "border-gf-orange text-gf-orange"
                : "border-transparent text-gf-gray2 hover:text-gf-black",
            )}
          >
            {item.label} {counts[item.key]}
          </Tab>
        ))}
      </div>

      {tab === "pending" &&
        (pendingOrders.length === 0 ? (
          <EmptyStateCard message="결제 대기중인 주문이 없습니다." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingOrders.map((order) => (
              <PendingOrderCard key={order.order_id} order={order} />
            ))}
          </div>
        ))}

      {tab === "coupons" &&
        (coupons.length === 0 ? (
          <EmptyStateCard message="보유한 쿠폰이 없습니다." />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gf-gray2">
              쿠폰은 결제 1건당 1장만 사용할 수 있어요. 상품 구매 시 보유하신 쿠폰 중 할인율이
              가장 높은 쿠폰이 자동으로 적용됩니다.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {coupons.map((coupon) => (
                <CouponTicketCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        ))}

      {tab === "purchased" &&
        (orders.length === 0 ? (
          <EmptyStateCard
            message="구매한 상품이 없습니다."
            actionHref="/"
            actionLabel="쇼핑몰 보기"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card key={order.order_id} className="overflow-hidden pt-0">
                {order.product?.thumbnail_url && (
                  <div className="relative aspect-[1080/1350] w-full bg-muted">
                    <Image
                      src={order.product.thumbnail_url}
                      alt={order.product.name ?? "상품 썸네일"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base">
                    {order.product?.name ?? "상품명 없음"}
                  </CardTitle>
                  <CardDescription>
                    {order.amount === 0 ? "FREE" : formatPrice(order.amount)} ·{" "}
                    {order.paid_at ? new Date(order.paid_at).toLocaleDateString("ko-KR") : "-"}
                  </CardDescription>
                </CardHeader>
                {order.product && (
                  <CardFooter>
                    <DownloadButton
                      productId={order.product.id}
                      hasFile={!!order.product.file_path}
                    />
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ))}
    </div>
  );
}
