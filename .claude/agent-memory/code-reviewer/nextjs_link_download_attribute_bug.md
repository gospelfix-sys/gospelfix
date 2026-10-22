---
name: nextjs_link_download_attribute_bug
description: next/link의 Link 컴포넌트에 download 속성을 붙여도 클릭 시 다운로드가 아니라 클라이언트 라우팅으로 가로채짐 — 정적 자산 다운로드는 반드시 plain <a> 사용
type: feedback
---

## 발견 경위 (2026-08-11, "상품 상세페이지 AI 확장 킷" 기능 리뷰)

`ProductInfoChips.tsx`가 `next/link`의 `Link` 컴포넌트에 `download` 속성을 붙여
`/downloads/claude-starter-kit.zip`(public 정적 파일) 다운로드 링크를 구현했다:

```tsx
<Link href={href} download className="text-gf-orange2 underline">
  {value}
</Link>
```

`node_modules/next/dist/client/link.js`의 `isModifiedEvent()`를 직접 확인한 결과, 클릭 이벤트를
가로채지 않는 예외 조건은 `target !== "_self"`, `metaKey`/`ctrlKey`/`shiftKey`/`altKey`, 휠클릭뿐이며
**`download` 속성은 전혀 검사하지 않는다**. App Router(`isAppRouter: true`)에서는 로컬 URL 여부
검사(`!isAppRouter && !isLocalURL(href)`)도 항상 우회되므로, 일반 좌클릭 시 무조건
`e.preventDefault()` 후 `router.push(href)`로 클라이언트 사이드 소프트 네비게이션을 시도한다.
`/downloads/*.zip`은 실제 App Router 페이지가 아니므로 이 소프트 네비게이션은 브라우저의
네이티브 "파일 저장" 동작을 트리거하지 못하고 깨진 전환/에러로 이어진다 — 즉 클릭해도 실제로는
파일이 다운로드되지 않는다.

**Why:** 이 문제는 Next.js 커뮤니티에서 잘 알려진 함정(GitHub issue 다수)으로, `next/link`는
SPA 네비게이션 의도로 설계되어 있어 네이티브 브라우저 다운로드 의도(`download` 속성)와
충돌한다. 코드 리뷰 시 `<Link ... download>` 패턴을 보면 TypeScript/ESLint 어느 쪽도 오류를
잡아주지 않으므로(둘 다 정상 컴파일됨) 반드시 수동으로 `node_modules/next/dist/client/link.js`의
`isModifiedEvent`/`linkClicked` 로직을 근거로 판단해야 한다.

**How to apply:**
- 정적 자산(zip, pdf, 이미지 원본 등) 다운로드 링크는 `next/link`의 `Link`가 아니라 **plain
  `<a href={...} download>`**를 사용한다 (import도 `next/link` 대신 native `<a>`).
- `Chip.href` 같은 범용 href 필드를 만들 때는 "페이지 내비게이션용"과 "파일 다운로드용"을
  구분하는 게 이상적이나, 최소한 다운로드 목적이 확실하면 `<a>`로 렌더링하도록 분기할 것.
- 리뷰 시 `grep -rn "download" src --include=*.tsx`로 `<Link ... download>` 조합을 전수
  검색해 동일 패턴이 다른 곳에도 있는지 확인한다.
