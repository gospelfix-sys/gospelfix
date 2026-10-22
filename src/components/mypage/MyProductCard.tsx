"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Image as ImageIcon } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SELLER_PRODUCT_STATUS_LABELS, type SellerProduct } from "@/types/product.types";

// 배지 배경/텍스트와 점(dot) 색상을 상태별로 한곳에서 관리한다 — 둘을 별도 맵으로
// 쪼개면 상태가 추가/변경될 때 한쪽만 고치고 잊어버리기 쉽다.
const STATUS_STYLES: Record<SellerProduct["status"], { badge: string; dot: string }> = {
  draft: { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  pending: { badge: "bg-gf-orange-bg text-gf-orange", dot: "bg-gf-orange" },
  approved: { badge: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-600" },
  rejected: { badge: "bg-[rgba(220,38,38,0.1)] text-destructive", dot: "bg-destructive" },
};

export function MyProductCard({ product }: { product: SellerProduct }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/my-products/${product.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "삭제에 실패했습니다.");
      toast.success("삭제했습니다.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  const thumbnail = product.images?.[0] ?? product.thumbnail_url;

  return (
    <Card>
      <CardContent className="flex gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                STATUS_STYLES[product.status].badge,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[product.status].dot)} />
              {SELLER_PRODUCT_STATUS_LABELS[product.status]}
            </span>
            <div className="flex shrink-0 gap-1.5">
              <Link
                href={`/upload?id=${product.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-gf-white")}
              >
                수정
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="bg-gf-white text-destructive hover:text-destructive"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>

          <p className="truncate text-base font-bold text-gf-black">{product.name}</p>
          <p className="text-sm text-gf-gray1">
            {product.price === 0 ? "FREE" : formatPrice(product.price)}
          </p>
          <p className="text-xs text-gf-gray2">
            등록일 {new Date(product.created_at).toLocaleDateString("ko-KR")} · 수정일{" "}
            {new Date(product.updated_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
