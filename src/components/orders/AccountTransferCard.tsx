"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ACCOUNT_INFO } from "@/lib/paymentAccount";

export default function AccountTransferCard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopyAccount() {
    const digitsOnly = ACCOUNT_INFO.number.replace(/[^0-9]/g, "");
    try {
      await navigator.clipboard.writeText(digitsOnly);
      setCopied(true);
    } catch {
      toast.error("복사에 실패했습니다. 계좌번호를 직접 입력해주세요.");
    }
  }

  return (
    <>
      {/* QR 코드 */}
      <div className="mb-3 rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <div className="relative mx-auto h-40 w-40">
          <Image src="/qr-transfer.png" alt="계좌이체 QR 코드" fill className="object-contain" />
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
          <Camera className="h-3.5 w-3.5" />
          카메라로 스캔하세요
        </span>
      </div>

      {/* 송금 정보 */}
      <div className="mb-3 overflow-hidden rounded-xl border border-gray-100">
        <div className="bg-gf-orange py-2.5 text-center text-sm font-bold text-white">
          송금 정보
        </div>
        <div className="divide-y divide-gray-100 bg-white">
          <div className="flex items-center justify-between px-4 py-3 text-[13px]">
            <span className="text-gray-500">받는 은행</span>
            <span className="font-bold text-gf-orange">{ACCOUNT_INFO.bank}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-[13px]">
            <span className="text-gray-500">계좌번호</span>
            <span className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-900">{ACCOUNT_INFO.number}</span>
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
            <span className="font-bold text-gray-900">{ACCOUNT_INFO.holder}</span>
          </div>
        </div>
      </div>
    </>
  );
}
