export type SellerType = "individual" | "business";
export type SellerIdentityStatus = "pending" | "approved" | "rejected";

// 판매자 본인이 제출한 신원정보와 승인 상태(본인 조회 전용, 연락처 원문 포함).
export interface SellerIdentity {
  sellerType: SellerType;
  contactName: string | null;
  contactPhone: string;
  phoneVerified: boolean;
  contactEmail: string;
  emailVerified: boolean;
  businessName: string | null;
  representativeName: string | null;
  businessAddress: string | null;
  businessNumber: string | null;
  mailOrderReportNumber: string | null;
  businessVerified: boolean;
  status: SellerIdentityStatus;
  submittedAt: string;
}

// 판매자 신청 폼 입력. 연락처는 인증 없이 입력만 받는다.
export interface SellerIdentityInput {
  sellerType: SellerType;
  // 개인만 받는다(사업자는 대표자명)
  contactName?: string;
  contactPhone: string;
  contactEmail: string;
  businessName?: string;
  representativeName?: string;
  businessAddress?: string;
  businessNumber?: string;
  // 국세청 진위확인에만 쓰이고 저장되지 않는다 (YYYYMMDD)
  businessOpenedAt?: string;
  mailOrderReportNumber?: string;
}

// 구매자에게 주문 전 공개되는 판매자 신원정보. 개인은 확인 여부만, 사업자는 법정 표시 항목을 준다.
export interface PublicSellerIdentity {
  sellerType: SellerType;
  verified: boolean;
  business: {
    name: string;
    representativeName: string;
    address: string;
    businessNumber: string;
    // 신고 면제 등으로 입력하지 않은 판매자는 null
    mailOrderReportNumber: string | null;
  } | null;
}
