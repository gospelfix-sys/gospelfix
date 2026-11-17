"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import type { SellerTransferAccount } from "@/types/payout.types";

interface OrderPayoutAccountState {
  account: SellerTransferAccount | null;
  loading: boolean;
  error: string | null;
}

// 입금 안내 모달이 열릴 때 본인 pending 주문의 판매자 입금 계좌를 조회한다.
// 번호는 상태에만 두고 저장소·로그에 남기지 않는다.
// orderId가 null이면(입금이 필요 없는 무료 묶음 등) 조회하지 않는다.
export function useOrderPayoutAccount(orderId: string | null): OrderPayoutAccountState {
  const [state, setState] = useState<OrderPayoutAccountState>({
    account: null,
    loading: orderId !== null,
    error: null,
  });

  useEffect(() => {
    if (orderId === null) {
      setState({ account: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ account: null, loading: true, error: null });
    axiosInstance
      .get<SellerTransferAccount>(`/orders/${orderId}/payout-account`)
      .then((res) => {
        if (!cancelled) setState({ account: res.data, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          account: null,
          loading: false,
          error: getErrorMessage(error, "입금 계좌를 불러오지 못했습니다."),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return state;
}
