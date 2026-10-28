import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsListItem } from "@/types/news.types";

interface AdjacentNewsNavProps {
  prev: NewsListItem | null;
  next: NewsListItem | null;
}

interface NavCardProps {
  news: NewsListItem | null;
  direction: "prev" | "next";
}

const DIRECTION_LABEL = { prev: "이전글", next: "다음글" } as const;

const cardClassName =
  "group flex min-w-0 items-center gap-3 rounded-lg border gf-border gf-bg-white px-5 py-4 no-underline transition-colors";

function NavCard({ news, direction }: NavCardProps) {
  const isPrev = direction === "prev";
  const Icon = isPrev ? ChevronLeft : ChevronRight;

  // 글이 없는 쪽도 그리드 칸은 유지해 반대쪽 카드가 한쪽으로 쏠리지 않게 한다.
  if (!news) return <div aria-hidden className="hidden sm:block" />;

  return (
    <Link
      href={`/blog/${news.slug}`}
      // replace: 모달 안에서 글을 넘겨도 히스토리가 쌓이지 않아 닫기(router.back())가 항상 목록으로 돌아간다.
      replace
      scroll={false}
      className={cn(
        cardClassName,
        "hover:border-gf-orange",
        isPrev ? "flex-row" : "flex-row-reverse",
      )}
    >
      <Icon width={18} height={18} className="shrink-0 gf-text-black" />
      <div className={cn("min-w-0 flex-1", isPrev ? "text-right" : "text-left")}>
        <p className="text-xs font-medium text-gf-gray2">{DIRECTION_LABEL[direction]}</p>
        <p className="truncate text-sm font-bold gf-text-black transition-colors group-hover:text-gf-orange">
          {news.title}
        </p>
      </div>
    </Link>
  );
}

// 블로그 상세 하단의 이전글/다음글 카드. prev는 더 최신 글, next는 더 오래된 글.
export default function AdjacentNewsNav({ prev, next }: AdjacentNewsNavProps) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="이전글 다음글" className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <NavCard news={prev} direction="prev" />
      <NavCard news={next} direction="next" />
    </nav>
  );
}
