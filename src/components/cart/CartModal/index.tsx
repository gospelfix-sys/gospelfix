"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { BatchPaymentModal } from "@/components/cart/BatchPaymentModal";
import { WithdrawalNoticeAgreement } from "@/components/widgets/WithdrawalNoticeAgreement";
import { useCart } from "@/hooks/useCart";
import axiosInstance, { isAxiosError } from "@/lib/axios/instance";
import { formatPrice } from "@/lib/utils";

interface BatchOrderState {
  orderIds: string[];
  amount: number;
  itemCount: number;
}

export default function CartModal() {
  const { items, isOpen, closeCart, removeFromCart, removeMultiple } = useCart();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [agreedToWithdrawalNotice, setAgreedToWithdrawalNotice] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [batchOrder, setBatchOrder] = useState<BatchOrderState | null>(null);

  // 장바구니가 열리거나 항목이 변경될 때마다 전체선택 상태로 초기화한다
  useEffect(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((item) => item.id)));
  }

  function toggleOne(cartItemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartItemId)) {
        next.delete(cartItemId);
      } else {
        next.add(cartItemId);
      }
      return next;
    });
  }

  async function handleRemove(cartItemId: string) {
    try {
      await removeFromCart(cartItemId);
    } catch {
      toast.error("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  }

  async function handleRemoveSelected() {
    try {
      await removeMultiple(Array.from(selectedIds));
    } catch {
      toast.error("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  }

  async function handleCheckout() {
    if (selectedIds.size === 0 || !agreedToWithdrawalNotice) return;
    setIsCheckingOut(true);
    try {
      const orderItems = selectedItems.map((item) => ({
        productId: item.productId,
        amount: item.price,
      }));
      const { data } = await axiosInstance.post<{ orderIds: string[] }>("/orders/create-batch", {
        items: orderItems,
        agreedToWithdrawalNotice,
      });
      setBatchOrder({
        orderIds: data.orderIds,
        amount: selectedTotal,
        itemCount: selectedItems.length,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { error?: string } | undefined;
        toast.error(data?.error ?? "결제 준비에 실패했습니다.");
      } else {
        toast.error("결제 준비에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function handleConfirmed() {
    const checkedOutIds = selectedItems.map((item) => item.id);
    if (checkedOutIds.length === 0) return;
    try {
      await removeMultiple(checkedOutIds);
    } catch {
      // 입금 알림 접수는 이미 완료됐으므로 장바구니 정리 실패는 조용히 무시한다
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <DialogContent className="gap-4 p-6 sm:max-w-md">
          <DialogTitle>장바구니</DialogTitle>

          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gf-gray2">장바구니가 비어 있습니다.</p>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-gf-border pb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gf-black">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  전체선택 {selectedIds.size} / {items.length}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={selectedIds.size === 0}
                  onClick={handleRemoveSelected}
                  className="text-gf-gray2 hover:text-gf-black"
                >
                  선택삭제
                </Button>
              </div>

              <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                      className="shrink-0"
                    />
                    <Link
                      href={`/detail/${item.productSlug}`}
                      onClick={closeCart}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gf-bg"
                    >
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-gf-gray2">
                          No Image
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gf-black">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gf-gray2">{item.optionLabel}</p>
                      <p className="text-sm font-bold text-gf-orange">{formatPrice(item.price)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="장바구니에서 삭제"
                      onClick={() => handleRemove(item.id)}
                      className="shrink-0 text-gf-gray2 hover:text-gf-black"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gf-border pt-3">
                <p className="mb-2 text-sm font-semibold text-gf-black">결제수단</p>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gf-orange bg-gf-orange-bg px-4 py-3">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-gf-orange bg-gf-orange">
                    <div className="size-1.5 rounded-full bg-gf-white" />
                  </div>
                  <span className="text-sm font-semibold text-gf-black">계좌이체(무통장입금)</span>
                </div>
              </div>

              <WithdrawalNoticeAgreement
                checked={agreedToWithdrawalNotice}
                onCheckedChange={setAgreedToWithdrawalNotice}
              />
            </>
          )}

          {items.length > 0 && (
            <DialogFooter className="flex-col gap-3 sm:flex-col">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm text-gf-gray2">선택 금액</span>
                <span className="text-sm font-bold text-gf-black">
                  {formatPrice(selectedTotal)}
                </span>
              </div>
              <Button
                type="button"
                size="lg"
                disabled={selectedIds.size === 0 || !agreedToWithdrawalNotice || isCheckingOut}
                onClick={handleCheckout}
                className="h-14 w-full rounded-2xl text-base font-bold"
              >
                {isCheckingOut ? "처리 중..." : `${formatPrice(selectedTotal)} 결제하기`}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {batchOrder && (
        <BatchPaymentModal
          orderIds={batchOrder.orderIds}
          itemCount={batchOrder.itemCount}
          amount={batchOrder.amount}
          onConfirmed={handleConfirmed}
          onClose={() => setBatchOrder(null)}
        />
      )}
    </>
  );
}
