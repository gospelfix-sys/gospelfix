export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  optionId: string;
  optionLabel: string;
  price: number;
  createdAt: string;
}
