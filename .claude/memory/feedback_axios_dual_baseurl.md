---
name: feedback-axios-dual-baseurl
description: axiosInstance(/api)와 cmsApiClient(CMS_API_BASE_URL)는 겉모습이 비슷해도 서로 다른 서버를 가리키는 게 정상이며, 통합하면 안 된다
metadata:
  type: feedback
---

`src/lib/axios/instance.ts`의 `axiosInstance`(`baseURL: "/api"`)와 `src/lib/cmsApi/client.ts`의
`cmsApiClient`(`baseURL: CMS_API_BASE_URL`, 예: `https://gospelfix-cms-api.vercel.app`)는 둘 다
`axios.create()`로 만들어진 비슷한 모양의 코드지만, **의도적으로 서로 다른 서버**를 가리킨다.
이 둘을 "중복 코드"로 착각해서 하나로 합치거나 재사용을 시도하면 안 된다.

- `axiosInstance`: 브라우저에서 실행되며 **이 앱 자신**(same-origin)의 `/api/*`만 호출한다.
- `cmsApiClient`: Next.js 서버 프로세스 안, 오직 `src/app/api/*/route.ts` 내부에서만 실행되며
  완전히 별도로 배포된 저장소 `gospelfix.cms.api`를 호출한다.

**Why**: `cmsApiClient`는 `CMS_API_KEY`(서버간 신뢰용 비밀키)를 헤더에 실어 보낸다. 이 키가
브라우저 번들에 노출되면 누구나 cms.api를 직접 호출할 수 있게 되므로, 브라우저 쪽 axios
인스턴스는 절대 cms.api 주소를 알아서는 안 된다. 두 `baseURL`이 우연히 둘 다 `/api`로
시작해서 헷갈리기 쉽지만, `axiosInstance`의 `/api`는 **상대 경로**(브라우저 기준 same-origin)이고
`CMS_API_BASE_URL`은 **완전한 절대 URL**(다른 도메인)이라는 게 핵심 차이다. 실제 요청 흐름은
`브라우저(axiosInstance) → 이 앱의 /api/* Route Handler → cmsApiClient → cms.api → Supabase`
로 두 서버를 순차적으로 거친다.

**How to apply**: axios 관련 파일을 리팩토링/중앙화할 때는 "브라우저용"과 "서버용(cms.api
전용)"을 하나의 팩토리나 공용 모듈로 합치자는 제안이 나오면, 이 보안 경계 때문에 안 된다고
설명하고 각자 위치(브라우저 쪽은 `lib/axios/`, 서버 쪽은 `lib/cmsApi/`)를 유지해야 한다.
[[feedback_client_axios_scope]] (client-only 통합 결정)와 함께 참고.
