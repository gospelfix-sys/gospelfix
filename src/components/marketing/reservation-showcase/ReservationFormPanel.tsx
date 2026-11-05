"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RESERVATION_SERVICES } from "@/lib/reservationDemo/mockData";

interface ReservationFormPanelSubmission {
  customerName: string;
  service: string;
  desiredTime: string;
}

interface ReservationFormPanelProps {
  onSubmit: (submission: ReservationFormPanelSubmission) => void;
}

export function ReservationFormPanel({ onSubmit }: ReservationFormPanelProps) {
  const [customerName, setCustomerName] = useState("");
  const [service, setService] = useState<string | null>(null);
  const [desiredTime, setDesiredTime] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => setSubmitted(false), 3000);
    return () => clearTimeout(timer);
  }, [submitted]);

  const canSubmit = customerName.trim() && service && desiredTime.trim();

  function handleSubmit() {
    if (!canSubmit || !service) return;
    onSubmit({ customerName: customerName.trim(), service, desiredTime: desiredTime.trim() });
    setCustomerName("");
    setService(null);
    setDesiredTime("");
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reservation-name" className="text-sm font-bold text-gf-black">
          성함
        </label>
        <Input
          id="reservation-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="홍길동"
          className="h-10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-gf-black">희망 서비스</span>
        <div className="flex flex-wrap gap-2">
          {RESERVATION_SERVICES.map((item) => (
            <Chip
              key={item}
              active={service === item}
              onClick={() => setService(item)}
              className={cn(
                "px-3 py-1.5 text-sm font-semibold",
                service === item
                  ? "border-gf-orange bg-gf-orange-bg text-gf-orange"
                  : "border-gf-border text-gf-gray2 hover:border-gf-orange hover:text-gf-orange",
              )}
            >
              {item}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reservation-time" className="text-sm font-bold text-gf-black">
          희망 일시
        </label>
        <Input
          id="reservation-time"
          value={desiredTime}
          onChange={(e) => setDesiredTime(e.target.value)}
          placeholder="8/19 (수) 오후 3시"
          className="h-10"
        />
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="h-10 rounded-full"
      >
        예약 문의 접수하기
      </Button>

      {submitted && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gf-orange">
          <CheckCircle2 className="h-4 w-4" />
          접수됐어요! 오른쪽 통합 현황에서 확인하세요 →
        </p>
      )}
    </div>
  );
}
