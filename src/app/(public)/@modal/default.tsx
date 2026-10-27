import { RouteModalLoadingPreload } from "@/components/ui/RouteModalLoading";

// 모달이 닫힌 상태의 @modal 슬롯. 화면에는 아무것도 그리지 않지만, 카드 클릭 시 @modal/loading이
// 쓸 클라이언트 청크를 미리 로드해 둔다(이유는 RouteModalLoadingPreload 주석 참고).
export default function Default() {
  return <RouteModalLoadingPreload />;
}
