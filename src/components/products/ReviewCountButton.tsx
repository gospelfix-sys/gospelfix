import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewCountButtonProps {
  count: number;
}

export function ReviewCountButton({ count }: ReviewCountButtonProps) {
  return (
    <Link
      href="#reviews"
      aria-label={`리뷰 ${count}개 보기`}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative h-9 w-9 shrink-0 rounded-full text-gf-gray1 hover:bg-gf-orange-bg hover:text-gf-orange",
      )}
    >
      <MessageCircle className="size-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-gf-border bg-gf-white px-1 text-[11px] font-bold text-gf-gray1">
          {count}
        </span>
      )}
    </Link>
  );
}
