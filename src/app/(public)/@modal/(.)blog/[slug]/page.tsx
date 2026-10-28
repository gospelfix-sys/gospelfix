import { notFound } from "next/navigation";
import { getAdjacentNews, getNewsBySlug } from "@/lib/api/news";
import NewsDetailContent from "@/components/news/NewsDetailContent";
import AdjacentNewsNav from "@/components/news/AdjacentNewsNav";
import BackToBlogButton from "@/components/news/BackToBlogButton";
import RouteModal from "@/components/ui/RouteModal";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailModal({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) notFound();

  const adjacent = await getAdjacentNews(slug);

  return (
    <RouteModal ariaLabel={news.title} theme="dark">
      <div className="mx-auto max-w-3xl">
        <NewsDetailContent news={news} />

        <AdjacentNewsNav prev={adjacent.prev} next={adjacent.next} />

        {/* 하단 네비게이션 */}
        <div className="mt-14 pt-8 border-t gf-border flex justify-center">
          <BackToBlogButton />
        </div>
      </div>
    </RouteModal>
  );
}
