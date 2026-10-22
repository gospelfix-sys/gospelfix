import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  productId: string;
  hasFile: boolean;
}

// /api/downloads/[productId]가 클릭 시점마다 새 signed URL을 발급해 리다이렉트하므로
// 별도 클라이언트 컴포넌트/fetch 없이 단순 링크로 구현한다(서버 컴포넌트에서 그대로 렌더 가능).
export function DownloadButton({ productId, hasFile }: DownloadButtonProps) {
  if (!hasFile) {
    return (
      <p className="text-xs text-gf-gray2">다운로드 파일 준비 중입니다.</p>
    );
  }

  return (
    <Link
      href={`/api/downloads/${productId}`}
      prefetch={false}
      className={cn(
        buttonVariants({ size: "lg" }),
        "w-full gap-1.5 rounded-2xl bg-gf-black text-sm font-bold text-gf-orange",
      )}
    >
      <Download className="size-4" />
      다운로드
    </Link>
  );
}
