import { UploadEditorSkeleton } from "@/components/upload/UploadEditorSkeleton";

// 상위 세그먼트의 src/app/(public)/loading.tsx는 LayerShell(사이드바+상품 목록
// 그리드) 스켈레톤이라 LayerShell을 쓰지 않는 이 전용 전체화면 에디터(page.tsx 주석 참고)와
// 레이아웃이 완전히 달라, 그대로 fallback으로 쓰이면 "엉뚱한 화면이 떴다가 확 바뀌는" 전환이
// 생긴다. 에디터와 같은 치수의 전용 스켈레톤을 둔다(에디터 내부 로딩 단계와 공유).
export default function LayerUploadLoading() {
  return <UploadEditorSkeleton />;
}
