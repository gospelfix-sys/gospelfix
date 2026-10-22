---
name: project_todo_2026-08-26
description: 2026-08-26 기준 다음 할 일 3건 — growth/upload 라이선스 등 필드 동작 테스트, 결제 PG를 PortOne 기반으로 교체, growth 히어로 배너 영상 자산 대기
metadata:
  type: project
---

## 1. `/growth/upload` 필드 동작 테스트

"저작권 및 라이선스" 등 `/growth/upload`(작품 업로드 에디터, `UploadWorkEditor.tsx`)의 각
입력 필드가 실제로 잘 동작하는지 아직 테스트하지 않았다. 사용자가 공유한 참고 스크린샷은
라이선스 설정 모달로, `저작권표시[CC BY]` / `저작권표시-비영리[CC BY-NC]` /
`저작권표시-비영리-변경금지[CC BY-NC-ND]` / `판권소유` 4개 옵션 중 선택하는 UI다.

**Why:** 최근 세션에서 `UploadWorkEditor.tsx`를 여러 차례 수정(카테고리/태그 UI 제거,
`file_path` 로드 버그 수정 등)했고, 이 변경들이 라이선스 필드 등 다른 필드의 정상 동작에
영향을 주지 않았는지 아직 실제 브라우저에서 검증하지 못했다(이 세션엔 스크린샷 도구가 없어
시각적 검증을 못 함).

**How to apply:** 다음 세션에서 `yarn dev`로 로컬 서버를 띄우고 `/growth/upload`에서 라이선스
선택/저장이 실제로 값이 반영되는지, 그 외 필드(제목/설명/카테고리/가격/이미지/파일 등)가
등록·수정 양쪽 플로우에서 정상 동작하는지 사용자와 함께 확인이 필요하다.

## 2. 결제 PG사를 PortOne 기반으로 교체 예정

현재는 계좌이체/카카오페이 QR 수동 확인 방식([[project_toss_payments_history]] 참고 —
Toss→카카오페이 QR로 전환된 이력)인데, 이를 PortOne(포트원, 舊 아임포트) 기반 PG 연동으로
교체할 예정이다.

참고 문서: `https://developers.portone.io/opi/ko/readme?v=v2`

**Why:** 계좌이체 수동 확인 방식은 운영 부담(입금 확인을 사용자가 직접 눌러야 함)이 있어,
정식 PG 연동으로 자동화하려는 것으로 보인다.

**PortOne 수수료 구조 관련 사용자 질문에 대한 답변** (2026-08-26 조사, WebSearch+WebFetch로
`portone.io/pricing` 공식 페이지 확인): **"쓴 만큼만" 낸다는 말은 정확히는 절반만 맞다** —
두 가지 요금이 별도로 부과된다.
- **PG사 결제 수수료** (나이스페이/KG이니시스 등 실제 카드/계좌 결제 대행사에 내는 돈, 보통
  거래액의 3.9~6.7%대) — 이건 진짜 종량제(쓴 만큼만).
- **PortOne 자체 이용료** — Free 플랜(월 순거래액 5천만원 미만)은 무료지만, 그 이상이면
  거래액 구간별 **월 정액제**로 전환된다(Growth 1: 월 10만원/거래액 5천만~1억, Growth 2: 월
  30만원/1억~5억, Growth 3: 월 50만원/5억 이상, 부가세 별도). 즉 한도를 넘으면 그 달 거래액이
  적어도 정액 요금은 고정으로 나간다 — 순수 종량제가 아니다.
- 헬프센터 검색 결과 중 "월거래금액의 0.5%"라는 표현도 있었는데, 이는 공식 pricing 페이지의
  현재 구간별 정액제 설명과 다르다 — 다른 상품(PG 패키지/정산대행 등)의 요금일 가능성이 있어
  실제 계약 전 포트원 측에 직접 확인이 필요하다.

**How to apply:** PortOne 연동 작업을 시작하기 전에 (1) 예상 월 거래액 규모가 Free 플랜
한도(5천만원) 이내인지 먼저 확인하고, (2) 초과가 예상되면 Growth 플랜 정액 비용을 매출 대비
비용으로 미리 계산해둘 것. 정확한 최신 요금은 `https://www.portone.io/pricing`과
`https://help.portone.io/category/pricing`에서 재확인 후 진행.

## 3. `/growth` 히어로 배너(`HeroCarousel.tsx`) 영상 자산 대기

`components/growth/HeroCarousel.tsx`에 "가운데(활성) 슬라이드일 때만 자동 재생, 벗어나면
정지"하는 영상 재생 로직은 이미 구현 완료됐다(`Slide.videoUrl` 필드 + `syncActiveVideo()`).
다만 사용자가 아직 실제 데모 영상을 준비하지 못해, 현재 `SLIDES` 3개 항목 모두 `videoUrl`이
비어 있는 상태(placeholder 우선 구현으로 합의, 2026-08-26).

**Why:** 사용자가 "아직 준비 안 됨 — 우선 placeholder로 구현" 옵션을 선택함
([[feedback_concrete_outcome_explanations]]과 별개로, AskUserQuestion으로 직접 확인).

**How to apply:** 실제 영상 파일/URL이 준비되면 해당 슬라이드 객체에 `videoUrl: "..."`만
채우면 된다(다른 배선 작업 불필요 — `<video>` 렌더링과 재생/정지 로직은 `slide.videoUrl`
존재 여부만으로 이미 분기됨). 이 카드는 `loop`+`autoplay`+타임라인 바(5초 주기)로 무한
자동 전환되므로, 영상 길이는 5초(`AUTOPLAY_DELAY_MS`) 안팎으로 준비하거나 이 상수 값도
함께 조정할 것.
