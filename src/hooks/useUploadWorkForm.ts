"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import {
  createEmptyCodePreviewItem,
  createEmptyPurchaseOption,
  createId,
  getImageSizeError,
  normalizeLicense,
  parseContentBlocks,
  type ContentBlock,
  type GalleryDevice,
  type GalleryImage,
} from "@/components/upload/uploadEditorUtils";
import {
  EMPTY_ART_DETAILS,
  MAX_SUB_CATEGORIES,
  type ArtDetails,
  type LicenseAcknowledgement,
  type ProductCategory,
  type ProductCodePreviewItem,
  type ProductOption,
  type SellerProduct,
} from "@/types/product.types";
import { generateProductCode, generateRandomSlug } from "@/lib/utils";
import { resolveVideoLink } from "@/lib/videoLink";

function createGalleryImage(file: File): GalleryImage {
  return { id: createId(), url: URL.createObjectURL(file), device: "desktop", file };
}

interface UseUploadWorkFormOptions {
  categories: ProductCategory[];
  subCategories: ProductCategory[];
}

// 작품 업로드 화면의 폼 상태·편집 모드 데이터 로딩·필드별 핸들러 모음.
// 제출 로직은 useUploadWorkSubmit에서 이 훅의 반환값을 받아 처리한다.
export function useUploadWorkForm({
  categories,
  subCategories: subCategoryOptions,
}: UseUploadWorkFormOptions) {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

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
  // 판매자가 켠 상품만 구매자가 쿠폰을 쓸 수 있다(기본 꺼짐)
  const [allowCoupon, setAllowCoupon] = useState(false);
  // "미술·전시" 탭 입력값 10개를 한 객체로 들고 있다 — 필드마다 useState를 늘리지 않으려는 의도
  const [artDetails, setArtDetails] = useState<ArtDetails>(EMPTY_ART_DETAILS);
  function setArtDetail<K extends keyof ArtDetails>(key: K, value: ArtDetails[K]) {
    setArtDetails((prev) => ({ ...prev, [key]: value }));
  }
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
  const [license, setLicense] = useState("");
  // 이번 편집에서 라이선스 모달로 받은 동의 기록. 서버의 기존 기록은 불러오지 않는다.
  const [licenseAcknowledgement, setLicenseAcknowledgement] =
    useState<LicenseAcknowledgement | null>(null);
  // 수정 모드에서 서버에 저장돼 있던 라이선스 원본값(정규화 전). 이 값을 그대로 다시 저장하면
  // 라이선스를 새로 확정한 게 아니므로 재동의를 요구하지 않는다(useUploadWorkSubmit 참고).
  const [loadedLicense, setLoadedLicense] = useState<string | null>(null);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [formatGuideOpen, setFormatGuideOpen] = useState(false);
  const [draftLicense, setDraftLicense] = useState(license);

  const [loadingProduct, setLoadingProduct] = useState(!!editId);
  // 서버(cms.api)가 "어떤 필드 때문에 실패했는지" 알려줄 때(예: slug 중복 409) 그 필드
  // 옆에 바로 표시하기 위한 상태 — 필드명(예: "slug")을 key로 메시지를 담는다.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 신규 등록일 때만 슬러그를 랜덤 숫자로 채운다. 마운트 후에 채우는 이유는 SSR 결과와
  // 클라이언트 초기값이 달라 hydration 경고가 나지 않게 하기 위해서다.
  useEffect(() => {
    if (editId) return;
    setSlug((prev) => prev || generateRandomSlug());
    setProductCode((prev) => prev || generateProductCode());
  }, [editId]);

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
        // 기존 상품은 저장된 코드를 유지하고, 코드가 없던 상품만 새로 부여한다.
        setProductCode(product.product_code || generateProductCode());
        setDesignType(product.design_type ?? "");
        setHasAiStarterKit(product.has_ai_starter_kit ?? false);
        setAllowCoupon(product.allow_coupon ?? false);
        setArtDetails({
          artwork_size: product.artwork_size ?? "",
          artwork_medium: product.artwork_medium ?? "",
          artwork_year: product.artwork_year ?? "",
          exhibition_title: product.exhibition_title ?? "",
          exhibition_period: product.exhibition_period ?? "",
          exhibition_venue: product.exhibition_venue ?? "",
          exhibition_artists: product.exhibition_artists ?? "",
          edition_type: product.edition_type ?? "",
          edition_size: product.edition_size ?? "",
          frame_included: product.frame_included ?? false,
        });
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
        setLoadedLicense(product.license ?? "");
        setLicense(normalizeLicense(product.license ?? "", product.price <= 0));
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

  // 코드 미리보기나 AI 스타터 킷이 있으면 수정해서 쓰는 템플릿·코드 작품으로 본다 —
  // 이런 작품에는 변경금지(ND) 라이선스가 맞지 않아 선택을 막는다.
  const isCodeWork = hasAiStarterKit || codePreview.some((item) => item.code.trim() !== "");

  function confirmLicense(value: string, acknowledgement: LicenseAcknowledgement) {
    setLicense(value);
    setLicenseAcknowledgement(acknowledgement);
  }

  function handlePriceTypeChange(type: "free" | "paid") {
    setPriceType(type);
    if (type === "free") {
      setPrice(0);
      setLicense((prev) => normalizeLicense(prev, true));
    }
    if (type === "paid") {
      setLicense((prev) => normalizeLicense(prev, false));
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
    e.target.value = "";
    if (files.length === 0) return;
    // 한 번에 2장 이상 고르면 상세페이지에서 좌우 슬라이더가 되는 gallery 블록 하나로 묶는다.
    if (files.length >= 2) {
      setBlocks((prev) => [
        ...prev,
        { id: createId(), type: "gallery", images: files.map(createGalleryImage) },
      ]);
      return;
    }
    setBlocks((prev) => [
      ...prev,
      { id: createId(), type: "image", url: URL.createObjectURL(files[0]), file: files[0] },
    ]);
  }

  function addGalleryImages(blockId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, images: [...(b.images ?? []), ...files.map(createGalleryImage)] }
          : b,
      ),
    );
  }

  function setGalleryImageDevice(blockId: string, imageId: string, device: GalleryDevice) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              images: (b.images ?? []).map((img) =>
                img.id === imageId ? { ...img, device } : img,
              ),
            }
          : b,
      ),
    );
  }

  // 묶음 안에서 드래그가 끝난 자리로 사진을 옮긴다. 상세페이지 슬라이더 순서가 이 순서를 따른다.
  function reorderGalleryImages(blockId: string, activeId: string, overId: string) {
    if (activeId === overId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const images = b.images ?? [];
        const from = images.findIndex((img) => img.id === activeId);
        const to = images.findIndex((img) => img.id === overId);
        if (from < 0 || to < 0) return b;
        return { ...b, images: arrayMove(images, from, to) };
      }),
    );
  }

  function removeGalleryImage(blockId: string, imageId: string) {
    setBlocks((prev) =>
      prev.flatMap((b) => {
        if (b.id !== blockId) return [b];
        const images = (b.images ?? []).filter((img) => img.id !== imageId);
        // 마지막 사진까지 지우면 빈 묶음이 남지 않게 블록째 제거한다.
        return images.length === 0 ? [] : [{ ...b, images }];
      }),
    );
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

  // 블록을 한 칸 위/아래로 옮긴다. 맨 위·맨 아래에서 더 못 가는 방향은 무시한다.
  function moveBlock(id: string, direction: "up" | "down") {
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === id);
      const to = direction === "up" ? from - 1 : from + 1;
      if (from < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  // 드래그가 끝난 자리로 블록을 옮긴다. 제자리에 놓았거나 대상이 없으면 무시한다.
  function reorderBlocks(activeId: string, overId: string) {
    if (activeId === overId) return;
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === activeId);
      const to = prev.findIndex((b) => b.id === overId);
      if (from < 0 || to < 0) return prev;
      return arrayMove(prev, from, to);
    });
  }

  function handleCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeError = getImageSizeError(file);
    if (sizeError) {
      toast.error(sizeError);
      e.target.value = "";
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  // 섬네일을 비운다. 영상 링크 입력이 남아 있으면 저장 시 다시 썸네일로 확정되므로 함께 비운다.
  function handleCoverRemove() {
    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
    setCoverVideoInput("");
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

  return {
    categories,
    subCategoryOptions,
    editId,
    loadingProduct,
    blocks,
    title,
    setTitle,
    slug,
    setSlug,
    coverPreview,
    coverFile,
    coverMode,
    setCoverMode,
    coverVideoInput,
    setCoverVideoInput,
    siteUrl,
    setSiteUrl,
    description,
    setDescription,
    productCategory,
    setProductCategory,
    subCategories,
    setSubCategories,
    categoryDialogOpen,
    setCategoryDialogOpen,
    draftCategory,
    setDraftCategory,
    draftSubCategories,
    setDraftSubCategories,
    categoryLabelMap,
    subCategoryLabelMap,
    productionSolution,
    setProductionSolution,
    productCode,
    setProductCode,
    designType,
    setDesignType,
    hasAiStarterKit,
    setHasAiStarterKit,
    allowCoupon,
    setAllowCoupon,
    artDetails,
    setArtDetail,
    priceType,
    price,
    setPrice,
    supplyPrice,
    setSupplyPrice,
    discountStartsAt,
    setDiscountStartsAt,
    discountEndsAt,
    setDiscountEndsAt,
    purchaseOptions,
    codePreview,
    filePath,
    setFilePath,
    newZipFile,
    setNewZipFile,
    license,
    setLicense,
    licenseAcknowledgement,
    loadedLicense,
    confirmLicense,
    isCodeWork,
    licenseDialogOpen,
    setLicenseDialogOpen,
    formatGuideOpen,
    setFormatGuideOpen,
    draftLicense,
    setDraftLicense,
    fieldErrors,
    setFieldErrors,
    handlePriceTypeChange,
    toggleDraftSubCategory,
    addPurchaseOption,
    updatePurchaseOption,
    removePurchaseOption,
    addCodePreviewItem,
    updateCodePreviewItem,
    removeCodePreviewItem,
    handleImagePick,
    addGalleryImages,
    setGalleryImageDevice,
    removeGalleryImage,
    reorderGalleryImages,
    addVideoLinkBlock,
    updateVideoBlock,
    resolveBlockVideoLink,
    addTextBlock,
    updateTextBlock,
    removeBlock,
    moveBlock,
    reorderBlocks,
    handleCoverPick,
    handleCoverRemove,
    handleCoverVideoBlur,
  };
}

export type UploadWorkForm = ReturnType<typeof useUploadWorkForm>;
