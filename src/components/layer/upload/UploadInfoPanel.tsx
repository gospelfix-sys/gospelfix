"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseOptionEditor } from "@/components/layer/upload/PurchaseOptionEditor";
import { CodePreviewEditor } from "@/components/layer/upload/CodePreviewEditor";
import { PriceFields } from "@/components/layer/upload/PriceFields";
import { CoverUploadField } from "@/components/layer/upload/CoverUploadField";
import { DownloadFileField } from "@/components/layer/upload/DownloadFileField";
import { DESIGN_TYPES } from "@/components/layer/upload/uploadEditorUtils";
import type { UploadWorkForm } from "@/hooks/useUploadWorkForm";
import { getLicenseLabel } from "@/types/product.types";
import { cn, slugify } from "@/lib/utils";

interface UploadInfoPanelProps {
  form: UploadWorkForm;
}

// 작품 정보
export function UploadInfoPanel({ form }: UploadInfoPanelProps) {
  const {
    title,
    setTitle,
    slug,
    setSlug,
    fieldErrors,
    handleSlugChange,
    productCategory,
    subCategories,
    categoryLabelMap,
    subCategoryLabelMap,
    setDraftCategory,
    setDraftSubCategories,
    setCategoryDialogOpen,
    priceType,
    price,
    setPrice,
    supplyPrice,
    setSupplyPrice,
    discountStartsAt,
    setDiscountStartsAt,
    discountEndsAt,
    setDiscountEndsAt,
    handlePriceTypeChange,
    purchaseOptions,
    addPurchaseOption,
    updatePurchaseOption,
    removePurchaseOption,
    coverMode,
    setCoverMode,
    coverPreview,
    coverVideoInput,
    setCoverVideoInput,
    handleCoverPick,
    handleCoverVideoBlur,
    productionSolution,
    setProductionSolution,
    productCode,
    setProductCode,
    designType,
    setDesignType,
    hasAiStarterKit,
    setHasAiStarterKit,
    newZipFile,
    setNewZipFile,
    filePath,
    setFilePath,
    codePreview,
    addCodePreviewItem,
    updateCodePreviewItem,
    removeCodePreviewItem,
    siteUrl,
    setSiteUrl,
    description,
    setDescription,
    license,
    setDraftLicense,
    setLicenseDialogOpen,
  } = form;

  return (
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
        <p className="text-xs text-gf-gray2">영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.</p>
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
            className={cn("truncate text-sm", productCategory ? "text-gf-black" : "text-gf-gray2")}
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

      <PriceFields
        priceType={priceType}
        price={price}
        supplyPrice={supplyPrice}
        discountStartsAt={discountStartsAt}
        discountEndsAt={discountEndsAt}
        onPriceTypeChange={handlePriceTypeChange}
        onPriceChange={setPrice}
        onSupplyPriceChange={setSupplyPrice}
        onDiscountStartsAtChange={setDiscountStartsAt}
        onDiscountEndsAtChange={setDiscountEndsAt}
      />

      <PurchaseOptionEditor
        options={purchaseOptions}
        onAdd={addPurchaseOption}
        onUpdate={updatePurchaseOption}
        onRemove={removePurchaseOption}
      />

      <CoverUploadField
        coverMode={coverMode}
        coverPreview={coverPreview}
        coverVideoInput={coverVideoInput}
        onCoverModeChange={setCoverMode}
        onCoverVideoInputChange={setCoverVideoInput}
        onCoverPick={handleCoverPick}
        onCoverVideoBlur={handleCoverVideoBlur}
      />

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
        <DownloadFileField
          newZipFile={newZipFile}
          filePath={filePath}
          onZipPick={setNewZipFile}
          onZipClear={() => {
            setNewZipFile(null);
            setFilePath(null);
          }}
        />
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
  );
}
