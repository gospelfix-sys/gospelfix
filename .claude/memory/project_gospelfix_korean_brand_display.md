---
name: project-gospelfix-korean-brand-display
description: 사용자 노출 텍스트의 "GOSPELFIX" 영문 표기를 "가스펄픽스" 한글 표기로 바꾸는 진행 중인 작업 — /about은 완료, 다른 페이지는 아직 미착수
metadata:
  type: project
---

## 무엇

2026-08-21, `/about` 페이지 안의 사용자 노출 텍스트(본문·배지·헤딩)에 있던
"GOSPELFIX"(영문)를 전부 "가스펄픽스"(한글)로 바꿨다. 계기는 상단 내비게이션
`PublicHeader.tsx:66`이 이미 "가스펄픽스"라는 한글 표기를 쓰고 있어서, About
페이지의 영문 표기와 불일치했던 것.

## 현재 상태 (2026-08-21 기준)

- **완료**: `src/app/(public)/about/page.tsx` 본문 텍스트 전체 (Two Ways 섹션
  헤딩·배지·인트로 문단, Services 섹션 헤딩, How We Build 섹션, 히어로 섹션,
  CTA 섹션)
- **미완료 — `<title>` 메타데이터**: `about/page.tsx:7`의
  `title: "소개 | GOSPELFIX"`는 사용자가 "본문 범위 밖"이라 보류. 브라우저 탭
  제목이라 화면 본문과는 다른 맥락이라는 판단.
- **미착수 — 다른 페이지**: `layout.tsx`, `(public)/page.tsx`(홈),
  `guide/page.tsx`, `quote/page.tsx`, `blog/[slug]/page.tsx`, `growth/page.tsx`,
  `ProductCard.tsx`, `CookieConsentBanner.tsx`, `Footer.tsx`,
  `DashboardHeader.tsx`, `PortfolioSwiper.tsx`, `legal/{Terms,Refund,Privacy}
  Content.tsx`, `lib/quote/pdfGenerator.ts`에 여전히 영문 "GOSPELFIX"가 남아
  있다. 이 목록은 2026-08-21 grep 스냅샷이라, 실제 착수 전에 반드시 다시
  `grep -rln "GOSPELFIX" src`로 최신 목록을 재확인할 것 (그 사이 다른 작업이
  일부를 이미 바꿨을 수 있음).

## Why

사용자가 About 페이지를 섹션 단위로 훑으며("Two Ways 섹션에서", "Services
섹션에서", "How We Build 섹션에서", "About 섹션에서도") 순차적으로 요청한
것이라, 지금은 About 페이지 하나만 완료된 의도적인 중간 상태다 — 다른 페이지에
영문 "GOSPELFIX"가 남아있는 게 실수/버그가 아니다.

## How to apply

- 코드에서 `GOSPELFIX`(영문 상수/저장소명/도메인 등)를 볼 때 이게 "사용자가
  읽는 화면 텍스트"인지 "식별자·법인명·도메인"인지 구분한다. 예를 들어
  `TermsContent.tsx`의 "GOSPELFIX(이하 회사)"는 약관상 법적 정의라 한글 치환
  대상인지 사용자에게 먼저 확인 필요 — 임의로 바꾸지 않는다(레퍼런스:
  `.claude/rules/` 문서에도 법률 문서 관련 별도 규칙 없음, 안전하게 물어볼 것).
  반면 About 페이지처럼 순수 마케팅 카피/헤딩은 이미 "가스펄픽스"로 바꾼
  선례를 따른다.
- 다른 페이지에서 "가스펄픽스" 통일 작업을 요청받으면, 위 미착수 목록을
  체크리스트 삼되 grep으로 최신화부터 하고 시작한다.
