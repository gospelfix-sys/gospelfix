export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  optionId: string;
  optionLabel: string;
  // 공급가 기준 가격(부가세 제외). 결제 총액은 vatApplicable일 때 calcVat()으로 계산한다
  price: number;
  vatApplicable: boolean;
  createdAt: string;
}
