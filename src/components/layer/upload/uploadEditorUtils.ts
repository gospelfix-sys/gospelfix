import {
  LICENSE_OPTIONS,
  type ProductCodePreviewItem,
  type ProductOption,
} from "@/types/product.types";

export interface ContentBlock {
  id: string;
  type: "image" | "text" | "video";
  url?: string;
  // 새로 선택했지만 아직 업로드하지 않은 이미지. 업로드는 게시/초안저장 시점에 한 번에 처리한다.
  file?: File;
  html?: string;
  // video 블록 전용: 사용자가 입력 중인 원본 링크와, resolveVideoLink로 확인된 임베드 URL.
  videoInput?: string;
  embedUrl?: string;
  lastResolvedInput?: string;
}

export const DESIGN_TYPES = ["반응형", "고정형"];

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

export function createEmptyCodePreviewItem(): ProductCodePreviewItem {
  return { id: createId(), label: "", code: "" };
}

// 무료 상품은 "구매 후 부여된 이용 범위"를 전제로 한 판권소유(all-rights-reserved) 라이선스와
// 정책상 양립할 수 없다 — 가격 토글뿐 아니라 기존 상품 로드/라이선스 확정/최종 제출 시점에도
// 동일하게 강제해야 편집 흐름을 통해 위반 상태가 재생산되지 않는다.
export function normalizeLicense(license: string, isFree: boolean): string {
  return isFree && license === "all-rights-reserved" ? LICENSE_OPTIONS[0].value : license;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/my-products/images", { method: "POST", body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "이미지 업로드에 실패했습니다.");
  return data.url as string;
}

// content_html 저장 시 직렬화하는 두 고정 패턴(<img>, video-embed div)만 역으로 인식해
// image/video 블록으로 복원한다. 그 외(리치 텍스트로 작성된 부분)는 text 블록으로 남긴다 —
// Tiptap 확장 구성에 iframe 노드가 없어 video-embed div를 텍스트 블록으로 그대로 넘기면
// 파싱 과정에서 통째로 사라지는 문제(수정 화면 재진입 시 저장했던 동영상이 없어짐)를 막는다.
const CONTENT_BLOCK_PATTERN =
  /<div class="video-embed[^"]*"><iframe src="([^"]*)"[^>]*><\/iframe><\/div>|<img src="([^"]*)" alt="" \/>/g;

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
      blocks.push({ id: createId(), type: "image", url: match[2] });
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
