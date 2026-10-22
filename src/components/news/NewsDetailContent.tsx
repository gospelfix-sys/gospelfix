import { Calendar, Tag } from "lucide-react";
import { NewsItem } from "@/types/news.types";
import { cn } from "@/lib/utils";
import { sanitizeContentHtml } from "@/lib/sanitizeHtml";
import NewsImageGallery from "@/components/news/NewsImageGallery";

const CATEGORY_COLOR: Record<string, string> = {
  업데이트: "bg-blue-50 text-blue-600",
  "신규 템플릿": "bg-gf-orange-bg text-gf-orange",
  이벤트: "bg-green-50 text-green-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NewsDetailContent({ news }: { news: NewsItem }) {
  const contentHtml = sanitizeContentHtml(news.content);
  // 갤러리는 관리자가 portfolio_images로 별도 첨부한 작업물 사진만 보여준다.
  // content 본문 내 이미지는 sanitize된 본문 안에서 그대로 노출되며 갤러리에는 섞이지 않는다.
  const galleryImages = news.portfolio_images ?? [];

  return (
    <>
      {/* 아티클 헤더 */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold",
              CATEGORY_COLOR[news.category] ?? "bg-gray-100 text-gray-600",
            )}
          >
            <Tag width={10} height={10} />
            {news.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs gf-text-gray2">
            <Calendar width={12} height={12} />
            {formatDate(news.created_at)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black gf-text-black leading-tight mb-4">
          {news.title}
        </h1>
      </header>

      {/* 구분선 */}
      <div className="border-t gf-border mb-10" />

      {/* 본문 */}
      <div className="prose-gf max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />

      {/* 이미지 갤러리 */}
      <NewsImageGallery
        images={galleryImages}
        title={news.title}
        galleryId={`news-gallery-${news.id}`}
      />
    </>
  );
}
