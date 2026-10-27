import { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import { decodeRouteParam } from "@/lib/utils";
import { NewsItem } from "@/types/news.types";
import NewsDetailContent from "@/components/news/NewsDetailContent";
import BackToBlogButton from "@/components/news/BackToBlogButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeRouteParam((await params).slug);
  const { data: news } = await serverFetch<{ data: NewsItem | null }>(
    `/api/news/${encodeURIComponent(slug)}`,
  );

  if (!news) {
    return { title: "게시물을 찾을 수 없습니다 | GOSPELFIX" };
  }

  return {
    title: `${news.title} | GOSPELFIX`,
    openGraph: {
      title: news.title,
      images: news.thumbnail_url ? [news.thumbnail_url] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const slug = decodeRouteParam((await params).slug);
  const { data: news } = await serverFetch<{ data: NewsItem | null }>(
    `/api/news/${encodeURIComponent(slug)}`,
  );

  if (!news) notFound();

  return (
    <div className="bg-gf-bg min-h-screen">
      <article className="px-6 lg:px-[60px] pt-20 pb-14">
        <div className="mx-auto max-w-3xl">
          <NewsDetailContent news={news} />

          {/* 하단 네비게이션 */}
          <div className="mt-14 pt-8 border-t gf-border flex justify-center">
            <BackToBlogButton />
          </div>
        </div>
      </article>
    </div>
  );
}
