import { Metadata } from "next";
import { UploadWorkEditor } from "@/components/layer/UploadWorkEditor";
import { getProductCategories } from "@/lib/api/categories";
import { getProductSubCategories } from "@/lib/api/subCategories";

export const metadata: Metadata = {
  title: "작품 업로드 | 모다(MODA)",
};

// LayerShell(사이드바+상단바)을 쓰지 않는 전용 전체화면 에디터 — 참고 레퍼런스(webjangi.com
// 업로드 화면)와 동일하게 자체 상단바(닫기/미리보기/초안저장/게시)만 갖는다.
export default async function LayerUploadPage() {
  const [categories, subCategories] = await Promise.all([
    getProductCategories(),
    getProductSubCategories(),
  ]);
  return <UploadWorkEditor categories={categories} subCategories={subCategories} />;
}
