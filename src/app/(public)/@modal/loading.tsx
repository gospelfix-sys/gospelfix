import { RouteModalLoading } from "@/components/ui/RouteModalLoading";

// @modal 슬롯(블로그·상품 상세 인터셉트 모달)에 전용 loading이 없으면 상위 (public)/loading.tsx
// (마켓플레이스용 사이드바+상품그리드 스켈레톤)를 fallback으로 물려받아, 카드 클릭 직후 사이드바가
// 레이아웃의 {modal} 자리에 노출된다. 그래서 슬롯 전용 loading을 두되, 예전처럼 null을 반환하면
// 상품 상세 fetch가 느릴 때 클릭 후 아무 반응이 없으므로 RouteModal과 같은 backdrop + 패널을
// 즉시 띄우고 그 안에 스켈레톤을 둔다. RouteModal이 진행값을 이어받아 교체 순간 깜빡이지 않는다.
export default function ModalLoading() {
  return <RouteModalLoading />;
}
