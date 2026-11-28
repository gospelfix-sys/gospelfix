"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { PAYOUT_BANKS } from "@/lib/payoutBanks";
import { buildTransferQr } from "@/lib/transferQr";
import type { PayoutAccount } from "@/types/payout.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { QrCode } from "@/components/ui/QrCode";
import { PayoutAccountQr } from "@/components/mypage/PayoutAccountQr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PayoutAccountCardProps {
  account: PayoutAccount | null;
}

// 판매자 전용 "입금 계좌" 카드. 구매자는 이 계좌로 판매자에게 직접 입금하며, 입금 안내 화면에서
// 은행·계좌번호 전체·예금주가 구매자에게 보인다. 그래서 제3자 제공 동의를 필수로 받고, 구매자에게
// 알려져도 괜찮은 판매 전용 계좌를 쓰도록 안내를 가장 먼저 보여준다.
// 서버는 이 화면에 전체 번호를 돌려주지 않으므로 수정할 때 번호는 새로 입력해야 한다.
export function PayoutAccountCard({ account }: PayoutAccountCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(account === null);
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [accountHolder, setAccountHolder] = useState(account?.accountHolder ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumberConfirm, setAccountNumberConfirm] = useState("");
  const [confirmedOwner, setConfirmedOwner] = useState(false);
  const [consented, setConsented] = useState(false);
  // 확인한 QR의 입력값 키. 은행·번호·예금주 중 하나라도 바뀌면 키가 달라져 확인이 자동으로 풀린다
  const [confirmedQrKey, setConfirmedQrKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cleanNumber = accountNumber.replace(/[\s-]/g, "");
  const cleanConfirm = accountNumberConfirm.replace(/[\s-]/g, "");
  const holderValid = accountHolder.trim().length >= 2;
  // 서버(cms.api)와 같은 기준. 은행별 자릿수는 은행이 바꾸면 정상 계좌를 막으므로 두지 않는다
  const numberValid = /^\d{8,20}$/.test(cleanNumber);
  const numberMatches = cleanConfirm !== "" && cleanConfirm === cleanNumber;

  // 구매자에게 보일 QR과 같은 값으로 만든다. 번호를 두 번 같게 입력했을 때만 만들어 오타가 QR로 굳지 않게 한다.
  const qrMatrix = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (bankName === "" || !holderValid || !numberValid || !numberMatches) return null;
    return buildTransferQr(window.location.origin, {
      bankName,
      accountNumber: cleanNumber,
      accountHolder: accountHolder.trim(),
    });
  }, [bankName, holderValid, numberValid, numberMatches, cleanNumber, accountHolder]);

  // 입력이 바뀌면 이전에 확인한 QR은 더 이상 유효하지 않다. 현재 QR의 키와 같을 때만 확인으로 인정한다
  const qrKey = qrMatrix ? `${bankName}|${cleanNumber}|${accountHolder.trim()}` : null;
  const qrConfirmed = qrKey !== null && confirmedQrKey === qrKey;

  const canSave =
    bankName !== "" &&
    holderValid &&
    numberValid &&
    numberMatches &&
    qrMatrix !== null &&
    qrConfirmed &&
    confirmedOwner &&
    consented;

  async function handleSave() {
    setSaving(true);
    try {
      await axiosInstance.put("/my-payout-account", {
        bankName,
        accountHolder: accountHolder.trim(),
        accountNumber: cleanNumber,
        thirdPartyConsent: consented,
      });
      toast.success("정산 계좌가 저장되었습니다.");
      // 입력한 번호가 화면 상태에 남지 않도록 바로 비운다
      setAccountNumber("");
      setAccountNumberConfirm("");
      setConfirmedOwner(false);
      setConsented(false);
      setConfirmedQrKey(null);
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "정산 계좌 저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await axiosInstance.delete("/my-payout-account");
      toast.success("정산 계좌를 삭제했습니다.");
      setBankName("");
      setAccountHolder("");
      setEditing(true);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "정산 계좌 삭제에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>입금 계좌</CardDescription>
        <CardTitle className="text-base">구매자가 입금할 계좌</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="alert"
          className="flex gap-3 rounded-xl border-2 border-gf-orange bg-gf-orange-bg p-4"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gf-orange" aria-hidden />
          <div className="space-y-1.5 text-sm">
            <p className="text-base font-bold text-gf-orange">
              이 계좌는 내 상품을 주문한 구매자에게 그대로 보여요
            </p>
            <p className="text-gf-black">
              주문한 구매자에게는 입금 안내 화면에서 은행, <strong>계좌번호 전체</strong>, 예금주가
              표시됩니다. 상품 페이지나 목록에는 보이지 않아요.
            </p>
            <p className="text-gf-black">
              구매자에게 알려도 괜찮은 <strong>판매 전용 계좌</strong>를 등록해주세요. 예금주는
              판매자 본인(사업자는 사업자 명의)이어야 합니다.
            </p>
            <p className="text-muted-foreground">
              계좌번호는 암호화해 저장하며, 화면에는 끝 4자리만 표시해요. 단, 송금 QR에는 계좌번호
              전체가 담겨 있어요. 구매자에게 한 번 안내된
              계좌번호는 계좌를 바꾸거나 삭제해도 되돌릴 수 없어요.
            </p>
          </div>
        </div>

        {!editing && account ? (
          <div className="space-y-3">
            {!account.consented && (
              <p role="alert" className="rounded-lg bg-gf-orange-bg p-3 text-sm text-gf-orange">
                구매자에게 계좌를 보여주는 것에 아직 동의하지 않았어요. 동의하고 다시 저장하기
                전까지는 내 상품의 새 주문을 받을 수 없어요.
              </p>
            )}
            {/* QR은 계좌 정보 박스 밖 왼쪽에 둔다(좁은 화면에서는 위로 쌓는다) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <PayoutAccountQr updatedAt={account.updatedAt} />
              <dl className="min-w-0 flex-1 divide-y divide-border rounded-xl border border-border p-4 text-sm">
                <div className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <dt className="text-xs text-muted-foreground">은행</dt>
                  <dd className="font-medium">{account.bankName}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-xs text-muted-foreground">계좌번호</dt>
                  <dd
                    className="flex items-center gap-2 font-medium"
                    aria-label={`끝 4자리 ${account.accountLast4}`}
                  >
                    {/* 글자 "•"는 폰트마다 세로 위치가 숫자와 어긋나서 원을 직접 그려 가운데를 맞춘다 */}
                    <span className="flex items-center gap-0.5" aria-hidden>
                      {Array.from({ length: 8 }, (_, i) => (
                        <span key={i} className="h-1 w-1 rounded-full bg-foreground" />
                      ))}
                    </span>
                    <span>{account.accountLast4}</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 last:pb-0">
                  <dt className="text-xs text-muted-foreground">예금주</dt>
                  <dd className="font-medium">{account.accountHolder}</dd>
                </div>
              </dl>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                삭제
              </Button>
              <Button type="button" size="sm" onClick={() => setEditing(true)} disabled={saving}>
                {account.consented ? "변경" : "동의하고 다시 저장"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="payoutBank" className="text-sm font-medium">
                은행
              </label>
              <Select value={bankName} onValueChange={(value) => setBankName(value ?? "")}>
                <SelectTrigger id="payoutBank" className="w-full data-[size=default]:h-11">
                  <SelectValue placeholder="은행을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="payoutNumber" className="text-sm font-medium">
                계좌번호
              </label>
              <Input
                id="payoutNumber"
                className="h-11"
                inputMode="numeric"
                autoComplete="off"
                placeholder="숫자만 입력 (하이픈 없이)"
                maxLength={24}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                aria-invalid={accountNumber !== "" && !numberValid}
              />
              {accountNumber !== "" && !numberValid && (
                <p role="alert" className="text-xs text-destructive">
                  계좌번호는 숫자 8~20자리로 입력해주세요. (공백·하이픈은 자동으로 제거돼요)
                </p>
              )}
              {account && (
                <p className="text-xs text-muted-foreground">
                  보안을 위해 기존 번호는 보여드리지 않아요. 변경하려면 번호를 다시 입력해주세요.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="payoutNumberConfirm" className="text-sm font-medium">
                계좌번호 확인
              </label>
              <Input
                id="payoutNumberConfirm"
                className="h-11"
                inputMode="numeric"
                autoComplete="off"
                placeholder="계좌번호를 한 번 더 입력해주세요"
                maxLength={24}
                value={accountNumberConfirm}
                onChange={(e) => setAccountNumberConfirm(e.target.value)}
                aria-invalid={accountNumberConfirm !== "" && !numberMatches}
              />
              {accountNumberConfirm !== "" && !numberMatches && (
                <p role="alert" className="text-xs text-destructive">
                  위에 입력한 계좌번호와 달라요.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="payoutHolder" className="text-sm font-medium">
                예금주
              </label>
              <Input
                id="payoutHolder"
                className="h-11"
                autoComplete="off"
                maxLength={30}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-border p-4">
              <p className="text-sm font-medium">송금 QR 확인 (필수)</p>
              {qrMatrix ? (
                <div className="flex flex-col items-center gap-2">
                  <QrCode matrix={qrMatrix} className="border border-border" />
                  {/* QR은 사람이 읽을 수 없으니, QR에 담긴 값을 글자로 함께 보여줘 번호까지 눈으로 확인하게 한다 */}
                  <dl className="w-full divide-y divide-border rounded-lg bg-muted/60 px-3 text-sm">
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-xs text-muted-foreground">은행</dt>
                      <dd className="font-medium">{bankName}</dd>
                    </div>
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-xs text-muted-foreground">계좌번호</dt>
                      <dd className="font-medium tabular-nums">{cleanNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-xs text-muted-foreground">예금주</dt>
                      <dd className="font-medium">{accountHolder.trim()}</dd>
                    </div>
                  </dl>
                  <p className="text-center text-xs text-muted-foreground">
                    구매자에게는 이 QR이 입금 안내 화면에 함께 보여요. QR에는 계좌번호 전체가 담겨
                    있으니 다른 곳에 공유하지 마세요.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  은행, 계좌번호(두 번 같게), 예금주를 모두 입력하면 송금 QR이 만들어져요.
                </p>
              )}
              <label className="flex items-start gap-2.5 text-sm">
                <Checkbox
                  checked={qrConfirmed}
                  disabled={qrMatrix === null}
                  onCheckedChange={(checked) => setConfirmedQrKey(checked === true ? qrKey : null)}
                  className="mt-0.5"
                />
                <span>위 은행·계좌번호·예금주가 내 계좌와 정확히 같은지 확인했어요.</span>
              </label>
            </div>
            <label className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={confirmedOwner}
                onCheckedChange={(checked) => setConfirmedOwner(checked === true)}
                className="mt-0.5"
              />
              <span>예금주가 판매자 본인(사업자는 사업자 명의)임을 확인했어요.</span>
            </label>
            <label className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={consented}
                onCheckedChange={(checked) => setConsented(checked === true)}
                className="mt-0.5"
              />
              <span>
                [필수] 개인정보 제3자 제공 동의 제공받는 자: 내 상품을 주문한 구매자 / 목적: 주문
                대금 입금 / 항목: 은행명, 계좌번호, 예금주 / 기간: 해당 주문의 입금 대기 기간 동안
                화면에 표시하며, 구매자가 따로 기록한 정보는 회사가 회수할 수 없습니다. 동의하지
                않을 수 있으나, 동의하지 않으면 계좌이체 판매를 할 수 없습니다.
              </span>
            </label>
            <div className="flex justify-end gap-2">
              {account && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAccountNumber("");
                    setAccountNumberConfirm("");
                    setConfirmedOwner(false);
                    setConsented(false);
                    setConfirmedQrKey(null);
                    setEditing(false);
                  }}
                  disabled={saving}
                >
                  취소
                </Button>
              )}
              <Button type="button" size="sm" onClick={handleSave} disabled={saving || !canSave}>
                {saving ? "저장 중..." : "계좌 저장"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
