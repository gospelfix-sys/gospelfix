"use client";

import { MessageCircle, ClipboardList } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import type { MockReservation, ReservationStatus } from "@/types/reservationDemo.types";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "대기",
  confirmed: "확정",
  changed: "변경",
  cancelled: "취소",
};

const STATUS_ORDER: ReservationStatus[] = ["pending", "confirmed", "changed", "cancelled"];

interface ReservationFeedPanelProps {
  reservations: MockReservation[];
  onStatusChange: (id: string, status: ReservationStatus) => void;
}

export function ReservationFeedPanel({ reservations, onStatusChange }: ReservationFeedPanelProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className={cn(
            "flex flex-col gap-3 rounded-2xl border border-gf-border bg-white p-4 animate-in fade-in slide-in-from-top-2 duration-300",
            reservation.status === "cancelled" && "opacity-50",
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                reservation.channel === "chatbot"
                  ? "bg-gf-orange-bg text-gf-orange"
                  : "border border-gf-border text-gf-gray2",
              )}
            >
              {reservation.channel === "chatbot" ? (
                <MessageCircle className="h-3 w-3" />
              ) : (
                <ClipboardList className="h-3 w-3" />
              )}
              {reservation.channel === "chatbot" ? "챗봇 문의" : "예약 폼"}
            </span>
            <span className="text-[11px] text-gf-gray2">{reservation.requestedAt}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold text-gf-black">
              {reservation.customerName} · {reservation.service}
            </p>
            <p className="text-xs text-gf-gray2">희망 일시 {reservation.desiredTime}</p>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="예약 상태 변경">
            {STATUS_ORDER.map((status) => {
              const active = reservation.status === status;
              return (
                <Chip
                  key={status}
                  active={active}
                  onClick={() => onStatusChange(reservation.id, status)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold",
                    active
                      ? "border-gf-orange bg-gf-orange text-white"
                      : "border-gf-border text-gf-gray2 hover:border-gf-orange hover:text-gf-orange",
                  )}
                >
                  {STATUS_LABEL[status]}
                </Chip>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
