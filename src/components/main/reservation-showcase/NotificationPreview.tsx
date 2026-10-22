"use client";

import { useEffect } from "react";
import { MessageSquareText } from "lucide-react";

interface NotificationPreviewProps {
  customerName: string;
  text: string;
  onExpire: () => void;
}

export function NotificationPreview({ customerName, text, onExpire }: NotificationPreviewProps) {
  useEffect(() => {
    const timer = setTimeout(onExpire, 4000);
    return () => clearTimeout(timer);
  }, [onExpire]);

  return (
    <div
      role="status"
      className="absolute bottom-4 right-4 z-10 flex w-64 flex-col gap-1.5 rounded-2xl border border-gf-border bg-white p-4 shadow-lg [animation:notification-slide-in_0.35s_ease-out]"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-gf-orange">
        <MessageSquareText className="h-3.5 w-3.5" />
        문자 자동 발송 완료
      </div>
      <p className="text-sm leading-relaxed text-gf-black">
        [예약 확정] {customerName}님, {text}
      </p>
    </div>
  );
}
