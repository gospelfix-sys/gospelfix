export interface PurchasedOrder {
  order_id: string;
  paid_at: string | null;
  amount: number;
  product: {
    id: string;
    name: string;
    thumbnail_url: string | null;
    file_path: string | null;
  } | null;
}

export interface PendingOrder {
  order_id: string;
  status: "pending" | "pending_confirm";
  amount: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    thumbnail_url: string | null;
  } | null;
}
