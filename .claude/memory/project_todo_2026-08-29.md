---
name: project_todo_2026-08-29
description: 2026-08-29 기준 다음 작업 예정 2건 — 상단 배너 cms.api 연동, 판매자 전환 시 "계좌번호 관리" 메뉴/필드 추가
metadata:
  type: project
---

## 1. 상단 배너 관리자(cms.api) API 연동

지금 화면 상단에 노출되는 배너들이 아직 cms.api와 실제로 연동되어 있지 않다 — 관리자가
cms.api 쪽에서 등록/수정한 배너 데이터를 이 앱이 API로 받아와 렌더링하도록 연동 작업이
필요하다. 어느 배너 영역을 가리키는지(`HeroCarousel.tsx`의 `/growth` 히어로 배너인지,
`referral-banners`처럼 별도 도메인인지, 아니면 새로운 영역인지)는 다음 세션에서 사용자와
먼저 확인이 필요하다 — `HeroCarousel.tsx`는 이미 `SLIDES` 하드코딩 배열로 존재하고
`api/referral-banners/`는 추천 배너 전용 프록시라 이번 요청과 같은 영역인지 미확정.

**Why:** 배너 콘텐츠를 코드 배포 없이 관리자가 직접 교체할 수 있게 하려는 것으로 보인다
(현재는 하드코딩이라 배너 하나 바꾸려면 코드 수정+배포가 필요한 상태로 추정).

**How to apply:** 작업 시작 전 (1) 대상 배너 영역 확정, (2) cms.api 쪽에 해당 배너
CRUD API(`/api/v1/*`)가 이미 존재하는지 아니면 cms.api 저장소에서 먼저 만들어야 하는지
확인. 이 저장소는 BFF 패턴이라 실제 구현은 `src/app/api/*/route.ts` 프록시 신설 +
`serverFetch()`로 데이터 조회하는 기존 패턴(`api/referral-banners/` 참고)을 그대로
따르면 된다.

## 2. 판매자(전문가) 전환 시 "계좌번호 관리" 메뉴 및 서브 계좌 저장 기능

일반 회원이 판매자(전문가)로 전환하면 `/mypage`에 "계좌번호 관리"라는 새 메뉴가 노출되어야
하고, 그 메뉴에서 판매자 본인이 정산받을 계좌 정보(예: 카카오페이 송금용 계좌, 토스 계좌
등 결제 수단별 여러 개)를 직접 입력/저장할 수 있는 필드가 필요하다.

**Why:** 현재 결제는 계좌이체 방식이고 입금 계좌는 `NEXT_PUBLIC_PAYMENT_*` 환경변수로
전역 고정된 "회사(운영자)" 계좌 하나뿐이다(CLAUDE.md 환경변수 섹션 참고). 이번 요청은
이것과 별개로, 판매자 개인이 자신의 수익을 정산받을 계좌를 "판매자별로" 등록해두려는
목적으로 보인다 — 즉 구매자가 입금하는 계좌(운영자 고정)와 판매자에게 정산해주는 계좌
(판매자별 가변)는 서로 다른 개념이라는 점을 다음 세션에서 사용자와 먼저 확인할 것.

**How to apply:** 이 저장소는 Supabase에 직접 접근하지 않는 BFF라(CLAUDE.md 아키텍처
섹션), 계좌 정보 저장 스키마/컬럼(예: `profiles` 또는 별도 `seller_payout_accounts`
테이블)은 `gospelfix.cms.api` 저장소 쪽에서 먼저 설계·마이그레이션해야 한다. 이 앱에서는
(1) `MypageSidebar.tsx`의 `SELLER_NAV_ITEM` 패턴처럼 canSell(seller/admin)일 때만
노출되는 메뉴 항목 추가, (2) `/mypage/settings` 또는 새 라우트에 결제수단별(카카오페이/
토스 등) 계좌 입력 폼, (3) `src/app/api/*` 프록시 신설 + cms.api API 연동 순서로 진행.
[[shared_component_single_source_of_truth]]와 `.claude/rules/component-layers.md`의
컴포넌트 위치 규칙을 따라 `components/mypage/` 또는 `components/[도메인]/`에 배치할 것.
