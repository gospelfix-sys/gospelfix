export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: "업데이트" | "신규 템플릿" | "이벤트";
  thumbnail_url?: string | null;
  portfolio_images?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type NewsListItem = Pick<
  NewsItem,
  "id" | "title" | "slug" | "category" | "thumbnail_url" | "is_published" | "created_at"
>;
