// "코드 미리보기" 섹션 탭 1개. label이 파일명 역할을 겸한다(예: "index.html", "data.json").
export interface ProductCodePreviewItem {
  id: string;
  label: string;
  code: string;
}

export interface ProductOption {
  id: string;
  label: string;
  // 별도 문의 옵션은 가격이 없을 수 있다
  price?: number | null;
  description?: string | null;
  // 숫자(예: 1)뿐 아니라 "협의" 같은 텍스트로 입력될 수 있다
  work_period_days?: number | string | null;
  // true면 가격 대신 "별도 문의" + 카카오 채널 문의 버튼으로 전환
  is_inquiry_only: boolean;
  detail?: string | null;
}

// 업로드 폼 "미술·전시" 탭 입력값. 전부 선택 항목이라 빈 문자열/false가 "미입력"이다
// (cms.api의 nullable 컬럼이 실제로는 NOT NULL일 수 있어 null 대신 빈 값을 보낸다).
export interface ArtDetails {
  // 작품 정보
  artwork_size: string;
  artwork_medium: string;
  artwork_year: string;
  // 전시 정보
  exhibition_title: string;
  exhibition_period: string;
  exhibition_venue: string;
  exhibition_artists: string;
  // 에디션·판매 형태
  edition_type: string;
  edition_size: string;
  frame_included: boolean;
}

export const EMPTY_ART_DETAILS: ArtDetails = {
  artwork_size: "",
  artwork_medium: "",
  artwork_year: "",
  exhibition_title: "",
  exhibition_period: "",
  exhibition_venue: "",
  exhibition_artists: "",
  edition_type: "",
  edition_size: "",
  frame_included: false,
};

// cms.api 응답 쪽 미술·전시 필드. 마이그레이션 이전 등록분은 값이 없어 전부 optional/nullable.
export type ArtDetailsStored = {
  [K in keyof ArtDetails]?: ArtDetails[K] extends boolean ? boolean : string | null;
};

export interface Product extends ArtDetailsStored {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  // 상세페이지 최상단에 표시되는 리치 텍스트(HTML, 관리자 에디터 작성). sanitizeContentHtml()로
  // 새니타이징 후 렌더링할 것 (구 banner_image_url 정적 배너 이미지를 대체)
  content_html?: string | null;
  // 할인 기간. 설정 시 이 기간 동안은 price가 판매가로 적용되고, 기간이 끝나면 supply_price가
  // 판매가(정가)로 전환된다(price=할인가, supply_price=정가). getProductPriceState() 참고
  discount_starts_at?: string | null;
  discount_ends_at?: string | null;
  category: string;
  // 상품이 대상으로 하는 업종 태그(최대 3개). category(페이지 유형)와 직교하는 필드.
  sub_categories: string[];
  price: number;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  supply_price?: number | null;
  purchase_options?: ProductOption[] | null;
  production_solution?: string | null;
  product_code?: string | null;
  design_type?: string | null;
  like_count?: number;
  // true면 상세페이지에 "AI 확장" 칩과 .claude 스타터 킷 다운로드 링크가 노출된다.
  has_ai_starter_kit?: boolean;
  // "코드 미리보기" 섹션 탭 배열. 비어있으면 섹션 자체를 숨긴다.
  code_preview?: ProductCodePreviewItem[] | null;
  // 저작권 및 라이선스 구분값(LICENSE_OPTIONS의 value). cms.api가 아직 값을 내려주지
  // 않는 상품(마이그레이션 이전 등록분)을 위해 optional로 둔다.
  license?: string | null;
  // 판매자가 등록한 데모 사이트 링크. "Visit Site" CTA 등에 쓰인다.
  demo_url?: string | null;
}

interface LicenseOption {
  value: string;
  label: string;
  description: string;
}

// 상품 등록/수정 폼("저작권 및 라이선스" 다이얼로그)과 상세페이지 정보 카드가 공용으로
// 참조하는 라이선스 구분 목록. 한쪽에서만 정의하면 다른 쪽이 값→라벨 매핑을 못 찾는다.
// 순서는 다이얼로그 노출 순서이기도 하다(유료: 상용 라이선스 / 무료: CC BY-NC → CC BY → CC BY-NC-ND).
// 판매자는 이 설명을 읽고 "선택한 라이선스를 이해했습니다"에 동의하므로, 설명을 바꾸면
// LicenseDialog의 LICENSE_ACKNOWLEDGEMENT_VERSION도 올린다.
export const COMMERCIAL_LICENSE = "all-rights-reserved";

export const LICENSE_OPTIONS: LicenseOption[] = [
  {
    // value는 기존 DB 값("all-rights-reserved")을 유지한다 — 표시명만 "상용 라이선스"로 바꿨다.
    // 템플릿·이미지·음악·영상 등 모든 장르에 공통으로 쓰이므로 "단순 복사/수정 포함" 같은
    // 특정 장르의 구매항목명을 넣지 않고, 구체적 이용 범위는 구매 옵션 설명에 맡긴다.
    // 완성 작품을 파는 마켓이라 "의뢰받아 납품" 조항은 넣지 않는다(사용자 판단, 2026-11-17).
    // 구매자가 자기 고객의 결과물에 쓸 수 있는지도 사용처와 함께 구매 옵션 설명이 정한다.
    // 입점형이라 범위 확장(재판매·재배포 포함)을 허락할 권한은 판매자에게 있다. 그래서 "어느
    // 경우에도 금지"라는 플랫폼 단정 대신 "이 라이선스로는 불가 + 넘는 이용은 판매자의 별도
    // 허락"으로 쓴다. 기본값은 계속 금지여야 하므로 "협의 가능"처럼 열린 표현은 쓰지 않는다.
    value: COMMERCIAL_LICENSE,
    label: "GospelFix 상용 라이선스",
    description:
      "저작권자가 모든 권리를 보유하고, 구매자에게는 구매한 항목(구매 옵션)에 적힌 이용 범위 안에서만 이용을 허락합니다. 사용 횟수, 사용처(프로젝트·매체·용도), 수정·편집 등 2차 가공 가능 여부는 상품 페이지의 구매 옵션 설명을 따릅니다. 이 라이선스로는 재판매, 재배포, 파일 단독 공유를 할 수 없으며, 구매한 범위를 넘어 복제하거나 다른 용도로 쓰려면 판매자에게 별도로 허락을 받아야 합니다. 허락 없이 범위를 넘어 이용하면 저작권 침해가 될 수 있습니다.",
  },
  {
    value: "cc-by-nc",
    label: "저작권표시 - 비영리 [CC BY-NC]",
    description:
      "저작자를 표시하면 자유롭게 사용·수정·재배포할 수 있지만, 영리 목적으로는 이용할 수 없습니다. 고객사 납품이나 광고 수익이 발생하는 사이트는 영리로 간주될 수 있습니다. CC 라이선스는 한 번 부여하면 철회할 수 없습니다.",
  },
  {
    value: "cc-by",
    label: "저작권표시 [CC BY]",
    description:
      "저작자 표시만 하면 누구나 자유롭게 사용할 수 있습니다. 상업적 목적의 이용, 수정, 2차 저작물 제작, 재배포가 모두 허용되는 가장 개방적인 라이선스입니다. CC 라이선스는 한 번 부여하면 철회할 수 없습니다.",
  },
  {
    value: "cc-by-nc-nd",
    label: "저작권표시 - 비영리 - 변경금지 [CC BY-NC-ND]",
    description:
      "저작자를 표시하고 비영리 목적으로만 사용할 수 있으며, 원본을 변경하지 않고 그대로만 사용해야 합니다. 수정해서 쓰는 템플릿·코드에는 맞지 않아 이미지·영상 작품에서만 선택할 수 있습니다. 고객사 납품이나 광고 수익이 발생하는 사이트는 영리로 간주될 수 있으며, CC 라이선스는 한 번 부여하면 철회할 수 없습니다.",
  },
];

// 라이선스 선택 규칙: 유료는 상용 라이선스만, 무료는 CC 3종 중에서 직접 선택(기본값 없음 = "").
export function isLicenseAllowed(license: string, isFree: boolean): boolean {
  return isFree ? license !== COMMERCIAL_LICENSE : license === COMMERCIAL_LICENSE;
}

export function getLicenseLabel(value?: string | null): string | null {
  if (!value) return null;
  return LICENSE_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export type ProductCategory = {
  value: string;
  label: string;
};

// 2026-08-27 카테고리 체계 전면 개편 — 기존 landing/dashboard/ecommerce/corporate/blog(페이지
// 유형 기준) 5종을 폐기하고, 서비스 성격 기준의 3종으로 교체했다. cms.api 061 마이그레이션으로
// 기존 상품 데이터가 전량 삭제된 뒤 새 체계로만 다시 등록된다는 전제하에 값을 재사용하지 않았다.
const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  website: "웹사이트",
  ux_ui: "UX/UI",
  branding: "브랜딩",
};

export function getCategoryLabel(value: string): string {
  return PRODUCT_CATEGORY_LABELS[value] ?? value;
}

// cms.api /api/v1/product-categories 호출이 실패했을 때만 쓰는 최후 수단 기본값.
// 정상 동작 시 실제 목록은 항상 cms.api DB에서 온다(lib/api/categories.ts) —
// 이 배열을 화면 렌더에 직접 쓰지 말 것("all"도 이 fallback 전용 문맥에서만 필요).
export const FALLBACK_PRODUCT_CATEGORIES: ProductCategory[] = [
  { value: "all", label: "전체" },
  { value: "website", label: PRODUCT_CATEGORY_LABELS.website },
  { value: "ux_ui", label: PRODUCT_CATEGORY_LABELS.ux_ui },
  { value: "branding", label: PRODUCT_CATEGORY_LABELS.branding },
];

// 상품 등록 시 선택하는 업종 소분류(대분류 category와 직교). cms.api
// products.admin.ts의 VALID_SUB_CATEGORIES 화이트리스트와 값이 정확히 일치해야 한다.
export const MAX_SUB_CATEGORIES = 3;

const SUB_CATEGORY_LABELS: Record<string, string> = {
  etc: "기타분류",
  leisure_sports: "레저/스포츠",
  appliance_electronics: "가전/전자",
  lifestyle: "생활/라이프",
  entertainment_media: "엔터테인먼트/미디어",
  beauty_women: "뷰티/여성",
  corporate_group: "기업/그룹",
  fashion_shopping: "패션/쇼핑",
  travel_stay: "여행/숙소",
  culture_art: "문화/예술",
  education_academy: "교육/학원",
  furniture_interior: "가구/인테리어",
  kids_children: "유아/아동",
  event_promotion: "이벤트/프로모션",
  occasion_campaign: "행사/캠페인",
};

// cms.api /api/v1/product-sub-categories 호출이 실패했을 때만 쓰는 최후 수단 기본값.
// 정상 동작 시 실제 목록은 항상 cms.api DB에서 온다(lib/api/subCategories.ts).
export const FALLBACK_SUB_CATEGORIES: ProductCategory[] = [
  { value: "etc", label: SUB_CATEGORY_LABELS.etc },
  { value: "leisure_sports", label: SUB_CATEGORY_LABELS.leisure_sports },
  { value: "appliance_electronics", label: SUB_CATEGORY_LABELS.appliance_electronics },
  { value: "lifestyle", label: SUB_CATEGORY_LABELS.lifestyle },
  { value: "entertainment_media", label: SUB_CATEGORY_LABELS.entertainment_media },
  { value: "beauty_women", label: SUB_CATEGORY_LABELS.beauty_women },
  { value: "corporate_group", label: SUB_CATEGORY_LABELS.corporate_group },
  { value: "fashion_shopping", label: SUB_CATEGORY_LABELS.fashion_shopping },
  { value: "travel_stay", label: SUB_CATEGORY_LABELS.travel_stay },
  { value: "culture_art", label: SUB_CATEGORY_LABELS.culture_art },
  { value: "education_academy", label: SUB_CATEGORY_LABELS.education_academy },
  { value: "furniture_interior", label: SUB_CATEGORY_LABELS.furniture_interior },
  { value: "kids_children", label: SUB_CATEGORY_LABELS.kids_children },
  { value: "event_promotion", label: SUB_CATEGORY_LABELS.event_promotion },
  { value: "occasion_campaign", label: SUB_CATEGORY_LABELS.occasion_campaign },
];

// 판매자 셀프서비스 상품 등록/수정 검수 상태. approved만 공개 카탈로그(/,
// /detail/[slug])에 노출된다 — 관리자 수동 승인제(project_product_crud_migration_to_mypage
// 메모리 참고).
export type SellerProductStatus = "draft" | "pending" | "approved" | "rejected";

export const SELLER_PRODUCT_STATUS_LABELS: Record<SellerProductStatus, string> = {
  draft: "임시저장",
  pending: "검수 대기",
  approved: "승인됨",
  rejected: "반려됨",
};

// 판매자 마이페이지 상품 등록/수정 폼 입력값. cms.api ProductForm의 필드셋과 1:1로
// 대응한다(같은 값을 그대로 전송) — 새 필드를 임의로 추가하지 말 것. status만
// cms.api admin 폼(isActive)과 달리 셀프서비스 검수 흐름 때문에 추가된 필드.
export interface SellerProductInput extends ArtDetails {
  status: "draft" | "pending";
  slug: string;
  name: string;
  description: string;
  content_html: string;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  category: string;
  sub_categories: string[];
  images: string[];
  demo_url: string;
  price: number;
  supply_price: number | null;
  purchase_options: ProductOption[];
  production_solution: string;
  product_code: string;
  design_type: string;
  has_ai_starter_kit: boolean;
  file_path: string | null;
  code_preview: ProductCodePreviewItem[];
  license: string;
  // 라이선스 모달 필수 동의 기록. 이번 저장에서 라이선스를 확정(모달 "선택")했을 때만 싣는다 —
  // 없으면 cms.api는 기존 기록을 유지한다.
  license_acknowledgement?: LicenseAcknowledgement;
}

// 판매자가 라이선스 모달에서 필수 항목에 동의한 기록 — 분쟁 시 "언제, 어떤 안내 문구에
// 동의했는지" 입증용. agreed_at은 브라우저 시각이라 증빙으로는 cms.api가 남기는 서버
// 수신 시각을 함께 써야 한다.
export interface LicenseAcknowledgement {
  // 동의 당시 확정한 라이선스 값. 가격 유형 전환 등으로 라이선스가 바뀌면 이 기록은 무효다.
  license: string;
  // LicenseDialog의 LICENSE_ACKNOWLEDGEMENT_VERSION
  version: string;
  agreed_at: string;
}

// 마이페이지 "내 상품" 목록/상세에서 쓰는, 소유·검수 정보가 추가된 상품 형태.
// Product는 공개 카탈로그 응답 형태라 images가 없어(썸네일만 노출) 여기서 별도로
// 추가한다 — 편집 폼은 전체 이미지 배열을 다뤄야 한다.
export interface SellerProduct extends Product {
  status: SellerProductStatus;
  seller_id: string | null;
  images: string[] | null;
  demo_url: string | null;
  file_path: string | null;
}

// 상세페이지 "제공형태" 칩에 카테고리별로 노출할 서비스 관점의 명칭. 대분류 라벨 그대로에
// "AI기반 " 접두어만 붙인다.
export const PRODUCT_FORMAT_LABELS: Record<string, string> = {
  website: `AI기반 ${PRODUCT_CATEGORY_LABELS.website}`,
  ux_ui: `AI기반 ${PRODUCT_CATEGORY_LABELS.ux_ui}`,
  branding: `AI기반 ${PRODUCT_CATEGORY_LABELS.branding}`,
};
