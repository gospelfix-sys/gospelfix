// 블로그 상세는 상위 (public)/loading.tsx(마켓플레이스용 상품그리드 스켈레톤)를
// 물려받으면 카드 클릭 직후 전혀 다른 레이아웃이 잠깐 비쳤다가 모달로 바뀐다.
// 실제 상세 레이아웃(LayerShell 다크 단색 배경)과 같은 빈 배경만 두어 그 전환을 막는다.
export default function BlogDetailLoading() {
  return <div className="gf-dark min-h-dvh bg-gf-bg" />;
}
