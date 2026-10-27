"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { Button, buttonVariants } from "@/components/ui/button";
import { LayerSidebar } from "@/components/layer/LayerSidebar";
import { UploadEditorHeader } from "@/components/layer/upload/UploadEditorHeader";
import { UploadCanvas } from "@/components/layer/upload/UploadCanvas";
import { UploadInfoPanel } from "@/components/layer/upload/UploadInfoPanel";
import { LicenseDialog } from "@/components/layer/upload/LicenseDialog";
import { CategoryDialog } from "@/components/layer/upload/CategoryDialog";
import { FormatGuideDialog } from "@/components/layer/upload/FormatGuideDialog";
import { useAuth } from "@/hooks/useAuth";
import { useUploadWorkForm } from "@/hooks/useUploadWorkForm";
import { useUploadWorkSubmit } from "@/hooks/useUploadWorkSubmit";
import { authLoadingAtom, authUserAtom } from "@/store/atoms/authAtom";
import { userProfileAtom } from "@/store/atoms/userAtom";
import type { ProductCategory } from "@/types/product.types";

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

function UploadWorkEditorInner({ categories, subCategories }: UploadWorkEditorProps) {
  const authUser = useRecoilValue(authUserAtom);
  const authLoading = useRecoilValue(authLoadingAtom);
  const profile = useRecoilValue(userProfileAtom);
  const { openAuthModal } = useAuth();
  const canSell = profile?.role === "seller" || profile?.role === "admin";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const form = useUploadWorkForm({ categories, subCategories });
  const { submitting, handleSubmit } = useUploadWorkSubmit(form);

  if (authLoading || form.loadingProduct) {
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

  return (
    <div className="min-h-dvh bg-gf-bg">
      <Suspense fallback={null}>
        <LayerSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </Suspense>

      <div className="flex min-h-dvh flex-col lg:pl-[220px]">
        <UploadEditorHeader
          submitting={submitting}
          onOpenMenu={() => setMobileMenuOpen(true)}
          onSubmit={handleSubmit}
        />

        <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-10">
          <UploadCanvas
            blocks={form.blocks}
            onImagePick={form.handleImagePick}
            onAddVideoLinkBlock={form.addVideoLinkBlock}
            onAddTextBlock={form.addTextBlock}
            onUpdateVideoBlock={form.updateVideoBlock}
            onResolveBlockVideoLink={form.resolveBlockVideoLink}
            onUpdateTextBlock={form.updateTextBlock}
            onRemoveBlock={form.removeBlock}
            onOpenFormatGuide={() => form.setFormatGuideOpen(true)}
          />

          <UploadInfoPanel form={form} />
        </div>
      </div>

      <LicenseDialog
        open={form.licenseDialogOpen}
        onOpenChange={form.setLicenseDialogOpen}
        priceType={form.priceType}
        draftLicense={form.draftLicense}
        onDraftLicenseChange={form.setDraftLicense}
        onConfirm={form.setLicense}
      />

      <CategoryDialog
        open={form.categoryDialogOpen}
        onOpenChange={form.setCategoryDialogOpen}
        categories={form.categories}
        subCategoryOptions={form.subCategoryOptions}
        draftCategory={form.draftCategory}
        draftSubCategories={form.draftSubCategories}
        onDraftCategoryChange={form.setDraftCategory}
        onToggleDraftSubCategory={form.toggleDraftSubCategory}
        onConfirm={() => {
          form.setProductCategory(form.draftCategory);
          form.setSubCategories(form.draftSubCategories);
        }}
      />

      <FormatGuideDialog open={form.formatGuideOpen} onOpenChange={form.setFormatGuideOpen} />
    </div>
  );
}
