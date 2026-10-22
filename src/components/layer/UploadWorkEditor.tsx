"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Menu,
  Plus,
  Type,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RichTextEditorLazy } from "@/components/layer/RichTextEditorLazy";
import { LayerSidebar } from "@/components/layer/LayerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { authLoadingAtom, authUserAtom } from "@/store/atoms/authAtom";
import { userProfileAtom } from "@/store/atoms/userAtom";
import {
  DEFAULT_LICENSE,
  getLicenseLabel,
  LICENSE_OPTIONS,
  MAX_SUB_CATEGORIES,
  type ProductCategory,
  type ProductCodePreviewItem,
  type ProductOption,
  type SellerProduct,
  type SellerProductInput,
} from "@/types/product.types";
import { cn, slugify } from "@/lib/utils";
import { resolveVideoLink } from "@/lib/videoLink";

interface ContentBlock {
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

const DESIGN_TYPES = ["반응형", "고정형"];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function createId(): string {
  return Math.random().toString(36).slice(2);
}

function createEmptyPurchaseOption(): ProductOption {
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

function createEmptyCodePreviewItem(): ProductCodePreviewItem {
  return { id: createId(), label: "", code: "" };
}

// 무료 상품은 "구매 후 부여된 이용 범위"를 전제로 한 판권소유(all-rights-reserved) 라이선스와
// 정책상 양립할 수 없다 — 가격 토글뿐 아니라 기존 상품 로드/라이선스 확정/최종 제출 시점에도
// 동일하게 강제해야 편집 흐름을 통해 위반 상태가 재생산되지 않는다.
function normalizeLicense(license: string, isFree: boolean): string {
  return isFree && license === "all-rights-reserved" ? LICENSE_OPTIONS[0].value : license;
}

async function uploadImage(file: File): Promise<string> {
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

function parseContentBlocks(html: string): ContentBlock[] {
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

async function uploadZip(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/my-products/files", { method: "POST", body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "파일 업로드에 실패했습니다.");
  return data.path as string;
}

// 작품 업로드 화면 — 판매자 마이페이지 상품 CRUD(project_product_crud_migration_to_mypage
// 메모리)로 확장됐다. 캔버스의 이미지+텍스트 블록은 순서대로 이어붙여 cms.api의 단일
// content_html 문자열로 직렬화한다. 반대 방향(기존 상품 수정 시 content_html → 블록
// 복원)은 완벽한 역변환이 불가능해 전체 내용을 텍스트 블록 1개에 담는 것으로 단순화한다.
interface UploadWorkEditorProps {
  categories: ProductCategory[];
  subCategories: ProductCategory[];
}

export function UploadWorkEditor({ categories, subCategories }: UploadWorkEditorProps) {
  return (
    <Suspense fallback={null}>
      <UploadWorkEditorInner categories={categories} subCategories={subCategories} />
    </Suspense>
  );
}

function UploadWorkEditorInner({
  categories,
  subCategories: subCategoryOptions,
}: UploadWorkEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const authUser = useRecoilValue(authUserAtom);
  const authLoading = useRecoilValue(authLoadingAtom);
  const profile = useRecoilValue(userProfileAtom);
  const { openAuthModal } = useAuth();
  const canSell = profile?.role === "seller" || profile?.role === "admin";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverMode, setCoverMode] = useState<"image" | "video-link">("image");
  const [coverVideoInput, setCoverVideoInput] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [description, setDescription] = useState("");

  const [productCategory, setProductCategory] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(productCategory);
  const [draftSubCategories, setDraftSubCategories] = useState<string[]>(subCategories);
  const categoryLabelMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.value, c.label])),
    [categories],
  );
  const subCategoryLabelMap = useMemo(
    () => Object.fromEntries(subCategoryOptions.map((c) => [c.value, c.label])),
    [subCategoryOptions],
  );
  const [productionSolution, setProductionSolution] = useState("");
  const [productCode, setProductCode] = useState("");
  const [designType, setDesignType] = useState("");
  const [hasAiStarterKit, setHasAiStarterKit] = useState(false);
  const [priceType, setPriceType] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState(0);
  const [supplyPrice, setSupplyPrice] = useState<number | null>(null);
  const [discountStartsAt, setDiscountStartsAt] = useState<string | null>(null);
  const [discountEndsAt, setDiscountEndsAt] = useState<string | null>(null);
  const [purchaseOptions, setPurchaseOptions] = useState<ProductOption[]>(() => [
    createEmptyPurchaseOption(),
  ]);
  const [codePreview, setCodePreview] = useState<ProductCodePreviewItem[]>(() => [
    createEmptyCodePreviewItem(),
  ]);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [newZipFile, setNewZipFile] = useState<File | null>(null);
  const [license, setLicense] = useState(DEFAULT_LICENSE);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [formatGuideOpen, setFormatGuideOpen] = useState(false);
  const [draftLicense, setDraftLicense] = useState(license);

  const [loadingProduct, setLoadingProduct] = useState(!!editId);
  const [submitting, setSubmitting] = useState<"draft" | "pending" | null>(null);
  // 서버(cms.api)가 "어떤 필드 때문에 실패했는지" 알려줄 때(예: slug 중복 409) 그 필드
  // 옆에 바로 표시하기 위한 상태 — 필드명(예: "slug")을 key로 메시지를 담는다.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await fetch(`/api/my-products/${editId}`);
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "상품 정보를 불러오지 못했습니다.");
        const product = data as SellerProduct;

        setTitle(product.name);
        setSlug(product.slug);
        setDescription(product.description ?? "");
        setProductCategory(product.category);
        setSubCategories(product.sub_categories ?? []);
        setProductionSolution(product.production_solution ?? "");
        setProductCode(product.product_code ?? "");
        setDesignType(product.design_type ?? "");
        setHasAiStarterKit(product.has_ai_starter_kit ?? false);
        setPriceType(product.price > 0 ? "paid" : "free");
        setPrice(product.price);
        setSupplyPrice(product.supply_price ?? null);
        setDiscountStartsAt(product.discount_starts_at ?? null);
        setDiscountEndsAt(product.discount_ends_at ?? null);
        setPurchaseOptions(
          product.purchase_options?.length
            ? product.purchase_options
            : [createEmptyPurchaseOption()],
        );
        setCodePreview(
          product.code_preview?.length ? product.code_preview : [createEmptyCodePreviewItem()],
        );
        setSiteUrl(product.demo_url ?? "");
        setCoverPreview(product.images?.[0] ?? product.thumbnail_url ?? null);
        setFilePath(product.file_path);
        setLicense(normalizeLicense(product.license ?? DEFAULT_LICENSE, product.price <= 0));
        // content_html은 리치 텍스트 부분까지 완전히 역변환할 수는 없어, 우리가 직접
        // 직렬화한 이미지/동영상 패턴만 블록으로 복원하고 나머지는 text 블록에 담는다.
        setBlocks(product.content_html ? parseContentBlocks(product.content_html) : []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "상품 정보를 불러오지 못했습니다.");
      } finally {
        setLoadingProduct(false);
      }
    })();
  }, [editId]);

  function handleSlugChange(value: string, isComposing: boolean) {
    setSlug(isComposing ? value : slugify(value));
    if (fieldErrors.slug) clearFieldError("slug");
  }

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handlePriceTypeChange(type: "free" | "paid") {
    setPriceType(type);
    if (type === "free") {
      setPrice(0);
      setLicense((prev) => normalizeLicense(prev, true));
    }
    if (type === "paid") {
      setNewZipFile(null);
      setFilePath(null);
    }
  }

  function toggleDraftSubCategory(value: string) {
    setDraftSubCategories((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= MAX_SUB_CATEGORIES) {
        toast.error(`소분류는 최대 ${MAX_SUB_CATEGORIES}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return [...prev, value];
    });
  }

  function addPurchaseOption() {
    setPurchaseOptions((prev) => [...prev, createEmptyPurchaseOption()]);
  }

  function updatePurchaseOption(index: number, patch: Partial<ProductOption>) {
    setPurchaseOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)));
  }

  function removePurchaseOption(index: number) {
    setPurchaseOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function addCodePreviewItem() {
    setCodePreview((prev) => [...prev, createEmptyCodePreviewItem()]);
  }

  function updateCodePreviewItem(index: number, patch: Partial<ProductCodePreviewItem>) {
    setCodePreview((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeCodePreviewItem(index: number) {
    setCodePreview((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newBlocks = files.map<ContentBlock>((file) => ({
      id: createId(),
      type: "image",
      url: URL.createObjectURL(file),
      file,
    }));
    setBlocks((prev) => [...prev, ...newBlocks]);
    e.target.value = "";
  }

  function addVideoLinkBlock() {
    setBlocks((prev) => [...prev, { id: createId(), type: "video" }]);
  }

  function updateVideoBlock(id: string, patch: Partial<ContentBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function resolveBlockVideoLink(id: string) {
    const block = blocks.find((b) => b.id === id);
    const value = block?.videoInput?.trim();
    if (!value || value === block?.lastResolvedInput) return;
    const info = await resolveVideoLink(value);
    if (!info) {
      toast.error("Youtube 또는 Vimeo 링크만 지원합니다.");
      return;
    }
    updateVideoBlock(id, { embedUrl: info.embedUrl, lastResolvedInput: value });
  }

  function addTextBlock() {
    setBlocks((prev) => [...prev, { id: createId(), type: "text", html: "" }]);
  }

  function updateTextBlock(id: string, html: string) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, html } : b)));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleCoverVideoBlur() {
    const value = coverVideoInput.trim();
    if (!value) return;
    const info = await resolveVideoLink(value);
    if (!info) {
      toast.error("Youtube 또는 Vimeo 링크만 지원합니다.");
      return;
    }
    setCoverFile(null);
    setCoverPreview(info.thumbnailUrl);
  }

  async function handleSubmit(status: "draft" | "pending") {
    if (submitting) return;
    if (!title.trim()) return toast.error("작품명을 입력해주세요.");
    if (!slug.trim()) return toast.error("슬러그를 입력해주세요.");
    if (!productCategory) return toast.error("카테고리를 선택해주세요.");
    if (priceType === "paid" && price <= 0) return toast.error("유료 상품은 가격을 입력해주세요.");
    if (
      discountStartsAt &&
      discountEndsAt &&
      new Date(discountEndsAt) <= new Date(discountStartsAt)
    ) {
      return toast.error("할인 종료 시각은 시작 시각보다 이후여야 합니다.");
    }

    setSubmitting(status);
    setFieldErrors({});
    try {
      // 동영상 링크는 onBlur(resolveBlockVideoLink/handleCoverVideoBlur)에서 비동기로
      // 확정되는데, 링크를 붙여넣자마자 곧바로 저장 버튼을 누르면 그 비동기 처리가 끝나기
      // 전에 여기서 상태를 읽어버릴 수 있다(blur의 await가 이 함수의 동기 실행보다 늦게
      // 끝나는 레이스). 그래서 blur 결과를 신뢰하지 않고 저장 시점에 다시 한번 직접
      // resolveVideoLink로 확정한다 — 이미지/zip을 매 제출마다 업로드하는 것과 동일한 원칙.
      let finalCoverUrl = coverPreview;
      if (coverMode === "video-link" && coverVideoInput.trim()) {
        const info = await resolveVideoLink(coverVideoInput.trim());
        if (!info)
          throw new Error("Youtube 또는 Vimeo 링크만 지원합니다. 표지 영상 링크를 확인해주세요.");
        finalCoverUrl = info.thumbnailUrl;
      } else if (coverFile) {
        finalCoverUrl = await uploadImage(coverFile);
      }

      const uploadedBlockUrls: Record<string, string> = {};
      const resolvedVideoEmbeds: Record<string, string> = {};
      for (const block of blocks) {
        if (block.type === "image" && block.file) {
          uploadedBlockUrls[block.id] = await uploadImage(block.file);
        }
        if (block.type === "video" && block.videoInput?.trim()) {
          const value = block.videoInput.trim();
          if (block.embedUrl && value === block.lastResolvedInput) {
            // 이미 blur 등으로 확정된 링크 — 저장할 때마다 다시 조회(특히 Vimeo oEmbed
            // 네트워크 호출)할 필요 없이 캐시된 embedUrl을 그대로 쓴다.
            resolvedVideoEmbeds[block.id] = block.embedUrl;
          } else {
            const info = await resolveVideoLink(value);
            if (!info) {
              throw new Error(
                "Youtube 또는 Vimeo 링크만 지원합니다. 동영상 블록의 링크를 확인해주세요.",
              );
            }
            resolvedVideoEmbeds[block.id] = info.embedUrl;
          }
        }
      }
      const contentHtml = blocks
        .map((block) => {
          if (block.type === "image") {
            const src = uploadedBlockUrls[block.id] ?? block.url ?? "";
            return src ? `<img src="${src}" alt="" />` : "";
          }
          if (block.type === "video") {
            const src = resolvedVideoEmbeds[block.id] ?? block.embedUrl;
            if (!src) return "";
            return `<div class="video-embed relative aspect-video w-full overflow-hidden rounded-xl bg-black"><iframe src="${src}" class="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" title="상품 소개 영상"></iframe></div>`;
          }
          return block.html ?? "";
        })
        .join("\n");

      let finalFilePath = filePath;
      if (newZipFile) finalFilePath = await uploadZip(newZipFile);

      const input: SellerProductInput = {
        status,
        slug,
        name: title,
        description,
        content_html: contentHtml,
        discount_starts_at: discountStartsAt,
        discount_ends_at: discountEndsAt,
        category: productCategory,
        sub_categories: subCategories,
        images: finalCoverUrl ? [finalCoverUrl] : [],
        demo_url: siteUrl,
        price,
        supply_price: supplyPrice,
        purchase_options: purchaseOptions,
        production_solution: productionSolution,
        product_code: productCode,
        design_type: designType,
        has_ai_starter_kit: hasAiStarterKit,
        file_path: finalFilePath,
        code_preview: codePreview,
        license: normalizeLicense(license, priceType === "free"),
      };

      const res = await fetch(editId ? `/api/my-products/${editId}` : "/api/my-products", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.field) setFieldErrors((prev) => ({ ...prev, [data.field]: data.error }));
        throw new Error(data?.error ?? "저장에 실패했습니다.");
      }

      toast.success(status === "draft" ? "임시저장했습니다." : "검수 요청을 제출했습니다.");
      router.push("/mypage/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(null);
    }
  }

  if (authLoading || loadingProduct) {
    return <div className="min-h-dvh bg-gf-bg" />;
  }

  if (!authUser) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gf-bg px-6 text-center">
        <p className="text-lg font-bold text-gf-black">로그인이 필요합니다</p>
        <p className="text-sm text-gf-gray2">작품을 업로드하려면 먼저 로그인해주세요.</p>
        <Button variant="default" onClick={() => openAuthModal("login")}>
          로그인
        </Button>
      </div>
    );
  }

  if (!canSell) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gf-bg px-6 text-center">
        <p className="text-lg font-bold text-gf-black">판매자 전용 기능입니다</p>
        <p className="text-sm text-gf-gray2">
          작품 업로드는 판매자로 등록된 계정만 이용할 수 있습니다.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          쇼핑몰로 돌아가기
        </Link>
      </div>
    );
  }

  const submitLabel = { draft: "저장 중...", pending: "제출 중..." } as const;

  return (
    <div className="min-h-dvh bg-gf-bg">
      <Suspense fallback={null}>
        <LayerSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </Suspense>

      <div className="flex min-h-dvh flex-col lg:pl-[220px]">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gf-border bg-gf-white px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="메뉴 열기"
              variant="ghost"
              size="icon-lg"
              className="rounded-full text-gf-gray2 lg:hidden"
            >
              <Menu width={18} height={18} />
            </Button>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              닫기
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={!!submitting} onClick={() => handleSubmit("draft")}>
              {submitting === "draft" ? submitLabel.draft : "초안저장"}
            </Button>
            <Button
              variant="default"
              disabled={!!submitting}
              onClick={() => handleSubmit("pending")}
            >
              {submitting === "pending" ? submitLabel.pending : "게시"}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-10">
          {/* 작업 파일 캔버스 — 상세 콘텐츠(content_html)로 직렬화됨 */}
          <div className="flex-1 rounded-2xl border border-gf-border bg-gf-white p-6 lg:p-8">
            {blocks.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 text-center">
                <p className="text-xl font-bold text-gf-black">작업 파일을 올려주세요</p>
                <div className="flex items-center gap-8">
                  <AddBlockButton
                    icon={ImageIcon}
                    label="이미지"
                    onClick={() => imageInputRef.current?.click()}
                  />
                  <AddBlockButton icon={VideoIcon} label="영상 링크" onClick={addVideoLinkBlock} />
                  <AddBlockButton icon={Type} label="에디터" onClick={addTextBlock} />
                </div>
                <button
                  type="button"
                  onClick={() => setFormatGuideOpen(true)}
                  className="inline-flex items-center gap-0.5 text-xs text-gf-gray2 hover:text-gf-black"
                >
                  지원 포맷, 코덱 자세히 보기
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className={cn(
                      "relative",
                      block.type !== "text" && "rounded-xl border border-gf-border p-3",
                    )}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      onClick={() => removeBlock(block.id)}
                      aria-label="블록 삭제"
                      className="absolute right-2 top-2 z-10 rounded-full bg-gf-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {block.type === "image" && block.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={block.url}
                        alt=""
                        className="max-h-80 w-full rounded-lg object-contain"
                      />
                    )}
                    {block.type === "video" && (
                      <div className="space-y-2">
                        <Input
                          value={block.videoInput ?? ""}
                          onChange={(e) =>
                            updateVideoBlock(block.id, { videoInput: e.target.value })
                          }
                          onBlur={() => resolveBlockVideoLink(block.id)}
                          placeholder="Youtube 또는 Vimeo 링크를 붙여넣으세요"
                          className="h-10 rounded-xl bg-gf-white"
                        />
                        {block.embedUrl && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <iframe
                              src={block.embedUrl}
                              className="absolute inset-0 h-full w-full"
                              allow="autoplay; encrypted-media; picture-in-picture"
                              allowFullScreen
                              title="영상 미리보기"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === "text" && (
                      <RichTextEditorLazy
                        value={block.html ?? ""}
                        onChange={(html) => updateTextBlock(block.id, html)}
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <AddBlockButton
                    icon={ImageIcon}
                    label="이미지"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  />
                  <AddBlockButton
                    icon={VideoIcon}
                    label="영상 링크"
                    size="sm"
                    onClick={addVideoLinkBlock}
                  />
                  <AddBlockButton icon={Type} label="에디터" size="sm" onClick={addTextBlock} />
                </div>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImagePick}
            />
          </div>

          {/* 작품 정보 */}
          <aside className="w-full shrink-0 space-y-6 lg:w-[360px]">
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                작품명 <span className="text-destructive">*</span>
              </h2>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="작품명을 입력하세요."
                className="h-10 rounded-xl bg-gf-white"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                슬러그(URL) <span className="text-destructive">*</span>
              </h2>
              <Input
                value={slug}
                onChange={(e) =>
                  handleSlugChange(e.target.value, (e.nativeEvent as InputEvent).isComposing)
                }
                onCompositionEnd={(e) => setSlug(slugify((e.target as HTMLInputElement).value))}
                placeholder="url-friendly-slug"
                aria-invalid={!!fieldErrors.slug}
                className="h-10 rounded-xl bg-gf-white font-mono"
              />
              <p className="text-xs text-gf-gray2">
                영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.
              </p>
              {fieldErrors.slug && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                카테고리 <span className="text-destructive">*</span>
              </h2>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-gf-border bg-gf-white px-4 py-3">
                <span
                  className={cn(
                    "truncate text-sm",
                    productCategory ? "text-gf-black" : "text-gf-gray2",
                  )}
                >
                  {productCategory
                    ? [
                        categoryLabelMap[productCategory] ?? productCategory,
                        ...subCategories.map((v) => subCategoryLabelMap[v] ?? v),
                      ].join(" · ")
                    : "카테고리를 선택해주세요."}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraftCategory(productCategory);
                    setDraftSubCategories(subCategories);
                    setCategoryDialogOpen(true);
                  }}
                  className="shrink-0 text-gf-orange"
                >
                  선택
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                판매 가격{" "}
                <span className="font-normal text-gf-gray2">
                  (할인 기간 내에만 적용, 종료 시 공급원가로 자동 복귀)
                </span>
              </h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={priceType === "free" ? "default" : "outline"}
                  size="sm"
                  className={cn("flex-1", priceType !== "free" && "bg-gf-white")}
                  onClick={() => handlePriceTypeChange("free")}
                >
                  무료 (FREE)
                </Button>
                <Button
                  type="button"
                  variant={priceType === "paid" ? "default" : "outline"}
                  size="sm"
                  className={cn("flex-1", priceType !== "paid" && "bg-gf-white")}
                  onClick={() => handlePriceTypeChange("paid")}
                >
                  유료
                </Button>
              </div>
              {priceType === "paid" && (
                <Input
                  type="text"
                  inputMode="numeric"
                  value={price === 0 ? "" : price.toLocaleString("ko-KR")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setPrice(raw === "" ? 0 : parseInt(raw, 10));
                  }}
                  placeholder="판매 가격 (원)"
                  className="h-10 rounded-xl bg-gf-white"
                />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                공급원가{" "}
                <span className="font-normal text-gf-gray2">(취소선 참고가, 미입력 시 숨김)</span>
              </h2>
              <Input
                type="text"
                inputMode="numeric"
                value={supplyPrice ? supplyPrice.toLocaleString("ko-KR") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setSupplyPrice(raw === "" ? null : parseInt(raw, 10));
                }}
                placeholder="예: 58,000"
                className="h-10 rounded-xl bg-gf-white"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                할인 기간 <span className="font-normal text-gf-gray2">(선택)</span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <DateTimeField
                  value={discountStartsAt}
                  onChange={setDiscountStartsAt}
                  placeholder="시작일"
                />
                <DateTimeField
                  value={discountEndsAt}
                  onChange={setDiscountEndsAt}
                  placeholder="종료일"
                />
              </div>
            </div>

            <PurchaseOptionEditor
              options={purchaseOptions}
              onAdd={addPurchaseOption}
              onUpdate={updatePurchaseOption}
              onRemove={removePurchaseOption}
            />

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">표지 업로드</h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={coverMode === "image" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCoverMode("image")}
                >
                  이미지 업로드
                </Button>
                <Button
                  type="button"
                  variant={coverMode === "video-link" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCoverMode("video-link")}
                >
                  Youtube/Vimeo 링크
                </Button>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gf-border bg-gf-white p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gf-bg">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPreview}
                      alt="표지 미리보기"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gf-gray2" />
                  )}
                </div>
                {coverMode === "image" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    표지 업로드
                  </Button>
                ) : (
                  <Input
                    value={coverVideoInput}
                    onChange={(e) => setCoverVideoInput(e.target.value)}
                    onBlur={handleCoverVideoBlur}
                    placeholder="Youtube 또는 Vimeo 링크 붙여넣기"
                    className="h-10 flex-1 rounded-xl bg-gf-white"
                  />
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverPick}
                />
              </div>
              <p className="text-xs text-gf-gray2">
                {coverMode === "image"
                  ? "권장 사이즈 1080x1350px (4:5 세로형) · JPG, PNG, WEBP"
                  : "링크를 붙여넣으면 영상 썸네일이 표지로 자동 적용됩니다."}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">제작솔루션</h2>
              <Input
                value={productionSolution}
                onChange={(e) => setProductionSolution(e.target.value)}
                placeholder="예: Supabase, Vercel"
                className="h-10 rounded-xl bg-gf-white"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">제품코드</h2>
              <Input
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="예: PTMD856024"
                className="h-10 rounded-xl bg-gf-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">디자인구분</h2>
              <Select value={designType} onValueChange={(value) => setDesignType(value ?? "")}>
                <SelectTrigger className="h-10 w-full rounded-xl bg-gf-white">
                  <SelectValue placeholder="디자인구분 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-gf-border bg-gf-white px-4 py-3">
              <Checkbox
                checked={hasAiStarterKit}
                onCheckedChange={(checked) => setHasAiStarterKit(checked === true)}
              />
              <span className="text-sm text-gf-black">AI 스타터 킷 포함</span>
            </label>

            {priceType === "free" && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-gf-black">다운로드 파일</h2>
                {(newZipFile || filePath) && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-gf-border bg-gf-white px-3 py-2 text-sm">
                    <span className="truncate text-gf-black">
                      {newZipFile ? newZipFile.name : filePath?.split("/").pop()}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        setNewZipFile(null);
                        setFilePath(null);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => zipInputRef.current?.click()}
                >
                  {newZipFile || filePath ? "파일 교체" : "파일 선택"}
                </Button>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setNewZipFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            <CodePreviewEditor
              items={codePreview}
              onAdd={addCodePreviewItem}
              onUpdate={updateCodePreviewItem}
              onRemove={removeCodePreviewItem}
            />

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">
                사이트URL <span className="font-normal text-gf-gray2">(선택)</span>
              </h2>
              <Input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="사이트 주소를 입력해주세요."
                className="h-10 rounded-xl bg-gf-white"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">설명</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="상품 설명을 입력하세요"
                rows={4}
                className={cn(
                  "w-full min-w-0 resize-none rounded-xl border border-input bg-gf-white px-3 py-2 text-sm outline-none transition-colors",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]",
                )}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gf-black">저작권 및 라이선스</h2>
              <div className="flex items-center justify-between rounded-xl border border-gf-border bg-gf-white px-4 py-3">
                <span className="text-sm text-gf-black">{getLicenseLabel(license)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraftLicense(license);
                    setLicenseDialogOpen(true);
                  }}
                  className="text-gf-orange"
                >
                  편집
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
        <DialogContent className="gap-5 p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">라이선스 설정</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {LICENSE_OPTIONS.map((option) => {
              const selected = option.value === draftLicense;
              // 무료 상품은 "구매 후 부여된 이용 범위"를 전제로 하는 판권소유 라이선스와
              // 정책상 양립할 수 없다 — FREE 선택 시 이 옵션만 선택 불가 처리한다.
              const disabled = priceType === "free" && option.value === "all-rights-reserved";
              return (
                <div
                  key={option.value}
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  onClick={() => {
                    if (disabled) return;
                    setDraftLicense(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDraftLicense(option.value);
                    }
                  }}
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-xl p-4",
                    selected ? "border-2 border-gf-orange" : "border border-gf-border",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  )}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-gf-black">
                      {option.label}
                      {disabled && (
                        <span className="ml-2 text-xs font-normal text-gf-gray2">
                          (무료 상품에는 적용 불가)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gf-gray1">{option.description}</p>
                  </div>
                  {selected && (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gf-orange text-white">
                      <Check className="size-4" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="bg-gf-white sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLicenseDialogOpen(false)}
              className="h-11 rounded-full bg-gf-bg px-6 font-bold text-gf-black hover:bg-gf-border"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={() => {
                setLicense(normalizeLicense(draftLicense, priceType === "free"));
                setLicenseDialogOpen(false);
              }}
              className="h-11 rounded-full px-6 font-bold"
            >
              선택
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="gap-5 p-6 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">카테고리 선택</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-[128px_1fr] overflow-hidden rounded-xl border border-gf-border">
            <div className="flex flex-col border-r border-gf-border bg-gf-bg py-2">
              {categories.map((c) => {
                const selected = c.value === draftCategory;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setDraftCategory(c.value)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium transition-colors",
                      selected ? "bg-gf-white text-gf-orange" : "text-gf-gray1 hover:bg-gf-white",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div className="max-h-[320px] space-y-2 overflow-y-auto bg-gf-white p-3">
              <p className="px-1 pb-1 text-base font-bold text-gf-black">
                업종 소분류{" "}
                <span className="text-gf-orange">
                  (최대 {MAX_SUB_CATEGORIES}개까지 선택 · {draftSubCategories.length}/
                  {MAX_SUB_CATEGORIES})
                </span>
              </p>
              {subCategoryOptions.map((sc) => {
                const selected = draftSubCategories.includes(sc.value);
                return (
                  <div
                    key={sc.value}
                    role="checkbox"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => toggleDraftSubCategory(sc.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleDraftSubCategory(sc.value);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl p-3",
                      selected ? "border-2 border-gf-orange" : "border border-gf-border",
                    )}
                  >
                    <span className="text-sm font-medium text-gf-black">{sc.label}</span>
                    {selected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gf-orange text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="bg-gf-white sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCategoryDialogOpen(false)}
              className="h-11 rounded-full bg-gf-bg px-6 font-bold text-gf-black hover:bg-gf-border"
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={!draftCategory}
              onClick={() => {
                setProductCategory(draftCategory);
                setSubCategories(draftSubCategories);
                setCategoryDialogOpen(false);
              }}
              className="h-11 rounded-full px-6 font-bold"
            >
              선택
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formatGuideOpen} onOpenChange={setFormatGuideOpen}>
        <DialogContent className="gap-5 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">업로드 가능한 파일 안내</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-gf-black">파일 포맷</h3>
              <p className="text-sm text-gf-gray1">이미지 JPG, PNG, WEBP</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-gf-black">최대 용량</h3>
              <p className="text-sm text-gf-gray1">이미지 20MB</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-gf-black">동영상</h3>
              <p className="text-sm text-gf-gray1">
                파일 업로드는 지원하지 않습니다. Youtube 또는 Vimeo에 영상을 올린 뒤 공유 링크를
                붙여넣어주세요.
              </p>
            </div>
            <p className="border-t border-gf-border pt-4 text-xs text-gf-gray2">
              위 형식 외의 이미지 파일은 업로드할 수 없습니다. 다른 형식의 이미지는 위 포맷으로
              변환한 뒤 업로드해주세요.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddBlockButton({
  icon: Icon,
  label,
  onClick,
  size = "default",
}: {
  icon: typeof ImageIcon;
  label: string;
  onClick: () => void;
  size?: "default" | "sm";
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-auto flex-col gap-2 rounded-none p-0 hover:bg-transparent"
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-gf-orange-bg text-gf-orange transition-colors group-hover/button:bg-gf-orange group-hover/button:text-white",
          size === "default" ? "h-16 w-16" : "h-11 w-11",
        )}
      >
        <Icon className={size === "default" ? "h-6 w-6" : "h-4 w-4"} />
      </span>
      <span className="text-xs font-semibold text-gf-gray2">{label}</span>
    </Button>
  );
}

function PurchaseOptionEditor({
  options,
  onAdd,
  onUpdate,
  onRemove,
}: {
  options: ProductOption[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProductOption>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gf-black">
          구매항목 <span className="font-normal text-gf-gray2">(비워두면 단일 가격으로 표시)</span>
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          항목 추가
        </Button>
      </div>
      <div className="space-y-3">
        {options.map((opt, index) => (
          <div
            key={opt.id}
            className="space-y-2 rounded-xl border border-gf-border bg-gf-white p-3"
          >
            <div className="flex items-center justify-between border-b border-gf-border pb-1">
              <span className="text-xs font-semibold text-gf-gray2">구매항목 {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="h-auto gap-1 px-2 py-1 text-xs text-gf-gray2 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> 삭제
              </Button>
            </div>
            <Input
              value={opt.label}
              onChange={(e) => onUpdate(index, { label: e.target.value })}
              placeholder="구매항목명 (예: 단순복사)"
              className="h-10 rounded-xl bg-gf-white"
            />
            <label className="flex items-center gap-2 text-xs text-gf-gray2">
              <Checkbox
                checked={opt.is_inquiry_only}
                onCheckedChange={(checked) =>
                  onUpdate(index, { is_inquiry_only: checked === true })
                }
              />
              별도 문의로 표시 (가격 대신 &quot;별도 문의&quot;로 노출)
            </label>
            {!opt.is_inquiry_only && (
              <Input
                type="text"
                inputMode="numeric"
                value={opt.price ? opt.price.toLocaleString("ko-KR") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  onUpdate(index, { price: raw === "" ? 0 : parseInt(raw, 10) });
                }}
                placeholder="판매 가격"
                className="h-10 rounded-xl bg-gf-white"
              />
            )}
            <Input
              value={opt.description ?? ""}
              onChange={(e) => onUpdate(index, { description: e.target.value })}
              placeholder="설명 (예: 디자인 수정작업 불포함)"
              className="h-10 rounded-xl bg-gf-white"
            />
            <Input
              value={
                typeof opt.work_period_days === "number"
                  ? String(opt.work_period_days)
                  : (opt.work_period_days ?? "")
              }
              onChange={(e) => onUpdate(index, { work_period_days: e.target.value || null })}
              placeholder="작업기간 (숫자 또는 협의)"
              className="h-10 rounded-xl bg-gf-white"
            />
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-gf-gray2">
            등록된 구매항목이 없습니다. &quot;항목 추가&quot;를 눌러 추가하세요.
          </p>
        )}
      </div>
    </div>
  );
}

// 할인 시작일/종료일 입력 — shadcn Calendar(react-day-picker)로 날짜를, 그 아래 시/분
// Select 2개로 시간을 고른다. macOS Safari의 <input type="time">은 OS 네이티브 피커라
// CSS로 꾸밀 수 없어서 이미 스타일이 잡혀 있는 Select로 대체했다. 값은 기존
// datetime-local과 동일한 "YYYY-MM-DDTHH:mm" 문자열로 합쳐 상위에 전달하므로 제출
// 로직(handleSubmit)은 그대로 둔다.
function DateTimeField({
  value,
  onChange,
  placeholder,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;
  const hour = value ? value.slice(11, 13) : "";
  const minute = value ? value.slice(14, 16) : "";

  function handleSelectDate(date: Date | undefined) {
    if (!date) return;
    onChange(`${format(date, "yyyy-MM-dd")}T${hour || "00"}:${minute || "00"}`);
    setOpen(false);
  }

  function handleChangeHour(next: string | null) {
    if (!selectedDate || !next) return;
    onChange(`${format(selectedDate, "yyyy-MM-dd")}T${next}:${minute || "00"}`);
  }

  function handleChangeMinute(next: string | null) {
    if (!selectedDate || !next) return;
    onChange(`${format(selectedDate, "yyyy-MM-dd")}T${hour || "00"}:${next}`);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-gf-white px-3 text-sm outline-none transition-colors",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]",
                !selectedDate && "text-muted-foreground",
              )}
            />
          }
        >
          <span className="truncate">
            {selectedDate ? format(selectedDate, "yyyy.MM.dd (EEE)", { locale: ko }) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-gf-gray2" />
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            locale={ko}
            className="bg-transparent p-3"
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-1.5">
        <Select value={hour || undefined} onValueChange={handleChangeHour} disabled={!selectedDate}>
          <SelectTrigger className="h-10 w-full flex-1 rounded-xl bg-gf-white">
            <SelectValue placeholder="시" />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gf-gray2">:</span>
        <Select
          value={minute || undefined}
          onValueChange={handleChangeMinute}
          disabled={!selectedDate}
        >
          <SelectTrigger className="h-10 w-full flex-1 rounded-xl bg-gf-white">
            <SelectValue placeholder="분" />
          </SelectTrigger>
          <SelectContent>
            {MINUTES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CodePreviewEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ProductCodePreviewItem[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProductCodePreviewItem>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gf-black">
          코드 미리보기{" "}
          <span className="font-normal text-gf-gray2">(비워두면 섹션이 표시되지 않음)</span>
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-3.5 w-3.5" />탭 추가
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="space-y-2 rounded-xl border border-gf-border bg-gf-white p-3"
          >
            <div className="flex items-center justify-between border-b border-gf-border pb-1">
              <span className="text-xs font-semibold text-gf-gray2">탭 {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="h-auto gap-1 px-2 py-1 text-xs text-gf-gray2 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> 삭제
              </Button>
            </div>
            <Input
              value={item.label}
              onChange={(e) => onUpdate(index, { label: e.target.value })}
              placeholder="탭 이름 = 파일명 (예: index.html)"
              className="h-10 rounded-xl bg-gf-white"
            />
            <textarea
              value={item.code}
              onChange={(e) => onUpdate(index, { code: e.target.value })}
              placeholder="실제 코드를 그대로 붙여넣으세요"
              rows={6}
              className={cn(
                "w-full min-w-0 resize-none rounded-xl border border-input bg-gf-white px-3 py-2 font-mono text-xs outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]",
              )}
            />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gf-gray2">
            등록된 코드 탭이 없습니다. &quot;탭 추가&quot;를 눌러 추가하세요.
          </p>
        )}
      </div>
    </div>
  );
}
