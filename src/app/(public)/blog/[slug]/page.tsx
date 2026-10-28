import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacentNews, getNewsBySlug } from "@/lib/api/news";
import NewsDetailContent from "@/components/news/NewsDetailContent";
import AdjacentNewsNav from "@/components/news/AdjacentNewsNav";
import BackToBlogButton from "@/components/news/BackToBlogButton";
import { LayerShell } from "@/components/layer/LayerShell";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

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
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) notFound();

  const adjacent = await getAdjacentNews(slug);

  return (
    <LayerShell>
      <article className="px-6 lg:px-[60px] pt-14 pb-14">
        <div className="mx-auto max-w-3xl">
          <NewsDetailContent news={news} />

          <AdjacentNewsNav prev={adjacent.prev} next={adjacent.next} />

          {/* 하단 네비게이션 */}
          <div className="mt-14 pt-8 border-t gf-border flex justify-center">
            <BackToBlogButton />
          </div>
        </div>
      </article>
    </LayerShell>
  );
}
