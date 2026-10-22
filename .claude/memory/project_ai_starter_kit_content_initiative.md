---
name: project_ai_starter_kit_content_initiative
description: "Claude Folder Setup" 콘텐츠를 GOSPELFIX Mall 콘텐츠/상품 전략에 녹여내는 진행 중 이니셔티브 — 블로그 초안·About 섹션·has_ai_starter_kit 상품 플래그 현황
metadata:
  type: project
---

외부 "Claude Folder Setup"(LeadGenMan) 리드마그넷 페이지의 `.claude/` 워크플로우
콘텐츠를 GOSPELFIX Mall(Next.js 템플릿 마켓플레이스)의 콘텐츠 마케팅/상품 차별화에
녹여내는 이니셔티브. 2026-08-11 세션에서 기획 → 실행까지 진행됨.

## 현재 상태 (2026-08-11 기준)

**Phase 1 — 블로그 아티클 + About 섹션 (완료, 발행 대기)**
- cms.api `news` 테이블에 draft로 등록됨: `id: 2668b03e-2a34-4da9-9ea7-94df9e57e69e`,
  `slug: claude-code-project-setup`, `category: AI 활용`, `is_published: false`.
  cms.api 어드민(`/blog`)에서 검토 후 발행 필요 — 썸네일 이미지도 비어있음.
- gospelfix `(public)/about/page.tsx`에 "AI 개발 방식" 섹션 추가, CTA가
  `/blog/claude-code-project-setup`로 연결됨 — **블로그 글이 발행되기 전까지 이 링크는
  404**.

**Phase 3 — 상품 상세페이지 차별화 (완료, 커밋/배포 완료)**
- `has_ai_starter_kit` boolean 플래그를 두 저장소(gospelfix, gospelfix.cms.api) 전체에
  구현: Supabase `products` 컬럼 + `content_api_configs.select_columns` 화이트리스트 +
  관리자 폼 체크박스 + 상세페이지 "AI 확장" 정보 칩 + 다운로드 링크.
- 실제 다운로드 파일은 템플릿별 맞춤이 아니라 **범용 정적 자산**
  (`gospelfix/public/downloads/claude-starter-kit.zip`) — 모든 상품이 같은 파일을 공유.
- 마이그레이션: `gospelfix.cms.api/supabase/migrations/034_*.sql`, `035_*.sql`.

**가격 정책 결정 (사용자 확인됨)**: 범용 킷만으로는 단가를 올리지 않는다. 먼저 같은
가격으로 "AI 확장" 칩을 노출해 전환율이 오르는지 관찰하고, 단가 인상은 템플릿별로 실제
맞춤 제작한 심화 버전(옵션 B)을 `purchase_options`에 별도 프리미엄 옵션으로 추가할 때만
검토한다.

**Why:** 이 이니셔티브가 여러 단계(콘텐츠 → 상품 기능 → 가격 정책)로 나뉘어 있고, 블로그
발행 여부에 따라 About 페이지 링크의 정상 동작 여부가 갈린다.

**How to apply:** 이 프로젝트에서 "AI 스타터 킷"/"AI 확장"/"claude-code-project-setup"
관련 후속 요청이 오면, 위 상태부터 먼저 확인할 것(특히 블로그 글이 그 사이 발행됐는지).
Phase 2(템플릿별 맞춤 킷, 프리미엄 가격)로 확장하려면 [[feedback_shared_component_single_source_of_truth]]
원칙과 별개로 cms.api 스키마 확장이 추가로 필요하다는 점을 다시 언급할 것.
