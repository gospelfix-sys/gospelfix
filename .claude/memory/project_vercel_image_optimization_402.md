---
name: project-vercel-image-optimization-402
description: Vercel Image Optimization이 402 Payment Required 반환 → next/image unoptimized:true로 임시 우회, 결제수단 등록 여부 후속 결정 대기
metadata:
  type: project
---

2026-09-15, `https://gospelfix.vercel.app/layer` 등 포트폴리오 이미지가 **프로덕션에서만**
깨져 보이는 문제 발생. 원인은 경로/권한 문제가 아니라 Vercel Image Optimization API였다.

## 원인

- 브라우저의 `next/image`는 원본 Supabase URL이 아니라 자체 프록시
  `https://gospelfix.vercel.app/_next/image?url=...`를 요청한다.
- 이 프록시가 `402 Payment Required` + `x-vercel-error: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`를
  반환함 (curl 재현 + 사용자 DevTools 네트워크 탭 캡처로 확정).
- 원본 Supabase Storage(`ixnxoscebcuixlndcodc.supabase.co`, `portfolio-images` 버킷)는
  `200 OK`로 정상 — Storage 쪽엔 문제 없음.
- **이미 한 번 변환되어 캐시된 이미지는 정상 표시되고, 아직 변환된 적 없는 신규 이미지만
  막힌다** — 그래서 오래된 이미지는 잘 보이고 최근 업로드분만 깨지는 것처럼 보였다.
- Vercel Usage 대시보드에서 헷갈리기 쉬운 두 지표:
  - **"Image Cache Reads"** — 이미 변환된 걸 캐시에서 재사용, 한도 300,000, 이번 사건과 무관
  - **"Source Images (Legacy)"** — 0/1,000, "No Data" 상태. 이름 그대로 레거시라 더 이상
    실집계에 안 쓰임 — 여기가 0이어도 "여유 있다"는 뜻이 아니다. 새 과금 체계에서는
    **결제수단 미등록 시 신규 소스 이미지 변환 자체가 막히는 것**으로 추정.

## 조치

`next.config.mjs`의 `images`에 `unoptimized: true` 추가(커밋 `478dfa3`). Next.js Image
Optimization 프록시(`/_next/image`)를 완전히 우회하고 원본 Supabase URL을 그대로 서빙.
`remotePatterns`는 나중에 최적화를 다시 켤 때를 위해 그대로 유지.

**Why:** 사용자가 Vercel 결제수단 등록(비용 지출 확정)보다 코드로 즉시 해결하는 쪽을
선택함 — 리뷰 옵션 중 "지금 바로 코드에 unoptimized 적용"을 명시적으로 골랐다.

**트레이드오프 (code-reviewer Major 지적):** 이 옵션은 `/layer` 한 페이지가 아니라
앱 전체 모든 `next/image` 사용처(`ProductCard`, `BlogSwiper`, `PortfolioSwiper`,
`CartModal`, `OrdersTabs`, `QuoteFloatingButton` 등)에 적용되는 전역 스위치다.
리사이징·webp 변환이 전부 사라져 모바일에서도 원본 해상도 그대로 다운로드된다.
`gospelfix.cms.api` 업로드 파이프라인에 서버측 리사이징이 없다면 LCP/데이터 사용량
저하가 실사용자에게 노출될 수 있음 — 확인 안 됨(cms.api 쪽 코드는 이 저장소에서 접근 불가).

**미해결 후속 작업 (사용자 결정 대기):**
1. Vercel 팀 Settings → Billing에서 결제수단 등록 여부 확인/진행
2. 등록 완료 시 `next.config.mjs`의 `unoptimized: true` 한 줄을 지워 최적화 재활성화할지 결정
3. (선택) `gospelfix.cms.api` 업로드 파이프라인에 서버측 리사이징/WebP 변환 추가 검토

**How to apply:** 이후 세션에서 이미지 관련 프로덕션 전용 버그 문의가 오거나
`next.config.mjs`의 `unoptimized: true`가 왜 있는지 묻는 질문이 나오면 이 메모리부터
확인할 것. "Vercel 결제수단 등록했다"는 말이 나오면 `unoptimized` 제거를 먼저 제안할 것.
