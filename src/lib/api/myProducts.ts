import type { SellerProduct, SellerProductInput, SellerProductStatus } from "@/types/product.types";

// cms.api `/api/v1/my-products/*` 응답 형태 (camelCase). 필드셋은
// project_product_crud_migration_to_mypage 메모리에 정리된 계약을 그대로 따른다.
// 순수 타입/매핑만 담당하며 cmsApiFetch 호출은 하지 않으므로
// route.ts 바깥에 둬도 "cms.api 호출은 route.ts 안에서만" 규칙에 저촉되지 않는다.
export interface CmsMyProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  contentHtml: string | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  category: string;
  subCategories: string[];
  images: string[] | null;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  price: number;
  supplyPrice: number | null;
  purchaseOptions:
    | {
        id: string;
        label: string;
        price: number | null;
        description: string | null;
        workPeriodDays: string | null;
        isInquiryOnly: boolean;
        detail: string | null;
      }[]
    | null;
  productionSolution: string | null;
  productCode: string | null;
  designType: string | null;
  hasAiStarterKit: boolean;
  // cms.api 배포 전에는 내려오지 않을 수 있어 optional
  allowCoupon?: boolean;
  filePath: string | null;
  codePreview: { id: string; label: string; code: string }[] | null;
  // cms.api 배포 전에는 내려오지 않을 수 있어 optional
  infoChips?: { id: string; label: string; value: string }[] | null;
  license: string | null;
  // 미술·전시 탭 필드. 마이그레이션 이전 등록분은 값이 없을 수 있다.
  artworkSize?: string | null;
  artworkMedium?: string | null;
  artworkYear?: string | null;
  exhibitionTitle?: string | null;
  exhibitionPeriod?: string | null;
  exhibitionVenue?: string | null;
  exhibitionArtists?: string | null;
  editionType?: string | null;
  editionSize?: string | null;
  frameIncluded?: boolean;
  status: SellerProductStatus;
  sellerId: string | null;
  isActive: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export function toSellerProduct(item: CmsMyProduct): SellerProduct {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    content_html: item.contentHtml,
    discount_starts_at: item.discountStartsAt,
    discount_ends_at: item.discountEndsAt,
    category: item.category,
    sub_categories: item.subCategories,
    images: item.images,
    demo_url: item.demoUrl,
    price: item.price,
    thumbnail_url: item.thumbnailUrl,
    is_active: item.isActive,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    supply_price: item.supplyPrice,
    purchase_options:
      item.purchaseOptions?.map((opt) => ({
        id: opt.id,
        label: opt.label,
        price: opt.price,
        description: opt.description,
        work_period_days: opt.workPeriodDays,
        is_inquiry_only: opt.isInquiryOnly,
        detail: opt.detail,
      })) ?? null,
    production_solution: item.productionSolution,
    product_code: item.productCode,
    design_type: item.designType,
    like_count: item.likeCount,
    has_ai_starter_kit: item.hasAiStarterKit,
    allow_coupon: item.allowCoupon ?? false,
    code_preview: item.codePreview,
    info_chips: item.infoChips ?? [],
    license: item.license,
    artwork_size: item.artworkSize,
    artwork_medium: item.artworkMedium,
    artwork_year: item.artworkYear,
    exhibition_title: item.exhibitionTitle,
    exhibition_period: item.exhibitionPeriod,
    exhibition_venue: item.exhibitionVenue,
    exhibition_artists: item.exhibitionArtists,
    edition_type: item.editionType,
    edition_size: item.editionSize,
    frame_included: item.frameIncluded,
    status: item.status,
    seller_id: item.sellerId,
    file_path: item.filePath,
  };
}

// gospelfix 폼(snake_case)을 cms.api REST 요청 바디(camelCase)로 변환한다 — 기존
// orders/create, reviews 등 cms.api로 나가는 다른 요청 바디와 케이스 컨벤션을 맞춘다.
export function toCmsProductInput(input: SellerProductInput) {
  return {
    status: input.status,
    slug: input.slug,
    name: input.name,
    description: input.description,
    contentHtml: input.content_html,
    discountStartsAt: input.discount_starts_at,
    discountEndsAt: input.discount_ends_at,
    category: input.category,
    subCategories: input.sub_categories,
    images: input.images,
    demoUrl: input.demo_url,
    price: input.price,
    supplyPrice: input.supply_price,
    purchaseOptions: input.purchase_options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      price: opt.price,
      description: opt.description,
      workPeriodDays: opt.work_period_days,
      isInquiryOnly: opt.is_inquiry_only,
      detail: opt.detail,
    })),
    productionSolution: input.production_solution,
    productCode: input.product_code,
    designType: input.design_type,
    hasAiStarterKit: input.has_ai_starter_kit,
    allowCoupon: input.allow_coupon,
    filePath: input.file_path,
    codePreview: input.code_preview,
    infoChips: input.info_chips,
    license: input.license,
    artworkSize: input.artwork_size,
    artworkMedium: input.artwork_medium,
    artworkYear: input.artwork_year,
    exhibitionTitle: input.exhibition_title,
    exhibitionPeriod: input.exhibition_period,
    exhibitionVenue: input.exhibition_venue,
    exhibitionArtists: input.exhibition_artists,
    editionType: input.edition_type,
    editionSize: input.edition_size,
    frameIncluded: input.frame_included,
    // 동의가 없는 저장(수정 시 라이선스 유지)은 키를 빼서 cms.api가 기존 기록을 유지하게 한다.
    licenseAcknowledgement: input.license_acknowledgement
      ? {
          license: input.license_acknowledgement.license,
          version: input.license_acknowledgement.version,
          agreedAt: input.license_acknowledgement.agreed_at,
        }
      : undefined,
  };
}
