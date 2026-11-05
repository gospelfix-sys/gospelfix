import Image from "next/image";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const BRAND_NAME = "GOSPELFIX";
const BRAND_TAGLINE = "빠르고 정확한 홈페이지 제작";

interface ChatBrandHeaderProps {
  className?: string;
}

// 대화창 상단 중앙에 브랜드 로고·이름·태그라인을 보여주는 블록 (카카오 채널형 채팅 UI)
export function ChatBrandHeader({ className }: ChatBrandHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 pb-2 pt-6 text-center", className)}>
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gf-border bg-gf-black">
        <Image
          src="/logo_gbk.webp"
          alt={`${BRAND_NAME} 로고`}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <DialogTitle className="text-lg font-extrabold text-gf-black">{BRAND_NAME}</DialogTitle>
      <p className="text-xs text-gf-gray2">{BRAND_TAGLINE}</p>
    </div>
  );
}
