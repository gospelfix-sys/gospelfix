"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SellerTransferAccount } from "@/types/payout.types";

interface AccountTransferCardProps {
  account: SellerTransferAccount;
}

// 구매자에게 보여주는 판매자 입금 정보. 회사 계좌가 아니라 상품 판매자의 계좌다.
export default function AccountTransferCard({ account }: AccountTransferCardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopyAccount() {
    const digitsOnly = account.accountNumber.replace(/[^0-9]/g, "");
    try {
      await navigator.clipboard.writeText(digitsOnly);
      setCopied(true);
    } catch {
      toast.error("복사에 실패했습니다. 계좌번호를 직접 입력해주세요.");
    }
  }

  return (
    <>
      <div className="mb-3 overflow-hidden rounded-xl border border-gray-200">
        <div className="bg-gf-orange py-2.5 text-center text-sm font-bold text-white">
          판매자 입금 정보
        </div>
        <div className="divide-y divide-gray-200 bg-gray-50">
          <div className="flex items-center justify-between px-4 py-3 text-[13px]">
            <span className="text-gray-500">받는 은행</span>
            <span className="font-bold text-gf-orange">{account.bankName}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-[13px]">
            <span className="text-gray-500">계좌번호</span>
            <span className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-900">{account.accountNumber}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCopyAccount}
                className="h-auto gap-1 rounded-full bg-gf-orange-bg px-2.5 py-1 text-xs font-semibold text-gf-orange hover:bg-gf-orange-bg hover:text-gf-orange"
                aria-label="계좌번호 복사"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "복사됨" : "복사"}
              </Button>
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-[13px]">
            <span className="text-gray-500">예금주</span>
            <span className="font-bold text-gray-900">{account.accountHolder}</span>
          </div>
        </div>
      </div>

      <ul className="mb-4 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-gray-500">
        <li>이 계좌는 판매자가 등록한 계좌이며, 가스펄픽스 회사 계좌가 아닙니다.</li>
        <li>입금자명에 주문번호를 함께 적어주세요.</li>
        <li>이 계좌 정보는 이 주문의 입금에만 쓰고, 다른 사람에게 알리지 마세요.</li>
        <li>가스펄픽스를 거치지 않은 거래는 주문 내역에 남지 않아 확인과 환불 안내가 어려워요.</li>
      </ul>
    </>
  );
}
