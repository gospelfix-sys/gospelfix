export interface PurchasedOrder {
  order_id: string;
  paid_at: string | null;
  // 구매자가 입금한 총액(부가세 포함). vat_amount는 그 안에 포함된 부가세(없으면 0)
  amount: number;
  vat_amount: number;
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
  vat_amount: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    thumbnail_url: string | null;
  } | null;
}
