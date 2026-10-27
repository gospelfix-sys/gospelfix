"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  createEmptyCodePreviewItem,
  createEmptyPurchaseOption,
  createId,
  normalizeLicense,
  parseContentBlocks,
  type ContentBlock,
} from "@/components/layer/upload/uploadEditorUtils";
import {
  DEFAULT_LICENSE,
  MAX_SUB_CATEGORIES,
  type ProductCategory,
  type ProductCodePreviewItem,
  type ProductOption,
  type SellerProduct,
} from "@/types/product.types";
import { slugify } from "@/lib/utils";
import { resolveVideoLink } from "@/lib/videoLink";

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
  // 서버(cms.api)가 "어떤 필드 때문에 실패했는지" 알려줄 때(예: slug 중복 409) 그 필드
  // 옆에 바로 표시하기 위한 상태 — 필드명(예: "slug")을 key로 메시지를 담는다.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    licenseDialogOpen,
    setLicenseDialogOpen,
    formatGuideOpen,
    setFormatGuideOpen,
    draftLicense,
    setDraftLicense,
    fieldErrors,
    setFieldErrors,
    handleSlugChange,
    handlePriceTypeChange,
    toggleDraftSubCategory,
    addPurchaseOption,
    updatePurchaseOption,
    removePurchaseOption,
    addCodePreviewItem,
    updateCodePreviewItem,
    removeCodePreviewItem,
    handleImagePick,
    addVideoLinkBlock,
    updateVideoBlock,
    resolveBlockVideoLink,
    addTextBlock,
    updateTextBlock,
    removeBlock,
    handleCoverPick,
    handleCoverVideoBlur,
  };
}

export type UploadWorkForm = ReturnType<typeof useUploadWorkForm>;
