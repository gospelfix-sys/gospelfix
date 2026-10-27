import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import { decodeRouteParam } from "@/lib/utils";
import { NewsItem } from "@/types/news.types";
import NewsDetailContent from "@/components/news/NewsDetailContent";
import BackToBlogButton from "@/components/news/BackToBlogButton";
import RouteModal from "@/components/ui/RouteModal";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailModal({ params }: Props) {
  const slug = decodeRouteParam((await params).slug);
  const { data: news } = await serverFetch<{ data: NewsItem | null }>(
    `/api/news/${encodeURIComponent(slug)}`,
  );

  if (!news) notFound();

  return (
    <RouteModal ariaLabel={news.title}>
      <div className="mx-auto max-w-3xl">
        <NewsDetailContent news={news} />

        {/* 하단 네비게이션 */}
        <div className="mt-14 pt-8 border-t gf-border flex justify-center">
          <BackToBlogButton />
        </div>
      </div>
    </RouteModal>
  );
}
