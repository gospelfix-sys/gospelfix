---
name: project_todo_2026-08-08
description: 2026-08-08(내일) 작업 예정 할 일 리스트 — 사용자가 "내일 뭐 해야 하는지" 물으면 이 목록을 그대로 안내
metadata:
  type: project
---

2026-08-07에 사용자가 다음 날(2026-08-08) 작업할 할 일 목록을 미리 등록해 둠. 사용자가 "오늘
뭐 해야 하지", "할 일 알려줘" 등으로 물으면 아래 5개 항목을 그대로 리스트업해서 안내한다.

## 할 일 목록

1. ✅ **완료** — `gospelfix.cms.api` 상품 추가/편집 화면에 에디터 필드 추가
   (2026-08-08 완료) 상품 상세 콘텐츠용 새 필드 `content_html`을 cms.api(관리자 RichEditor 필드,
   컬럼 추가 마이그레이션 027/028) + gospelfix(타입, `ProductContentSection`, 상세페이지 렌더)
   양쪽 다 구현·커밋·push 완료(cms.api `f0343d6`, gospelfix `fec9d92`). SQL 마이그레이션
   027/028도 사용자가 Supabase 대시보드에서 직접 실행 완료. 이후 사용자 피드백으로 상세페이지
   내 배치도 조정(왼쪽 구매옵션/정보 칩 바로 아래로 이동, 커밋 `056f43c`). 상세 설계는
   `.claude/plans/1-splendid-sunset.md` 참고.

2. ✅ **완료** — 상품 상세페이지 타임라인(할인 카운트다운) 기능
   (2026-08-08 완료, 최종 재설계까지 반영) 최초엔 별도 `discount_price` 컬럼으로 구현했으나,
   사용자가 admin 폼을 보고 "기존 판매 가격(price)이 사실상 할인가"라고 지적해 **discount_price를
   완전히 폐기하고 price(할인가)/supply_price(정가) 재활용 모델로 3차 재설계**함(할인 기간
   종료 시 supply_price로 자동 복귀). cms.api 쪽에서 주문 서버 결제 금액 재검증이 새 가격
   모델을 반영 못해 할인 종료 후 정상 결제가 400 거부되는 Critical도 함께 발견·수정
   (`getEffectivePrice()` 서버 미러링). 관리자 폼의 할인 기간 입력도 네이티브 datetime-local에서
   shadcn Calendar+Popover `DateTimePicker`로 교체. 양쪽 저장소 최종 APPROVED 후 커밋·push
   완료(cms.api `88c777b`/`a15d829`, gospelfix `7f30a91`). ⚠️ **마이그레이션 029/030이 최종
   스키마(discount_starts_at/ends_at 2개 컬럼만, discount_price 없음)로 다시 작성됐으므로
   Supabase 대시보드에서 순서대로(029→030) 실행 필요 — 아직 실행 여부 미확인.** 상세는
   `.claude/memory/project_discount_countdown_feature.md` 참고.
   후속으로 cms.api `DateTimePicker`에서 사용자가 실제 화면을 보며 지적한 버그(달력 셀 크기가
   `--cell-size` CSS 변수에 `var()`가 안 붙어 무효화된 문제, 시간 선택을 커스텀 버튼→네이티브
   `<select>` 드롭다운으로 재구성, 월/년도 `captionLayout="dropdown"`으로 전환)까지 마무리해
   커밋·push 완료(cms.api `70cd07a`/`ea5f169`).

3. ✅ **완료** — FREE(무료) 상품 구매 시 마이페이지 보관함 즉시 다운로드
   (2026-08-08 완료) 2026-07-30에 서비스 방향성 전환으로 의도적으로 삭제됐던 기능을 사용자 확인
   후 재도입. 선행 버그 2건도 함께 수정: ① `POST /api/v1/orders`가 `amount<=0`이면 거부해 무료
   상품(amount=0) 주문 생성이 항상 실패하던 버그, ② 무료 주문이 결제 콜백 없이는 `paid` 상태에
   도달할 방법이 없어 보관함에 영원히 안 뜨던 버그(`markOrderPaidFree` 신규 추가로 해결). cms.api
   쪽에 `products.file_path` 컬럼(마이그레이션 031) + `GET /api/v1/downloads/{productId}`
   (구매 검증 → 5분 만료 signed URL 발급) 신규, gospelfix 쪽엔 보관함 페이지 다운로드 버튼 +
   `/api/downloads/[productId]` 리다이렉트 라우트 신규. 보안 경계(file_path가 공개 API에 노출되면
   안 됨) 준수 확인됨. 양쪽 저장소 code-reviewer APPROVED 후 커밋·push 완료(cms.api `fe5f083`,
   gospelfix `0017a5e`). 마이그레이션 031은 사용자가 Supabase 대시보드에서 직접 실행 완료
   (2026-08-08). ⚠️ **`product-files` Storage 버킷이 대시보드에 실제로 존재하는지, 업로드 파일
   크기 제한이 적절한지는 아직 미확인**(과거 삭제 이력은 코드상 없었음). 상세는
   `.claude/plans/1-splendid-sunset.md` 참고.

4. ✅ **완료(우선순위 높은 것만)** — 중복 UI 컴포넌트 독립 파일로 분리
   (2026-08-08 완료) 두 저장소 전수 조사로 중복 14곳(gospelfix 9곳, cms.api 5곳)을 찾았으나
   범위가 커서 Major 등급 7건만 우선 처리(gospelfix 5건, cms.api 2건). gospelfix:
   `formatPrice` 유틸 통합, 카테고리 라벨 SSOT화(`getCategoryLabel`, blog 카테고리 표시 버그도
   함께 수정), `PublicHeader` 카트 버튼 `Button` 컴포넌트화, `StarRating`/`EmptyStateCard`
   신규 컴포넌트 추출. cms.api: 이미지 업로드+DnD 공용화(`uploadFile`/`useImageList`/
   `SortableImageGrid`), 테이블 행 액션+드래그 정렬 공용화(`useAdminRowActions`/
   `RowActionMenu`) — 총 1,193줄 삭제. 양쪽 code-reviewer 리뷰에서 발견된 이슈(gospelfix:
   `PurchaseOptionsPanel.tsx` SSOT 미적용 Major, cms.api: `window.open` noopener 누락
   보안 Major + `uploadFile.ts` 위치 컨벤션 Major) 모두 수정 후 커밋·push 완료(gospelfix
   `738e912`, cms.api `d562354`). Minor 등급 9건(템플릿 리터럴 className, 이니셜 아바타,
   `OrdersTable.tsx`의 별도 `formatPrice` 복사본 등)과 나머지 중복 항목(마이페이지 fetch 가드,
   설정화면 토글 스위치 카드 등)은 다음 라운드 백로그로 남김.

5. ✅ **완료** — 코드 컨벤션 위반 여부 전수 점검 및 즉시 수정
   (2026-08-08 완료) 두 저장소 전수 조사 후 발견된 위반을 모두 수정. gospelfix: 템플릿 리터럴
   className 7건 → `cn()` 교체, `sonner.tsx`의 부적절한 `style=` → Tailwind 임의 속성 선언으로
   전환, shadcn 생성 파일 8개 Prettier 재포맷. cms.api: `data-access-rules.md` 절대 규칙 위반
   (route.ts/Server Action에서 `queries/` 밖 인라인 Supabase 쿼리) 2건을 `getProfileById()`로
   통합, shadcn 생성 파일 11개 Prettier 재포맷. 패키지 매니저·Recoil 훅·경로 별칭·REST API
   체크리스트 등 나머지 규칙은 위반 없음 확인됨. 양쪽 code-reviewer APPROVED 후 커밋·push
   완료(gospelfix `b6634c3`, cms.api `06fd8a0`).

## How to apply

- 사용자가 다음 날 세션을 시작하며 "오늘 뭐 하지", "할 일 뭐였지" 등으로 물으면, 위 5개 항목을
  번호 리스트 그대로 보여준다.
- 이 목록은 2026-08-07 시점 기준 "내일" 계획이므로, 날짜가 지나 항목이 실제로 완료·착수되면 이
  메모리를 업데이트하거나(완료 항목 제거/체크) `MEMORY.md` 인덱스에서 정리한다.
- 항목 4, 5는 특정 기능이 아니라 전체 코드베이스에 대한 반복 점검 작업이라 매 세션 반복될 수
  있음 — 완료 여부는 실제 코드 상태로 재확인 후 판단한다(이 메모리만으로 "이미 다 했다"고
  단정하지 말 것).
- **항목 2, 3은 이 저장소(gospelfix) 단독으로 끝나지 않을 수 있음.** 이 앱은 BFF 패턴이라
  Supabase 데이터/스키마를 직접 다루지 않고 전부 `gospelfix.cms.api`(별도 저장소, 포트 3001)의
  `/api/v1/*` REST API를 호출만 한다(CLAUDE.md "아키텍처" 참고). 할인 기간·카운트다운(2번), 무료
  상품 구매→zip 다운로드(3번) 모두 상품 스키마 변경이나 주문/파일 접근 로직이 얽힌 기능이라
  cms.api 저장소 쪽 API·스키마 수정이 선행되거나 병행되어야 할 수 있으므로, 작업 시작 전 cms.api
  쪽에 필요한 변경이 있는지부터 확인한다. (1번은 이미 이 패턴대로 cms.api+gospelfix 양쪽에 완료함
  — 2, 3번도 동일한 cross-repo 작업 방식을 참고할 것.)
