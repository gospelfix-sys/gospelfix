"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { LAUNCH_APPS, parseTransferHash } from "@gospelfix/qr";
import type { Transfer } from "@gospelfix/qr";
import { Button, buttonVariants } from "@/components/ui/button";

// QR 스캔으로 열리는 송금 안내. 계좌정보는 URL fragment(#)에만 있어 서버로 가지 않으므로
// 마운트 후 브라우저에서만 읽고, 어디에도 저장하지 않는다.
// @gospelfix/qr의 CSS는 :root의 shadcn 변수를 덮어써 앱 전체 색을 바꾸므로 쓰지 않고, 검증 로직만 쓴다.
export default function TransferGuide() {
  const [ready, setReady] = useState(false);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // parseTransferHash를 통과한 값만 화면과 딥링크에 쓴다
    setTransfer(parseTransferHash(window.location.hash));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy(accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber.replace(/[^0-9]/g, ""));
      setCopied(true);
    } catch {
      toast.error("복사에 실패했습니다. 계좌번호를 직접 입력해주세요.");
    }
  }

  if (!ready) return null;

  if (!transfer) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-gray-600">유효하지 않은 송금 링크예요. QR을 다시 스캔해주세요.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 py-6">
      <h1 className="text-base font-bold text-gf-black">송금 안내</h1>

      <dl className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white text-[13px]">
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-gray-500">받는 은행</dt>
          <dd className="font-bold text-gf-black">{transfer.bankName}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-gray-500">계좌번호</dt>
          <dd className="font-mono font-bold text-gf-black">{transfer.accountNumber}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-gray-500">예금주</dt>
          <dd className="font-bold text-gf-black">{transfer.accountHolder}</dd>
        </div>
      </dl>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-gf-black">자주 쓰는 앱</h2>
        <div className="grid grid-cols-4 gap-2">
          {LAUNCH_APPS.map((app) => {
            const href = app.buildUrl(transfer);
            return href ? (
              <a
                key={app.id}
                href={href}
                className={buttonVariants({ variant: "outline", className: "h-12 rounded-xl" })}
              >
                {app.name}
              </a>
            ) : null;
          })}
        </div>
      </section>

      <ol className="list-decimal space-y-1 pl-5 text-sm text-gf-black">
        <li>계좌번호 복사</li>
        <li>금융앱 열기</li>
        <li>붙여넣고 은행·계좌번호·예금주·금액 확인</li>
      </ol>

      <div className="space-y-1.5 text-xs leading-relaxed text-gray-500">
        <p>앱이 열리지 않으면 계좌번호를 복사해 사용 중인 금융앱에서 직접 송금해 주세요.</p>
        <p>
          금융앱 송금 화면을 여는 편의 기능이며 가스펄픽스는 해당 금융앱 회사와 제휴 관계가
          아니에요. 보내기 전 받는 은행·계좌번호·예금주·금액을 꼭 확인해주세요.
        </p>
      </div>

      <Button
        type="button"
        onClick={() => handleCopy(transfer.accountNumber)}
        className="h-12 w-full rounded-xl text-base font-bold"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "복사됨" : "계좌번호 복사"}
      </Button>
    </main>
  );
}
