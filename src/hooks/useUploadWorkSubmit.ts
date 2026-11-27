"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  normalizeLicense,
  serializeGallery,
  serializeImageTag,
  uploadImage,
  uploadZip,
} from "@/components/upload/uploadEditorUtils";
import {
  clearUploadedEditorImages,
  uploadEditorImages,
} from "@/components/rich-text/editorImages";
import type { UploadWorkForm } from "@/hooks/useUploadWorkForm";
import type { SellerProductInput } from "@/types/product.types";
import { generateRandomSlug } from "@/lib/utils";
import { resolveVideoLink } from "@/lib/videoLink";

// 작품 업로드 화면의 제출(초안저장/게시) 로직. 폼 상태는 useUploadWorkForm의 반환값을 받아 읽는다.
export function useUploadWorkSubmit(form: UploadWorkForm) {
  const router = useRouter();
  const {
    editId,
    blocks,
    title,
    slug,
    setSlug,
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
    allowCoupon,
    artDetails,
    priceType,
    price,
    supplyPrice,
    discountStartsAt,
    discountEndsAt,
    purchaseOptions,
    codePreview,
    infoChips,
    filePath,
    newZipFile,
    license,
    licenseAcknowledgement,
    loadedLicense,
    isCodeWork,
    setFieldErrors,
  } = form;

  const [submitting, setSubmitting] = useState<"draft" | "pending" | null>(null);

  async function handleSubmit(status: "draft" | "pending") {
    if (submitting) return;
    if (!title.trim()) return toast.error("작품명을 입력해주세요.");
    if (!slug.trim()) return toast.error("슬러그를 입력해주세요.");
    if (!productCategory) return toast.error("카테고리를 선택해주세요.");
    if (!license) return toast.error("저작권 및 라이선스를 선택해주세요.");
    if (license === "cc-by-nc-nd" && isCodeWork) {
      return toast.error("템플릿·코드 작품에는 변경금지(CC BY-NC-ND)를 선택할 수 없습니다.");
    }
    const isFree = priceType === "free";
    const finalLicense = normalizeLicense(license, isFree);
    // 동의 기록은 저장할 라이선스와 같을 때만 유효하다 — 유료 전환 시 상용 라이선스가 자동
    // 지정되는 등 모달을 거치지 않고 바뀐 라이선스는 동의를 받지 않은 상태다.
    const acknowledgement =
      licenseAcknowledgement?.license === finalLicense ? licenseAcknowledgement : null;
    // 수정 모드에서 저장돼 있던 라이선스를 그대로 두면 재동의를 강제하지 않는다. 기존 상품에는
    // 동의 기록이 없을 수 있지만 이번에 라이선스를 새로 확정한 것이 아니기 때문이다.
    // (예전에 CC로 저장된 유료 상품처럼 불러올 때 값이 바뀐 경우는 새로 확정하는 것이라 동의 필요)
    const keepsLoadedLicense = !!editId && loadedLicense === finalLicense;
    if (!acknowledgement && !keepsLoadedLicense) {
      return toast.error("저작권 및 라이선스를 열어 확인 항목에 동의해주세요.");
    }
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
          throw new Error("Youtube 또는 Vimeo 링크만 지원합니다. 섬네일 영상 링크를 확인해주세요.");
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
        if (block.type === "gallery") {
          for (const image of block.images ?? []) {
            if (image.file) uploadedBlockUrls[image.id] = await uploadImage(image.file);
          }
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
      // 텍스트 블록 안에 삽입한 이미지는 blob URL이라 저장 전에 업로드해 실제 URL로 바꾼다.
      const resolvedTextHtml: Record<string, string> = {};
      for (const block of blocks) {
        if (block.type === "text" && block.html) {
          resolvedTextHtml[block.id] = await uploadEditorImages(block.html, uploadImage);
        }
      }
      const contentHtml = blocks
        .map((block) => {
          if (block.type === "image") {
            const src = uploadedBlockUrls[block.id] ?? block.url ?? "";
            return src ? serializeImageTag(src) : "";
          }
          if (block.type === "gallery") {
            const images = (block.images ?? [])
              .map((image) => ({
                url: uploadedBlockUrls[image.id] ?? image.url,
                device: image.device,
              }))
              .filter((image) => image.url);
            return serializeGallery(images);
          }
          if (block.type === "video") {
            const src = resolvedVideoEmbeds[block.id] ?? block.embedUrl;
            if (!src) return "";
            return `<div class="video-embed relative aspect-video w-full overflow-hidden rounded-xl bg-black"><iframe src="${src}" class="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" title="상품 소개 영상"></iframe></div>`;
          }
          return resolvedTextHtml[block.id] ?? block.html ?? "";
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
        // 무료 상품은 해당 입력란을 숨기므로, 유료일 때 입력했다가 무료로 바꾼 값이 남아
        // 저장되지 않게 비워서 보낸다(상태는 지우지 않아 다시 유료로 바꾸면 복원된다).
        discount_starts_at: isFree ? null : discountStartsAt,
        discount_ends_at: isFree ? null : discountEndsAt,
        category: productCategory,
        sub_categories: subCategories,
        images: finalCoverUrl ? [finalCoverUrl] : [],
        demo_url: siteUrl,
        price,
        supply_price: isFree ? null : supplyPrice,
        purchase_options: isFree ? [] : purchaseOptions,
        production_solution: productionSolution,
        product_code: productCode,
        design_type: designType,
        has_ai_starter_kit: hasAiStarterKit,
        // 무료 상품에는 쿠폰이 의미가 없어, 유료일 때 켰다가 무료로 바꾼 값이 남지 않게 끈다
        allow_coupon: isFree ? false : allowCoupon,
        ...artDetails,
        file_path: finalFilePath,
        code_preview: codePreview,
        // 라벨·값이 둘 다 있는 행만 저장한다(빈 줄을 지우지 않고 둔 경우 대비)
        info_chips: infoChips
          .map((chip) => ({ id: chip.id, label: chip.label.trim(), value: chip.value.trim() }))
          .filter((chip) => chip.label && chip.value),
        license: finalLicense,
        // 없으면 키를 빼서(JSON 직렬화 시 제외) cms.api가 기존 동의 기록을 덮어쓰지 않게 한다.
        license_acknowledgement: acknowledgement ?? undefined,
      };

      const res = await fetch(editId ? `/api/my-products/${editId}` : "/api/my-products", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.field) setFieldErrors((prev) => ({ ...prev, [data.field]: data.error }));
        // 슬러그는 수정할 수 없어 중복(409)이 나면 사용자가 고칠 방법이 없다 — 새 값으로
        // 바꿔 두어 다시 저장하면 통과하게 한다(신규 등록만; 기존 상품 슬러그는 유지).
        if (!editId && data?.field === "slug") setSlug(generateRandomSlug());
        throw new Error(data?.error ?? "저장에 실패했습니다.");
      }

      clearUploadedEditorImages();
      // 수정 저장에 "검수 요청 제출"이라고 안내하면 매번 새로 심사받는 것처럼 읽혀 혼란스럽다.
      toast.success(
        status === "draft"
          ? "임시저장했습니다."
          : editId
            ? "상품이 수정되었습니다."
            : "검수 요청을 제출했습니다.",
      );
      router.push("/mypage/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(null);
    }
  }

  return { submitting, handleSubmit };
}
