---
name: product_video_upload_feature
description: 상품 업로드(UploadWorkEditor)에 mp4 동영상 업로드 지원 추가 + ProductCard 썸네일 동영상 자동재생 분기 신규 리뷰
type: project
---

## 기능 개요 (2026-08-28)

`/growth/upload` 표지/콘텐츠 블록에 mp4 동영상 업로드를 추가하는 3파일 커밋:

- `src/components/growth/UploadWorkEditor.tsx` — 콘텐츠 블록에 "동영상" 타입 추가, `uploadVideo()`
  헬퍼로 `POST /api/my-products/videos` 호출(`uploadImage()`와 완전히 동일한 패턴, 일관성 확인).
- `src/app/api/my-products/videos/route.ts`(신규) — `images/route.ts`와 구조적으로 동일한
  FormData 프록시. 인증(getAccessToken)/에러 핸들링 안전성 동일 확인.
- `src/components/products/ProductCard.tsx` — `thumbnail_url`이 `/\.mp4($|\?)/i`에 매치하면
  `next/image` 대신 `<video muted loop autoPlay playsInline>`로 분기.

## cms.api 측 확인 사항

`gospelfix.cms.api/src/app/api/v1/my-products/videos/route.ts`는 이미 구현되어 있음. 서버는
`file.type !== 'video/mp4'`로 실제 MIME 엄격 검사(확장자 아님)를 한다. 스토리지 파일명 확장자는
`uploadMyProductFile`에서 `file.name.split('.').pop()`(클라이언트가 보낸 원본 파일명 기반)으로
결정되므로, MIME 검사를 통과하더라도 저장된 파일의 실제 확장자가 진짜 mp4 콘텐츠임을 보장하지는
않음(이론상 위조 가능하나 보안 문제는 아니고 재생 실패 UX 문제에 국한, 이미지 업로드도 공유하는
사전 존재 패턴).

## 1차 리뷰 (2026-08-28, gospelfix 레포): Major 1건 → BLOCKED

**ProductCard의 무제한 동시 autoplay mp4** — `/growth` 상품 그리드가 페이지네이션 없이 전체 상품을
한 번에 렌더링하는데 IntersectionObserver 등 뷰포트 게이팅 없이 모든 카드가 마운트되는 즉시
`autoPlay+loop`가 걸려, 동영상 썸네일 상품 수가 늘어날수록 동시 다운로드+디코드 부담이 선형으로
커지는 구조(next/image의 `sizes` 반응형 최적화에 대응하는 장치가 `<video>`에는 없음).

**Why:** 코드 자체가 상품 수·동영상 비율에 대한 상한을 전혀 두지 않는 구조라 기능이 성공할수록
성능이 나빠지는 역설적 스케일링 문제.

**How to apply:** 동영상 자동재생 그리드 카드를 다루는 diff를 리뷰할 때는 (1) 해당 그리드가
페이지네이션/무한스크롤 상한이 있는지, (2) 뷰포트 밖 카드의 video가 pause/미마운트되는지
(IntersectionObserver 기반) 반드시 확인한다. 최소 개선안: hover 시에만 재생, 또는
`preload="none"` + IntersectionObserver.

## 2차 리뷰 (2026-08-28, cms.api 레포): 업로드 용량 제한 재설계 → APPROVED

`POST /api/v1/my-products/videos`(cms.api 측 실제 업로드 엔드포인트)에 대한 재리뷰. 이전
BLOCKED 지적 3건 모두 코드로 확인 후 해소:

1. **Critical — Vercel Serverless Function 요청 바디 크기 제한(~4.5MB) vs 50MB mp4 충돌**
   → 사용자와 논의 후 상한을 50MB→**4MB**로 하향. `products.my.ts`
   `UPLOAD_MAX_BYTES['product-videos'] = 4 * 1024 * 1024`(주석: Vercel 한도 + 브라우저→gospelfix→
   cms.api 이중 프록시 구조 명시). `my-products.schema.ts` 413 응답 설명도 "최대 4MB"로 동기화.
   이 프로젝트는 짧은 상품 데모/캔버스 콘텐츠 블록용 동영상이 목적(100MB급 장편은 스코프 밖)이라는
   사용자의 명시적 제품 결정 — 4MB(대략 5~15초 분량)가 작아 보여도 반대 근거 없음.
2. **Major — 용량 초과 시 문자열 매칭(`message.includes('용량')`)에 의존**
   → `uploadMyProductFile`이 plain `Error` 대신 기존 `MyProductError(413, ...)`를 던지도록 변경.
   `images/route.ts`, `files/route.ts`, `videos/route.ts` 세 라우트 모두
   `error instanceof AdminAuthError || error instanceof MyProductError`로 통일(기존엔 `images`/
   `files`가 AdminAuthError만 체크해 용량 초과 시 500으로 떨어졌을 가능성 — 부수적으로 그 버그도
   해소됨).
3. **Major — 신규 Storage 버킷(`product-videos`) 프로비저닝 안내 부재**
   → 사용자가 대시보드에서 수동 생성 완료 + `videos/route.ts` docstring에 사전 준비 안내 추가
   확인.

grep으로 `message.includes('용량')` 류 문자열 매칭 잔존 여부 전체 검색 → 없음(무관한
`orders.ts`의 unique index 이름 매칭 1건만 검색됨).

**결론**: cms.api 쪽 업로드 엔드포인트는 APPROVED. gospelfix 쪽 ProductCard 무제한 autoplay
Major(1차 리뷰)는 별도 레포 이슈로 이번 재리뷰 범위 밖 — 아직 해소 여부 미확인 상태로 남아있음.
다음에 gospelfix 쪽 diff를 볼 기회가 있으면 IntersectionObserver 게이팅 적용 여부 확인 필요.

## Minor (blocking 아님, gospelfix 레포 소관이라 cms.api 재리뷰에서는 재확인 안 함)

- `<video>`에 `poster` 속성 없어 로드 전 빈 화면 노출.
- 신규 video 블록도 image 블록과 동일하게 `URL.createObjectURL()` 후 `URL.revokeObjectURL()`
  미호출(사전 존재 패턴, 동영상은 파일 용량이 커서 메모리 영향이 더 큼).
- 프론트엔드 업로드 UI(gospelfix)의 안내 카피가 "동영상 최대 4MB"로 cms.api와 동기화되어 있는지
  미확인 — 다음 리뷰 시 확인 권장.
