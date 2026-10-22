"use client";

import { MessageCircle } from "lucide-react";

const KAKAO_URL = "https://pf.kakao.com/_CqKlX/chat";

export function ScrollBadge() {
  return (
    <a
      href={KAKAO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-40 right-4 sm:bottom-24 sm:right-8 z-30 flex items-center gap-2 rounded-full border-2 border-gf-orange bg-white px-4 py-3 shadow-lg cursor-pointer transition hover:bg-orange-50 active:scale-95"
    >
      <MessageCircle
        width={18}
        height={18}
        strokeWidth={1.8}
        className="text-gf-orange shrink-0"
      />
      <span className="text-sm font-bold text-gf-orange whitespace-nowrap">카카오 문의하기</span>
    </a>
  );
}
