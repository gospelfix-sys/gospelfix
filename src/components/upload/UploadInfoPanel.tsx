"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { PurchaseOptionEditor } from "@/components/upload/PurchaseOptionEditor";
import { PriceFields } from "@/components/upload/PriceFields";
import { CoverUploadField } from "@/components/upload/CoverUploadField";
import { UploadCategoryTabs } from "@/components/upload/UploadCategoryTabs";
import type { UploadWorkForm } from "@/hooks/useUploadWorkForm";
import { getLicenseLabel } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface UploadInfoPanelProps {
  form: UploadWorkForm;
}

// 작품 정보 — 상단은 모든 분야 공통 항목, 하단은 분야별 상세 탭
export function UploadInfoPanel({ form }: UploadInfoPanelProps) {
  const {
    title,
    setTitle,
    slug,
    fieldErrors,
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
    allowCoupon,
    setAllowCoupon,
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
    handleCoverRemove,
    handleCoverVideoBlur,
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
          슬러그(URL) <span className="text-destructive">*</span>{" "}
          <span className="font-normal text-gf-gray2">자동 생성</span>
        </h2>
        <Input
          value={slug}
          disabled
          readOnly
          placeholder="url-friendly-slug"
          aria-invalid={!!fieldErrors.slug}
          className="h-10 rounded-xl bg-gf-white font-mono"
        />
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
        allowCoupon={allowCoupon}
        onAllowCouponChange={setAllowCoupon}
      />

      {/* 무료 상품은 구매항목이 필요 없어 유료일 때만 보인다 */}
      {priceType === "paid" && (
        <CollapsibleSection
          title={
            <>
              구매항목 <span className="font-normal text-gf-gray2">(선택)</span>
            </>
          }
          hasValue={purchaseOptions.some(
            (option) => option.label.trim() || option.price || option.description?.trim(),
          )}
        >
          <PurchaseOptionEditor
            options={purchaseOptions}
            onAdd={addPurchaseOption}
            onUpdate={updatePurchaseOption}
            onRemove={removePurchaseOption}
          />
        </CollapsibleSection>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gf-black">
          저작권 및 라이선스 <span className="text-destructive">*</span>
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-gf-border bg-gf-white px-4 py-3">
          <span className={cn("text-sm", license ? "text-gf-black" : "text-gf-gray2")}>
            {getLicenseLabel(license) ?? "라이선스를 선택해주세요."}
          </span>
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
            {license ? "편집" : "선택"}
          </Button>
        </div>
      </div>

      <CoverUploadField
        coverMode={coverMode}
        coverPreview={coverPreview}
        coverVideoInput={coverVideoInput}
        onCoverModeChange={setCoverMode}
        onCoverVideoInputChange={setCoverVideoInput}
        onCoverPick={handleCoverPick}
        onCoverRemove={handleCoverRemove}
        onCoverVideoBlur={handleCoverVideoBlur}
      />

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

      <UploadCategoryTabs form={form} />
    </aside>
  );
}
