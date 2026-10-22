---
name: download_feature_removed
description: 2026-07-30 발견 — 다운로드 기능(라우트+버튼) 삭제 후 UI/약관 카피 불일치(Critical, BLOCKED) → 같은 날 2차 재검증에서 대부분 해소 확인, terms.tsx 제2조 정의 미동기화만 Major로 잔존
type: project
---

**2026-07-30 시점 작업 트리 상태**: `src/app/api/downloads/[productId]/route.ts`(cms.api 다운로드
signed URL 프록시)와 `src/components/mypage/DownloadButton.tsx`가 삭제되고,
`src/app/(mypage)/mypage/library/page.tsx`도 이 컴포넌트를 더 이상 쓰지 않도록 수정됨 —
`mypage/library`, `mypage/orders` 어느 페이지에도 다운로드 버튼/링크가 전혀 없는 상태로 확인됨
(`grep -rn "download" src/app/api` 0건).

**Why 이게 문제인가:** 같은 저장소의 다른 화면들은 여전히 "마이페이지에서 다운로드 가능"을
명시적으로 안내한다 — `PaymentModal.tsx:150`("관리자 확인 후 마이페이지에서 다운로드하실 수
있습니다"), `BuyButton.tsx:113`("마이페이지에서 다운로드 받으실 수 있습니다"),
`HeroBanner.tsx`/`growth/page.tsx`의 "구매 즉시 소스코드 다운로드" 마케팅 카피,
`terms/page.tsx` 제4조·제8조의 "다운로드 링크 제공"/"파일 다운로드 시작 시 청약철회 제한" 법적
조항. 디지털 상품(템플릿) 판매가 핵심 비즈니스인 서비스에서 결제 후 파일을 받을 방법이
코드베이스 어디에도 없는 상태로 이 서비스는 "결제는 되는데 상품을 못 받는" 상태가 된다.

**How to apply (다음 세션에서 반드시 재확인):**
- 이 상태로 커밋/배포되었는지 여부를 먼저 확인한다 (`git log --oneline -- src/app/api/downloads`,
  `src/components/mypage/DownloadButton.tsx` 존재 여부로 판단).
- 만약 이미 커밋되어 배포까지 되었다면: (1) 다운로드 기능이 의도적으로 다른 방식(이메일 발송,
  관리자 수동 전달 등)으로 대체되었는지 확인하고, 그렇다면 `PaymentModal.tsx`/`BuyButton.tsx`/
  `terms/page.tsx`의 안내 문구가 실제 방식과 일치하는지 대조. (2) 대체 없이 사라진 것이라면
  Critical 버그로 즉시 재보고하고 복구를 최우선 권고할 것.
- `CLAUDE.md:192`의 라우트 구조 표에 `downloads/[productId]/`가 여전히 문서화되어 있어(삭제 후
  갱신 안 됨), 이 문서만 보고 "다운로드 기능이 있다"고 오판하지 않도록 주의 — 실제 파일 존재
  여부를 항상 재확인.
- 2026-07-30 리뷰 시점에는 **BLOCKED 판정**을 내렸고 아직 사용자 확인/후속 조치 결과는
  추적되지 않음 — 다음 세션에서 이 이슈가 어떻게 해소됐는지(복구 vs 문구 동기화) 반드시 확인.

관련: [[recurring_issues]] (문서-코드 동기화 누락 패턴, #19와 유사), [[project_stack]]

---

**2026-07-30 재검증(같은 날 2차, 후속 수정 커밋 전 재검토)**: 사용자가 "의도된 비즈니스 모델
전환(즉시 다운로드 판매 → 제작/상담 진행형 서비스)"이라고 확인. `product.types.ts`에서
`file_path` 제거, `production_solution`/`is_inquiry_only` 필드 추가로 실제 확인됨. 이후
`BuyButton.tsx`(useRef 가드 추가 + 문구 수정), `PaymentModal.tsx`, `HeroBanner.tsx`,
`growth/page.tsx`(Download 아이콘 → Code2), `terms/page.tsx`(제4조/제8조), `CLAUDE.md`(라우트
표에서 downloads/[productId] 제거) 수정 완료.

**grep 전수 재검증 결과(APPROVED에 가까움, Major 1건 잔존)**:
- `grep -rni "download" src` → `Step05Result.tsx`/`lib/quote/pdfGenerator.ts` 2건만 남음,
  이는 견적서 PDF 다운로드라는 완전히 별개의 기능(제품 파일 다운로드와 무관)이라 정상.
  `PaymentModal.tsx`/`BuyButton.tsx`/`HeroBanner.tsx`/`growth/page.tsx`/`terms/page.tsx`/
  `CLAUDE.md` 전부 다운로드 관련 문구 0건 확인 — 이 리뷰가 지적했던 원래 이슈는 완전히 해소.
- `BuyButton.tsx`의 `isRequestingRef` 가드: `try { ... if (price===0) { ...; return; } ... }
  finally { isRequestingRef.current = false; }` 구조로, `return`이 반드시 `try` 블록 내부에
  있어 `finally`를 우회하지 않음을 코드 레벨에서 확인(정상 구현).
- **신규 발견(Major)**: `terms/page.tsx` 제2조④(용어의 정의)가 여전히 옛 비즈니스 모델
  문구("회사가 판매하는 악보, 가이드, 음원 파일 등 디지털 형태로 제공되는 재화")를 그대로
  유지하고 있어, 제4조("웹 템플릿 등 디지털 콘텐츠의 제작 및 판매 서비스")·제8조("제작(용역)
  제공이 개시된 경우")와 정의가 어긋남. 제4조/제8조만 고치고 정의 조항(제2조)은 grep/재검토
  없이 누락된 전형적인 "부분 수정" 패턴 — [[recurring_issues]] #12/#19와 동일 유형.
  **How to apply**: 다음 세션에서 이 항목이 실제로 고쳐졌는지 `grep -n "악보, 가이드, 음원"
  src/app/\(public\)/terms/page.tsx`로 확인. 남아있으면 Major로 재보고.

**2026-08-04 재검증(terms/page.tsx → components/legal/TermsContent.tsx 팝업 마이그레이션 PR)**:
`terms/page.tsx`가 삭제되고 `src/components/legal/TermsContent.tsx`로 대체됐는데, 제2조④(용어의
정의)가 "웹 템플릿 등 디지털 형태의 결과물 및 관련 소스코드"로 이미 갱신되어 있음을 확인 —
이 Major 이슈는 완전히 해소됨. 단, 같은 마이그레이션 PR에서 새로운 유형의 콘텐츠 불일치(결제
수단 서술이 PrivacyContent.tsx와 RefundContent.tsx 간에 모순)가 발견됨 — 자세한 내용은
[[legal_dialog_migration]] 참고.

**2026-08-08 재도입(무료 상품 한정 다운로드 기능, 전면 부활이 아님)**: `project_todo_2026-08-08`에
명시된 "무료상품 즉시다운로드" 과제로 `src/app/api/downloads/[productId]/route.ts`,
`src/components/products/DownloadButton.tsx`가 다시 생성됨 — 단, 2026-07-30에 폐기된
"모든 상품 즉시 다운로드" 모델의 전면 부활이 아니라 **무료(price=0) 상품에 한정**된 기능으로
스코프가 좁혀짐. `PurchasedOrder.product.file_path`(order.types.ts)가 order 단위로 내려오고,
`mypage/library/page.tsx`가 `hasFile={!!order.product.file_path}`로 분기해 파일이 있을 때만
`DownloadButton`을 노출. 유료 상품은 여전히 `production_solution`/`is_inquiry_only` 기반
제작·상담 흐름을 그대로 유지(코드 레벨에서 `Product` 타입에는 `file_path`가 추가되지 않음 —
`PurchasedOrder` 응답에만 존재). 마케팅 카피/약관 문구는 이번 diff에서 건드리지 않았고
"다운로드" 관련 언급이 재도입되지 않아 2026-07-30 문구 동기화 작업과 충돌 없음(grep 확인:
`downloads` 매치는 route.ts/DownloadButton.tsx/CLAUDE.md 라우트 표뿐).
Critical/Major 이슈 없이 APPROVED. `CmsApiError` status/message가 401/403/404 그대로
전달되고, signed URL은 cms.api(신뢰 백엔드)가 발급하므로 open-redirect 아님. `BuyButton.tsx`의
무료 구매 완료 링크도 `/mypage`→`/mypage/library`로 함께 갱신되어 다운로드 버튼이 실제로 보이는
화면으로 연결됨. Minor: (1) `NextResponse.redirect(data.url)`이 URL 형식을 검증하지 않음(방어적
프로그래밍 관점, 실제 위험은 낮음), (2) 다운로드 링크에 `target="_blank"` 없어 클릭 시 현재 탭이
signed URL로 이동(파일이면 브라우저가 다운로드 처리하며 탭에 남지만, cms.api가 content-disposition을
안 붙이면 페이지 이탈 가능 — cms.api 쪽 헤더 확인 권장), (3) `orders/route.ts`가 cms.api 호출
실패 시 에러를 삼키고 빈 배열만 반환(기존 패턴, 이번 diff가 새로 만든 문제는 아님).
