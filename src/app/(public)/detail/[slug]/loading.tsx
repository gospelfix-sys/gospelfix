// 상품 상세 직접 진입 시 상위 (public)/loading.tsx(마켓플레이스용 사이드바+상품그리드 스켈레톤)를
// 물려받으면 전혀 다른 레이아웃이 잠깐 비쳤다가 상세로 바뀐다.
// 실제 상세 레이아웃(bg-gf-bg 단색 배경)과 같은 빈 배경만 두어 그 전환을 막는다.
export default function ProductDetailLoading() {
  return <div className="bg-gf-bg min-h-screen" />;
}
