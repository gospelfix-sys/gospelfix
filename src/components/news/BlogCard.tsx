import Image from "next/image";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { NewsListItem } from "@/types/news.types";

interface BlogCardProps {
  news: NewsListItem;
}

// 블로그 목록 카드: 큰 썸네일 + 하단 카테고리/제목/날짜. 목록에서는 상세가 모달로 인터셉트된다.
export function BlogCard({ news }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${news.slug}`}
      scroll={false}
      className="group flex flex-col gap-3 no-underline"
    >
      <div className="relative aspect-[592/360] overflow-hidden rounded-2xl bg-gf-surface">
        {news.thumbnail_url ? (
          <Image
            src={news.thumbnail_url}
            alt={news.title}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone width={32} height={32} className="text-gf-gray3" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <p className="text-xs font-semibold text-gf-orange">{news.category}</p>
        <h2 className="line-clamp-2 text-base font-bold leading-snug text-gf-black">
          {news.title}
        </h2>
        <p className="text-xs text-gf-gray2">{formatDate(news.created_at)}</p>
      </div>
    </Link>
  );
}
