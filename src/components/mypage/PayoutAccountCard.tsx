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

// 판매자 전용 "정산 계좌" 카드. 판매 대금은 개인 계좌로 받으므로 등록을 받되, 해킹·유출 사고에
// 대비해 생활비가 오가는 주 계좌가 아니라 정산 전용 서브 계좌를 쓰도록 안내를 가장 먼저 보여준다.
// 서버는 전체 번호를 돌려주지 않으므로 수정할 때 번호는 새로 입력해야 한다.
export function PayoutAccountCard({ account }: PayoutAccountCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(account === null);
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [accountHolder, setAccountHolder] = useState(account?.accountHolder ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmedSub, setConfirmedSub] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave =
    bankName !== "" &&
    accountHolder.trim().length >= 2 &&
    accountNumber.replace(/[\s-]/g, "").length >= 8 &&
    confirmedSub;

  async function handleSave() {
    setSaving(true);
    try {
      await axiosInstance.put("/my-payout-account", {
        bankName,
        accountHolder: accountHolder.trim(),
        accountNumber,
      });
      toast.success("정산 계좌가 저장되었습니다.");
      // 입력한 번호가 화면 상태에 남지 않도록 바로 비운다
      setAccountNumber("");
      setConfirmedSub(false);
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
        <CardDescription>정산 계좌</CardDescription>
        <CardTitle className="text-base">판매 대금을 받을 계좌</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="alert"
          className="flex gap-3 rounded-xl border-2 border-gf-orange bg-gf-orange-bg p-4"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gf-orange" aria-hidden />
          <div className="space-y-1.5 text-sm">
            <p className="text-base font-bold text-gf-orange">
              주로 쓰는 메인 계좌 말고, 서브 계좌를 입력해주세요
            </p>
            <p className="text-gf-black">
              급여·생활비가 오가는 <strong>메인 계좌</strong> 대신, 정산 전용으로 따로 쓰는{" "}
              <strong>서브 계좌</strong>를 등록해주세요.
            </p>
            <p className="text-muted-foreground">
              요즘 해커가 개인정보를 털어가는 사고가 잦아서, 혹시 모를 피해를 줄이려는 보안
              안내예요. 계좌번호는 암호화해서 저장하고, 등록 후에는 끝 4자리만 화면에 보여요.
            </p>
          </div>
        </div>

        {!editing && account ? (
          <div className="space-y-3">
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
                변경
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
                checked={confirmedSub}
                onCheckedChange={(checked) => setConfirmedSub(checked === true)}
                className="mt-0.5"
              />
              <span>메인 계좌가 아닌, 정산 전용 서브 계좌임을 확인했어요.</span>
            </label>
            <div className="flex justify-end gap-2">
              {account && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAccountNumber("");
                    setConfirmedSub(false);
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
