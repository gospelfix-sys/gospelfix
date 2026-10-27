"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  normalizeLicense,
  uploadImage,
  uploadZip,
} from "@/components/layer/upload/uploadEditorUtils";
import type { UploadWorkForm } from "@/hooks/useUploadWorkForm";
import type { SellerProductInput } from "@/types/product.types";
import { resolveVideoLink } from "@/lib/videoLink";

// 작품 업로드 화면의 제출(초안저장/게시) 로직. 폼 상태는 useUploadWorkForm의 반환값을 받아 읽는다.
export function useUploadWorkSubmit(form: UploadWorkForm) {
  const router = useRouter();
  const {
    editId,
    blocks,
    title,
    slug,
    coverPreview,
    coverFile,
    coverMode,
    coverVideoInput,
    siteUrl,
    description,
    productCategory,
    subCategories,
    productionSolution,
    productCode,
    designType,
    hasAiStarterKit,
    priceType,
    price,
    supplyPrice,
    discountStartsAt,
    discountEndsAt,
    purchaseOptions,
    codePreview,
    filePath,
    newZipFile,
    license,
    setFieldErrors,
  } = form;

  const [submitting, setSubmitting] = useState<"draft" | "pending" | null>(null);

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

  return { submitting, handleSubmit };
}
