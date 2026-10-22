// /layer(에이전시 랜딩)는 사이드바 없는 풀스크린 히어로 페이지라, 상위 (public)/loading.tsx
// (마켓플레이스용 사이드바+캐러셀+상품그리드 스켈레톤)를 그대로 물려받으면 완전히 다른
// 레이아웃이 잠깐 나타났다 사라지는 전환이 생긴다. 이 페이지는 데이터 fetch가 끝날 때까지
// 전체가 한 번에 렌더되므로(내부 Suspense 스트리밍 없음), 히어로+추천 대상 섹션의 치수만
// 동일하게 맞춘 전용 스켈레톤을 둔다.
export default function LayerLoading() {
  return (
    <div className="flex flex-col">
      <section className="min-h-[100vh] flex flex-col items-center justify-center gap-8 px-6 pt-28 pb-12">
        <div className="h-9 w-72 max-w-full rounded-full bg-gray-200 animate-pulse" />
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-14 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="h-14 w-64 rounded bg-gray-200 animate-pulse" />
          <div className="h-14 w-40 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-64 max-w-full rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-12 w-32 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-12 w-36 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </section>

      <section className="px-6 pt-20 pb-24 bg-white border-b border-gf-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-2 mb-12">
            <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-7 w-64 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl border border-gf-border bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
