export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  } | null;
}

export interface MyReview {
  id: string;
  product_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  product: {
    name: string;
    thumbnail_url: string | null;
    slug: string;
  } | null;
}
