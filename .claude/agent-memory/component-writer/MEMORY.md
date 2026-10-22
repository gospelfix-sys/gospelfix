# MEMORY.md

- [main→cms.api 마이그레이션 (주문/리뷰/견적/다운로드)](main-cms-api-migration.md) — 새 파일 위치, `/auth/me`에 created_at 없는 이슈, 미삭제 파일 목록
- [Bash 도구 부재 시 검증/삭제 방법](no-bash-tool-verify-manually.md) — tsc/grep/rm 불가 시 소스 직접 대조 및 사용자 안내로 대체
- [활성(active) Tab/Button 보더 규칙](active_state_border.md) — bg-gf-orange-bg+text-gf-orange일 때 border-gf-orange 1px도 함께 (오렌지 pill이 활성상태 전용이 아닌 강조 버튼 스타일로도 재사용됨, 2026-08-25 갱신)
- [mypage 공용 레이아웃 컨벤션](mypage_shared_layout_conventions.md) — max-width가 DashboardHeader.tsx/(mypage)/layout.tsx 두 파일에 나뉘어 있어 함께 동기화 필요 + 다중 진입 경로 페이지는 router.back() 사용 (실제 구현 diff 리뷰로 APPROVED 확인, 2026-08-25)
- [Button size별 모서리 반경](button_radius_uniform_rounded_lg.md) — default/lg/icon/icon-lg는 rounded-lg(16px), sm/xs/icon-sm/icon-xs는 rounded-sm(8px, 낮은 높이에서 pill화 방지) (2026-08-26 최종 확정)
