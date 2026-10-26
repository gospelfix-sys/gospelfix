// @modal 슬롯(블로그·상품 상세 인터셉트 모달)은 데이터 fetch 중 상위 (public)/loading.tsx
// (마켓플레이스용 사이드바+상품그리드 스켈레톤)를 fallback으로 물려받아, 카드 클릭 직후 사이드바가
// 레이아웃의 {modal} 자리에 잠깐 노출됐다. 모달은 열리기 전까지 아무것도 그리지 않는 게 맞으므로
// 슬롯 전용 loading을 비워 그 fallback을 차단한다.
export default function ModalLoading() {
  return null;
}
