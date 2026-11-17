"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { PAYOUT_BANKS } from "@/lib/payoutBanks";
import type { PayoutAccount } from "@/types/payout.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  const [confirmedOwner, setConfirmedOwner] = useState(false);
  const [consented, setConsented] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave =
    bankName !== "" &&
    accountHolder.trim().length >= 2 &&
    accountNumber.replace(/[\s-]/g, "").length >= 8 &&
    confirmedOwner &&
    consented;

  async function handleSave() {
    setSaving(true);
    try {
      await axiosInstance.put("/my-payout-account", {
        bankName,
        accountHolder: accountHolder.trim(),
        accountNumber,
        thirdPartyConsent: consented,
      });
      toast.success("정산 계좌가 저장되었습니다.");
      // 입력한 번호가 화면 상태에 남지 않도록 바로 비운다
      setAccountNumber("");
      setConfirmedOwner(false);
      setConsented(false);
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
              계좌번호는 암호화해 저장하며, 이 화면에는 끝 4자리만 보여요. 구매자에게 한 번 안내된
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
            <dl className="grid gap-2 rounded-xl border border-border p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">은행</dt>
                <dd className="font-medium">{account.bankName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">계좌번호</dt>
                <dd className="font-medium">•••••••• {account.accountLast4}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">예금주</dt>
                <dd className="font-medium">{account.accountHolder}</dd>
              </div>
            </dl>
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
                <SelectTrigger id="payoutBank" className="w-full">
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
                inputMode="numeric"
                autoComplete="off"
                placeholder="숫자만 입력 (하이픈 없이)"
                maxLength={24}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              {account && (
                <p className="text-xs text-muted-foreground">
                  보안을 위해 기존 번호는 보여드리지 않아요. 변경하려면 번호를 다시 입력해주세요.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="payoutHolder" className="text-sm font-medium">
                예금주
              </label>
              <Input
                id="payoutHolder"
                autoComplete="off"
                maxLength={30}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
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
                [필수] 개인정보 제3자 제공 동의 — 제공받는 자: 내 상품을 주문한 구매자 / 목적: 주문
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
                    setConfirmedOwner(false);
                    setConsented(false);
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
