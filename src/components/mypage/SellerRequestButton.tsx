"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { Button } from "@/components/ui/button";

interface SellerRequestButtonProps {
  sellerRequestedAt: string | null;
}

// 일반 사용자(role === "user")에게만 노출한다 — 호출부(RoleCard)에서 role로 분기.
// 신청은 신호(seller_requested_at)만 남기고, 실제 role 전환은 관리자가 수동으로 한다.
export function SellerRequestButton({ sellerRequestedAt }: SellerRequestButtonProps) {
  const [requested, setRequested] = useState(sellerRequestedAt !== null);
  const [requesting, setRequesting] = useState(false);

  async function handleSellerRequest() {
    setRequesting(true);
    try {
      await axiosInstance.post("/auth/seller-request");
      setRequested(true);
      toast.success("판매자 신청이 접수되었습니다. 검토 후 전환해드릴게요.");
    } catch (error) {
      toast.error(getErrorMessage(error, "판매자 신청에 실패했습니다."));
    } finally {
      setRequesting(false);
    }
  }

  if (requested) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        신청 완료 — 검토 중입니다.
      </div>
    );
  }

  return (
    <Button onClick={handleSellerRequest} disabled={requesting}>
      {requesting ? "신청 중..." : "판매자 신청"}
    </Button>
  );
}
