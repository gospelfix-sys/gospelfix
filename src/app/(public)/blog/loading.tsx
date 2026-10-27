// 상위 (public)/loading.tsx(홈 그리드 스켈레톤)를 물려받으면 /blog 진입 직전에 홈 레이아웃이
// 비친다. 블로그 셸과 같은 다크 배경만 두어 그 전환을 막는다.
export default function BlogListLoading() {
  return <div className="gf-dark min-h-dvh bg-gf-bg" />;
}
