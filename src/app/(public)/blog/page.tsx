import { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { LayerShell } from "@/components/layer/LayerShell";
import { BlogCard } from "@/components/news/BlogCard";
import { serverFetch } from "@/lib/serverFetch";
import type { NewsListItem } from "@/types/news.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "블로그 | 가스펄픽스",
  description: "새로운 템플릿 출시, 업데이트, 이벤트 소식을 전해드립니다.",
};

export default async function BlogListPage() {
  const news = await serverFetch<NewsListItem[]>("/api/news");

  return (
    <LayerShell>
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-14 lg:px-10">
        <header className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-[-0.03em] text-gf-black sm:text-4xl">
            블로그
          </h1>
          <p className="text-sm text-gf-gray1">
            새로운 템플릿 출시, 업데이트, 이벤트 소식을 전해드립니다.
          </p>
        </header>

        {news.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gf-border bg-gf-white">
            <Megaphone width={32} height={32} className="mb-3 text-gf-gray2" />
            <p className="mb-1 text-lg font-semibold text-gf-black">아직 게시물이 없습니다</p>
            <p className="text-sm text-gf-gray2">새로운 콘텐츠가 올라오면 이곳에서 확인하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <BlogCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </main>
    </LayerShell>
  );
}
