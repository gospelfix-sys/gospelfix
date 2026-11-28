"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios/instance";
import { buildTransferQr } from "@/lib/transferQr";
import type { SellerTransferAccount } from "@/types/payout.types";
import { QrCode } from "@/components/ui/QrCode";

interface PayoutAccountQrProps {
  // 계좌가 바뀌면(updatedAt 변경) QR도 다시 만든다
  updatedAt: string;
}

// 등록된 내 계좌의 송금 QR. 서버가 번호 평문을 주는 건 이 조회뿐이라, 받자마자 QR 행렬로만 바꾸고
// 번호 자체는 상태에 보관하지 않는다. 계좌 정보 옆에 나란히 놓이는 작은 크기다.
export function PayoutAccountQr({ updatedAt }: PayoutAccountQrProps) {
  const [matrix, setMatrix] = useState<boolean[][] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMatrix(null);
    setFailed(false);

    axiosInstance
      .get<SellerTransferAccount>("/my-payout-account/transfer")
      .then((res) => {
        if (cancelled) return;
        const next = buildTransferQr(window.location.origin, res.data);
        if (next) setMatrix(next);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [updatedAt]);

  if (failed) {
    return (
      <p className="w-28 text-xs text-muted-foreground">
        송금 QR을 불러오지 못했어요. 새로고침해주세요.
      </p>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-muted/60 p-3">
      {matrix ? (
        <QrCode matrix={matrix} className="h-20 w-20" />
      ) : (
        <div className="h-20 w-20 rounded-lg bg-muted" aria-hidden />
      )}
      <p className="text-[11px] font-medium text-muted-foreground">구매자용 송금 QR</p>
    </div>
  );
}
