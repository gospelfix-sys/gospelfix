---
name: layoutid-scroll-lock-pitfalls
description: RouteModal 스크롤 잠금(body fixed) 해제와 겹친 재렌더가 layoutId 요소를 scrollY만큼 세로 보간하는 함정, 인터셉트 모달 중 useSearchParams가 목록 쿼리를 잃는 함정
metadata:
  type: project
---

2026-11-17 홈 SortTabs 알약이 상세 모달 닫힘 직후 위에서 내려오던 버그(브라우저 재현·검증 완료).

1. 원인 A: 닫기 → router.back() → URL 변경으로 layout/layoutId 요소가 재렌더되는데, 스냅샷 시점엔 body가 아직 `position:fixed; top:-scrollY`(RouteModal 잠금)라 페이지 좌표가 scrollY만큼 위로 측정된다. 같은 커밋에서 cleanup이 잠금 해제 + scrollTo → 차이(=scrollY)가 세로 layout 애니메이션으로 재생된다. DOM은 교체되지 않는다(loading↔page 교체 가설은 틀렸음).
   **How to apply:** 홈 목록(모달 뒤에 남는 화면)의 layout/layoutId 요소에는 `layoutDependency`를 줘서 의도한 상태 변화 때만 측정하게 한다. 증상의 이동량이 scrollY와 같으면 이 원인이다.

2. 원인 B: 인터셉트 모달이 열린 동안 usePathname/useSearchParams는 `/detail/...` 기준이라 목록의 쿼리(sort 등)가 사라진다. URL 파생 활성 상태가 모달 뒤에서 기본값으로 바뀌었다가 닫힐 때 돌아오며 진짜 전환 애니메이션이 재생된다. SortTabs는 마운트 시 경로를 기억하고 그 경로일 때만 URL 값을 따르게 했다.
   **How to apply:** 목록 화면에서 URL 쿼리로 활성 상태를 그리는 컴포넌트(카테고리 필터 등)에 모션을 붙일 때 같은 패턴을 확인한다.

관련: [[section-toggle-motion]], [[route-modal-loading-pitfalls]]
