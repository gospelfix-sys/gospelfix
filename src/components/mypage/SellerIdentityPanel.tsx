"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios/instance";
import type { SellerIdentity, SellerIdentityStatus } from "@/types/seller.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SellerIdentityForm } from "@/components/mypage/SellerIdentityForm";

interface SellerIdentityPanelProps {
  // user: 판매자 신청, seller: 신원정보 미제출 기존 판매자의 보완 제출
  role: "user" | "seller";
}

const STATUS_COPY: Record<SellerIdentityStatus, string> = {
  pending: "신청이 접수되었어요. 관리자 검토 후 승인돼요.",
  approved: "신원정보가 확인되어 구매자에게 표시되고 있어요.",
  rejected: "신청이 반려되었어요. 정보를 확인하고 다시 제출해주세요.",
};

// 마이페이지 권한 카드 안의 판매자 신원정보 영역. 제출 전·검토 중·승인·반려 상태를 보여주고 폼을 연다.
export function SellerIdentityPanel({ role }: SellerIdentityPanelProps) {
  const [identity, setIdentity] = useState<SellerIdentity | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get<{ data: SellerIdentity | null }>("/my-seller-identity");
      setIdentity(res.data.data);
    } catch {
      // 조회 실패 시에는 미제출 상태로 보여주고, 제출 시 서버가 다시 검증한다
      setIdentity(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSubmitted() {
    setOpen(false);
    void load();
  }

  if (!loaded) return null;

  const canSubmit = !identity || identity.status === "rejected";
  const submitLabel = role === "seller" ? "신원정보 제출" : "판매자 신청";

  return (
    <div className="space-y-2">
      {identity ? (
        <p className="text-sm text-muted-foreground">{STATUS_COPY[identity.status]}</p>
      ) : (
        role === "seller" && (
          <p className="text-sm text-muted-foreground">
            신원정보가 아직 없어요. 구매자에게 판매자 정보를 표시하려면 제출이 필요해요.
          </p>
        )
      )}
      {canSubmit && (
        <Button className="h-11 w-full" onClick={() => setOpen(true)}>
          {identity?.status === "rejected" ? "다시 제출" : submitLabel}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{submitLabel}</DialogTitle>
            <DialogDescription>
              판매자 신원을 확인하기 위한 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <SellerIdentityForm onSubmitted={handleSubmitted} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
