---
name: license_info_dialog_terms_conflict
description: ProductInfoTicket 라이선스 정보 팝업(LICENSE_OPTIONS description 상세화) 리뷰 — raw button 재발 + 이용약관 제9조 모순, 1차 BLOCKED → 2차(같은 날) 둘 다 해소 확인, APPROVED
metadata:
  type: project
---

**변경 개요**: 상세페이지 정보 카드에서 "판권소유" 등 라이선스 라벨을 클릭하면 `LICENSE_OPTIONS`
전체 설명을 보여주는 `Dialog`를 여는 기능. 대상 파일 3개:

- `src/types/product.types.ts` — `LICENSE_OPTIONS[].description`을 "구매자가 실제로 뭘 할 수
  있고 없는지" 상세하게 재작성.
- `src/components/products/ProductInfoTicket.tsx` — `"use client"` 추가, `license`(원본 value)
  prop으로 변경(내부에서 `getLicenseLabel()` 호출), 라이선스 값을 클릭 가능한 트리거로 바꾸고
  `Dialog`로 `LICENSE_OPTIONS` 전체 나열 + 현재 적용 항목 강조.
- `src/components/products/PurchaseOptionsPanel.tsx` — `license` 원본값을 그대로 전달,
  `getLicenseLabel` import 제거.

**1차 리뷰 결과: Major 2건**

1. **raw `<button>` 재발(#43)**: 라이선스 트리거가 `components/ui/button.tsx` 미사용. 같은
   `LICENSE_OPTIONS`/`Dialog` 패턴을 쓰는 `UploadWorkEditor.tsx`의 편집 트리거는 이미
   `<Button variant="ghost" size="sm">`를 정상 사용 중이라 대조가 뚜렷함.
2. **라이선스 설명 vs 이용약관 제9조 모순(#44)**: CC BY/CC BY-NC 설명이 "상업적 이용·재배포
   허용"을 명시적으로 약속하지만, `TermsContent.tsx` 제9조②는 라이선스 무관하게 모든 디지털
   콘텐츠를 "개인적·비상업적 용도"로 블랭킷 제한하고 재배포/2차저작물 상업활용을 금지 —
   `판권소유`만 이용약관에 위임하는 문구가 있어 방어되고 나머지 3개 라이선스는 무방비로 모순.

**확인 완료(문제 없음)**:
- `ProductInfoTicket` 사용처는 `PurchaseOptionsPanel.tsx`(이미 `"use client"`) 1곳뿐 — `"use
  client"` 추가로 인한 서버 컴포넌트 회귀 없음(grep 전수 확인).
- `Dialog`가 `ProductInfoTicket` 최상위 `<div>` 안에 형제로 중첩된 구조는 `UploadWorkEditor.tsx`
  (`<div className="min-h-dvh ...">` 안에 라이선스/카테고리 Dialog들을 형제로 배치)와 동일한
  기존 관례 — `DialogPortal`이 실제 DOM을 body로 옮기므로 시각적 문제 없음.
- `DialogContent className="gap-5 p-6 sm:max-w-lg"` — `sm:max-w-*`만 오버라이드하고 모바일
  `inset-x-4`는 건드리지 않아 [[shared-component-changes]] 원칙(모바일 여백 보존) 정확히 준수.
- `cn()`/쌍따옴표/세미콜론 등 Prettier·CLAUDE.md 규칙 위반 없음. `style=`/`asChild` 0건.
- 트리거에 시각적 텍스트(licenseLabel)가 이미 있어 접근성 이름(accessible name)은 확보됨 —
  `aria-label` 누락은 Blocking 사유 아님(Minor 수준으로 `aria-label` 보강 제안 가능).

관련: [[recurring_issues]] #9/#17/#22/#23/#28/#32/#33/#35/#36(raw button 계열),
[[legal_dialog_migration]](법률 문서 간 모순 선례), [[recurring_issues]] #25(정의 조항 미동기화)

## 2차 재검증(같은 날, 2026-08-29): 둘 다 해소 확인, APPROVED

1. **raw `<button>` 재발(#43)**: `ProductInfoTicket.tsx`의 라이선스 트리거가
   `<Button type="button" variant="ghost" size="sm">`로 교체되어 해소. `components/ui/button.tsx`
   재사용 확인.
2. **라이선스 설명 vs 이용약관 제9조 모순(#44)**: 양방향으로 정리됨 — (a) `TermsContent.tsx`
   제9조③가 "상업적 이용·2차저작물·재배포를 명시적으로 허용하는 라이선스 조건이 전항(②)에
   우선 적용된다"고 먼저 예외를 선언하고, (b) `LICENSE_OPTIONS`(cc-by/cc-by-nc/cc-by-nc-nd)
   description 마지막 문장이 "이 조건은 이용약관 제9조③에 따라 우선 적용됩니다"로 바뀌어
   그 예외 조항을 정확히 인용. 이전에는 LICENSE_OPTIONS 쪽에 "실제 이용 가능 범위는 구매 시
   안내되는 이용 약관이 우선합니다"라는 반대 방향 문장이 남아 있어 상호 모순이었으나, 이번
   수정으로 "약관이 라이선스에 우선한다"는 문장이 완전히 제거되고 양쪽 모두 "라이선스가
   (약관이 정한 예외 조항에 근거해) 우선 적용된다"는 동일한 방향을 가리킴 — grep
   `"이용 약관이 우선|이용약관이 우선"` 결과 0건으로 잔존 없음 확인. `all-rights-reserved`
   항목만 "구체적인 이용 범위는 구매 시 안내되는 이용 약관을 따릅니다"로 남겨뒀는데, 이는
   제9조③ 예외(상업적 이용/2차저작물/재배포를 명시적으로 허용하는 라이선스)에 해당하지 않는
   라이선스라 약관이 그대로 적용되는 게 맞는 케이스라 문제 없음.
