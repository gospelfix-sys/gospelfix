export interface PortfolioListItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail_url: string | null;
  images: string[];
  site_url: string;
  sort_order: number;
}
