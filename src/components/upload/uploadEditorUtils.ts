import {
  COMMERCIAL_LICENSE,
  isLicenseAllowed,
  PRODUCT_FORMAT_LABELS,
  type ProductCodePreviewItem,
  type ProductInfoChip,
  type ProductOption,
} from "@/types/product.types";

// 묶음 안 사진의 용도. 상세페이지에서 Desktop/Mobile 토글로 걸러 보여준다.
export type GalleryDevice = "desktop" | "mobile";

// gallery 블록 안의 이미지 한 장. file이 있으면 아직 업로드 전(blob URL)이다.
export interface GalleryImage {
  id: string;
  url: string;
  device: GalleryDevice;
  file?: File;
}

export interface ContentBlock {
  id: string;
  type: "image" | "text" | "video" | "gallery";
  url?: string;
  // 새로 선택했지만 아직 업로드하지 않은 이미지. 업로드는 게시/초안저장 시점에 한 번에 처리한다.
  file?: File;
  // gallery 블록 전용: 상세페이지에서 좌우 슬라이더로 보이는 이미지 묶음.
  images?: GalleryImage[];
  html?: string;
  // video 블록 전용: 사용자가 입력 중인 원본 링크와, resolveVideoLink로 확인된 임베드 URL.
  videoInput?: string;
  embedUrl?: string;
  lastResolvedInput?: string;
}

export const DESIGN_TYPES = ["반응형", "고정형"];

// 미술·전시 탭의 "에디션 구분". cms.api는 문자열로만 저장하므로 값 자체가 표시 문구다.
export const EDITION_TYPES = ["원본 (1점)", "에디션 프린트", "오픈 에디션"];

export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function createId(): string {
  return Math.random().toString(36).slice(2);
}

export function createEmptyPurchaseOption(): ProductOption {
  return {
    id: createId(),
    label: "",
    price: 0,
    description: "",
    work_period_days: null,
    is_inquiry_only: false,
    detail: "",
  };
}

export function createEmptyInfoChip(): ProductInfoChip {
  return { id: createId(), label: "", value: "" };
}

// 카테고리에 맞는 "제공형태" 기본 문구. 카테고리가 아직 없거나 목록에 없으면 웹/앱 문구를 쓴다.
export function getDefaultFormatValue(category: string): string {
  return PRODUCT_FORMAT_LABELS[category] ?? PRODUCT_FORMAT_LABELS.website;
}

// 새 상품 등록 시 폼에 미리 채워 두는 기본 칩. 판매자가 자유롭게 고치거나 지울 수 있다.
export const INFO_CHIP_FORMAT_LABEL = "제공형태";

export function createDefaultInfoChips(category: string): ProductInfoChip[] {
  const defaults: [string, string][] = [
    ["진행방식", "전 과정 온라인"],
    ["결제수단", "계좌이체"],
    [INFO_CHIP_FORMAT_LABEL, getDefaultFormatValue(category)],
    ["콘텐츠", "별도 준비 필요"],
    ["구매대상", "누구나 가능"],
    ["진행현황", "마이페이지에서 확인"],
  ];
  return defaults.map(([label, value]) => ({ id: createId(), label, value }));
}

export function createEmptyCodePreviewItem(): ProductCodePreviewItem {
  return { id: createId(), label: "", code: "" };
}

// 유료 상품은 상용 라이선스·제작·납품 서비스만, 무료 상품은 CC 라이선스만 허용한다(CC는 철회가
// 불가능해 유료 상품에 부여하면 구매자의 재배포가 합법이 된다). 가격 토글뿐 아니라 기존 상품
// 로드/라이선스 확정/최종 제출 시점에도 동일하게 강제해야 편집 흐름을 통해 위반 상태가 재생산되지
// 않는다. 무료로 바뀔 때는 기본값 없이 비워 판매자가 직접 고르게 한다.
// 유료 쪽 대체값은 항상 상용 라이선스다 — 이미 허용된 값(기존 상용 라이선스 상품 포함)은 그대로
// 두므로, 제작·납품 서비스로 자동 전환되는 경우는 없다(판매자가 모달에서 직접 골라야 한다).
export function normalizeLicense(license: string, isFree: boolean): string {
  if (isLicenseAllowed(license, isFree)) return license;
  return isFree ? "" : COMMERCIAL_LICENSE;
}

// Vercel 서버리스 요청 본문 한도(약 4.5MB)에 multipart 오버헤드를 감안한 이미지 업로드 상한.
// 넘기면 본문이 잘려 서버가 "Failed to parse body as FormData."를 내므로 보내기 전에 막는다.
export const MAX_UPLOAD_IMAGE_BYTES = 4 * 1024 * 1024;

export function getImageSizeError(file: File): string | null {
  if (file.size <= MAX_UPLOAD_IMAGE_BYTES) return null;
  const mb = (file.size / (1024 * 1024)).toFixed(1);
  return `이미지 용량이 너무 큽니다. (${mb}MB) 4MB 이하로 줄여서 올려주세요.`;
}

export async function uploadImage(file: File): Promise<string> {
  const sizeError = getImageSizeError(file);
  if (sizeError) throw new Error(sizeError);
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/my-products/images", { method: "POST", body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "이미지 업로드에 실패했습니다.");
  return data.url as string;
}

// 이미지 묶음(gallery) 직렬화 형식. 상세페이지가 이 클래스를 보고 슬라이더로 바꾼다
// (src/lib/sanitizeHtml.ts의 splitContentSegments와 형식을 맞출 것).
export const IMAGE_GALLERY_CLASS = "image-gallery";
// 모바일용 사진만 클래스를 붙인다. 데스크톱은 기본값이라 표시가 없다.
export const GALLERY_MOBILE_CLASS = "device-mobile";

export function serializeImageTag(src: string): string {
  return `<img src="${src}" alt="" />`;
}

export function serializeGallery(images: { url: string; device: GalleryDevice }[]): string {
  // 1장짜리 묶음은 슬라이더가 필요 없으므로 일반 이미지로 저장한다.
  if (images.length === 0) return "";
  if (images.length === 1) return serializeImageTag(images[0].url);
  const tags = images.map(({ url, device }) =>
    device === "mobile"
      ? `<img src="${url}" alt="" class="${GALLERY_MOBILE_CLASS}" />`
      : serializeImageTag(url),
  );
  return `<div class="${IMAGE_GALLERY_CLASS}">${tags.join("")}</div>`;
}

// content_html 저장 시 직렬화하는 세 고정 패턴(<img>, image-gallery div, video-embed div)만
// 역으로 인식해 image/gallery/video 블록으로 복원한다. 그 외(리치 텍스트로 작성된 부분)는 text
// 블록으로 남긴다 — Tiptap 확장 구성에 iframe 노드가 없어 video-embed div를 텍스트 블록으로
// 그대로 넘기면 파싱 과정에서 통째로 사라지는 문제(수정 화면 재진입 시 저장했던 동영상이
// 없어짐)를 막는다. gallery는 <img> 단독 패턴보다 먼저 매칭돼야 안쪽 img가 따로 잡히지 않는다.
const CONTENT_BLOCK_PATTERN =
  /<div class="video-embed[^"]*"><iframe src="([^"]*)"[^>]*><\/iframe><\/div>|<div class="image-gallery">((?:<img src="[^"]*" alt=""(?: class="[^"]*")? \/>)+)<\/div>|<img src="([^"]*)" alt="" \/>/g;

const GALLERY_IMAGE_PATTERN = /<img src="([^"]*)" alt=""(?: class="([^"]*)")? \/>/g;

export function parseContentBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CONTENT_BLOCK_PATTERN.lastIndex = 0;
  while ((match = CONTENT_BLOCK_PATTERN.exec(html))) {
    const before = html.slice(lastIndex, match.index);
    if (before.trim()) blocks.push({ id: createId(), type: "text", html: before });
    if (match[1]) {
      // embedUrl을 videoInput 자리에도 넣어 입력창이 비어 보이지 않게 한다 — 원본 공유
      // 링크(watch/vimeo.com/... 형태)는 저장하지 않아 복원할 수 없지만, embedUrl도
      // resolveVideoLink가 그대로 다시 파싱 가능한 유효 URL이라 blur 시 재검증도 문제없다.
      blocks.push({
        id: createId(),
        type: "video",
        embedUrl: match[1],
        videoInput: match[1],
        lastResolvedInput: match[1],
      });
    } else if (match[2]) {
      const images = Array.from(match[2].matchAll(GALLERY_IMAGE_PATTERN), (m) => ({
        id: createId(),
        url: m[1],
        device: m[2]?.split(" ").includes(GALLERY_MOBILE_CLASS)
          ? ("mobile" as const)
          : ("desktop" as const),
      }));
      blocks.push({ id: createId(), type: "gallery", images });
    } else if (match[3]) {
      blocks.push({ id: createId(), type: "image", url: match[3] });
    }
    lastIndex = CONTENT_BLOCK_PATTERN.lastIndex;
  }
  const rest = html.slice(lastIndex);
  if (rest.trim()) blocks.push({ id: createId(), type: "text", html: rest });
  return blocks;
}

export async function uploadZip(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/my-products/files", { method: "POST", body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "파일 업로드에 실패했습니다.");
  return data.path as string;
}
