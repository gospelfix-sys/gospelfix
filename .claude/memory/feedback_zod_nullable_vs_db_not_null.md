---
name: feedback_zod_nullable_vs_db_not_null
description: cms.api Zod 스키마의 nullable() 필드가 실제 Postgres 컬럼의 NOT NULL 제약까지 보장하지 않는다 — 타입만 보고 null을 보내면 500 에러
metadata:
  type: feedback
---

`gospelfix.cms.api`의 `POST /api/v1/quotes` 같은 엔드포인트는 Zod 스키마상
`selectedCategories`/`selectedItems`/`stylePreferences`/`estimatedTotal`/
`requiredFeatures`/`needsSystemDev` 등 대부분의 필드가 `nullable()`로 선언돼 있어 API
레이어는 `null`을 받아줄 것처럼 보인다. 하지만 실제 Supabase 테이블
(`gospelfix_quote_submissions`)은 이보다 더 엄격한 `NOT NULL` 제약을 갖고 있어서, API가
받아준 `null` 값이 그대로 insert되는 순간 Postgres가 제약 위반으로 500을 던진다.

**Why:** 기존 `/quote` 5단계 마법사(`QuoteWizard`)는 UI가 매 단계 선택을 강제하기 때문에
이 null 경로를 한 번도 실제로 밟아본 적이 없었다 — 그래서 타입 불일치가 지금까지
드러나지 않았다. [[project_quote_chat_modal_feature]]용 새 Server Action
(`submitQuoteChatAction.ts`)을 만들며 일부러 가벼운 리드 수집용으로 선택 안 한 필드를
`null`로 보냈다가 처음 발견함. 에러 메시지 자체는 generic한 500/"서버 오류가
발생했습니다"만 보여서, cms.api 개발 서버를 재시작해 stdout을 로그 파일로 캡처해서야
Postgres의 구체적인 `null value in column "..." violates not-null constraint` 메시지를
확인할 수 있었다(cms.api 서버가 백그라운드로 이미 떠 있으면 로그가 안 보이므로).

**How to apply:** cms.api의 새 엔드포인트를 호출하는 코드를 작성할 때, TS/Zod 타입이
`nullable`이라고 해서 안심하고 `null`을 보내지 말 것 — 특히 배열 필드는 `null` 대신
`[]`, 숫자 필드는 `0`, boolean은 `false`로 채우는 게 더 안전하다. 500 에러가 나는데
원인이 안 보이면, cms.api 프로세스를 `(yarn dev > <로그파일> 2>&1 &)`로 재시작해
stdout을 캡처해서 실제 Postgres 에러 메시지를 확인하는 방법이 유효하다. 단, 이렇게
cms.api를 재시작/종료할 땐 [[feedback_pkill_next_dev_kills_sibling_repo]]의 함정도
함께 주의할 것.
