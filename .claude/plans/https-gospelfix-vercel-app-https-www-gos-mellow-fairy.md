# www.gospelfix.vercel.app 접속 지원 + 향후 커스텀 도메인 대비

## Context

사용자가 `https://gospelfix.vercel.app/`뿐 아니라 `https://www.gospelfix.vercel.app/`로도
접속했을 때 정상적으로 서비스가 뜨길 원한다. 현재는 `NET::ERR_CERT_COMMON_NAME_INVALID`
인증서 오류가 발생한다.

**조사 결과, 이 문제는 코드로 해결할 수 없는 Vercel 플랫폼 자체의 한계다.**

- `vercel.app`은 Vercel이 소유한 도메인이다. 사용자는 자신의 프로젝트에
  `www.<project>.vercel.app`처럼 `vercel.app`의 임의 서브도메인을 커스텀 도메인으로
  등록할 수 없다(DNS 소유권 검증이 애초에 불가능한 도메인이기 때문).
- `www.gospelfix.vercel.app`으로 접속하면 DNS는 Vercel 엣지로 연결되지만, 그 호스트명에
  매핑된 프로젝트가 없어서 `*.vercel.app`(1단계 와일드카드) 인증서만 응답하고, 이 인증서는
  2단계 서브도메인인 `www.gospelfix.vercel.app`을 커버하지 못해 TLS 핸드셰이크 단계에서
  브라우저가 차단한다.
- TLS 핸드셰이크 실패이므로 `next.config.mjs`, `middleware.ts`, `vercel.json` 등 이
  저장소의 어떤 코드도 이 요청에 도달하지 못한다. 실제로 저장소를 확인한 결과 현재
  `redirects()`, 호스트 기반 미들웨어 분기, 쿠키 `domain` 설정 등 www/apex 관련 로직은
  전혀 없다.

즉 **지금 당장은 `www.gospelfix.vercel.app`을 살릴 방법이 없다.** 사용자도 이미 알고
있듯, 유일한 해결책은 커스텀 도메인을 구매해서 Vercel 프로젝트의 Domains 설정에 apex와
www 양쪽을 모두 등록하는 것이다(그러면 Vercel이 두 호스트 각각에 대해 정상적으로 인증서를
발급한다).

사용자와 상의한 결과:
- 최종 대표(canonical) URL은 **www 없는 apex 도메인**으로 정했다 (예: `gospelfix.com`,
  `www.gospelfix.com` → `gospelfix.com`으로 리다이렉트).
- 지금 당장 효과는 없지만(현재 `gospelfix.vercel.app` 트래픽에는 영향 없음), 커스텀
  도메인을 연동하는 순간 자동으로 작동하도록 리다이렉트 규칙을 **지금 미리 추가**해두기로
  했다.

## 변경 사항

### `next.config.mjs`에 `redirects()` 추가

`www.`로 시작하는 모든 호스트를 apex(= `www.` 제거한 호스트)로 308 영구 리다이렉트한다.
특정 도메인 문자열을 하드코딩하지 않고 정규식 캡처 그룹으로 호스트를 그대로 넘기므로,
지금의 `gospelfix.vercel.app`이든 나중에 연동할 실제 커스텀 도메인이든 코드 변경 없이
그대로 재사용된다.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.(?<host>.*)",
          },
        ],
        destination: "https://:host/:path*",
        permanent: true,
      },
    ];
  },
  transpilePackages: ["swiper"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
```

- `has: [{ type: "host", value: "www.(?<host>.*)" }]` — 요청 호스트가 `www.`로 시작하는
  경우에만 매칭되고, `www.` 뒤의 나머지 부분을 `host`라는 이름으로 캡처한다.
- `destination: "https://:host/:path*"` — 캡처된 호스트(= www 제거된 apex)로, 원래
  경로/쿼리를 유지한 채 리다이렉트한다.
- `permanent: true` — 308(영구) 리다이렉트. 대표 URL을 apex로 확정했으므로 검색엔진
  캐노니컬라이제이션 관점에서도 영구 리다이렉트가 맞다.

### 지금 반영되지 않는 이유(중요, 사용자에게도 안내 필요)

이 규칙은 **요청이 Next.js 앱까지 도달해야만** 실행된다. `www.gospelfix.vercel.app`은
위에서 설명했듯 TLS 단계에서 이미 차단되어 애초에 앱까지 요청이 오지 않으므로, 이 코드를
배포해도 현재 겪고 있는 인증서 오류는 그대로 남는다. 이 커밋은 순수하게 "다음에 커스텀
도메인을 연결했을 때 바로 작동하도록" 미리 준비해두는 것이다.

## 향후 커스텀 도메인 연동 시 사용자가 해야 할 일 (Vercel 대시보드, 코드 변경 아님)

1. Vercel 프로젝트 → Settings → Domains에서 구매한 도메인의 apex(`example.com`)와
   `www.example.com`을 **둘 다** 추가한다.
2. 도메인 등록기관(가비아, 후이즈 등)에서 Vercel이 안내하는 대로 A/CNAME 레코드를 설정해
   소유권을 검증한다.
3. Vercel이 두 호스트 각각에 대해 자동으로 유효한 TLS 인증서를 발급한다.
4. 이후 `www.example.com`으로 접속하면 이번에 추가한 `redirects()` 규칙이 자동으로
   `example.com`으로 308 리다이렉트한다. 별도 코드 작업이 필요 없다.
5. (선택) `src/app/layout.tsx`의 `NEXT_PUBLIC_SITE_URL` 폴백값(`"https://gospelfix.vercel.app"`)과
   Vercel 환경변수 `NEXT_PUBLIC_SITE_URL`을 실제 커스텀 도메인 apex 값으로 갱신해야
   메타데이터(`metadataBase`, OG `url`)가 새 도메인을 정확히 가리킨다. 이번 작업 범위는
   아니며, 도메인 연동 시점에 별도로 처리한다.

## 검증 방법

- `yarn build` 로 `next.config.mjs` 문법 오류 및 타입 체크 통과 확인.
- 로컬에서 `yarn dev` 실행 후, `curl -I -H "Host: www.localhost:3000" http://localhost:3000/`
  등으로 호스트 헤더를 조작해 308 리다이렉트가 `Location: https://localhost:3000/`로
  응답하는지 확인(로컬에서는 `X-Forwarded-Host` 없이 `Host` 헤더 매칭이 정확히 재현되지
  않을 수 있으므로, 정확한 검증은 배포 후 실제 `www.` 서브도메인이 프로젝트에 연결된
  시점에 브라우저로 직접 확인).
- 배포 후 `gospelfix.vercel.app` (www 없는 기존 URL)이 기존과 동일하게 정상 동작하는지
  회귀 확인 — 이 리다이렉트는 `www.`로 시작하는 호스트에만 매칭되므로 기존 apex 트래픽에는
  영향이 없어야 한다.
