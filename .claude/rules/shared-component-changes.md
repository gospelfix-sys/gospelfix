# 공용 컴포넌트/스타일 수정 원칙

## 핵심 규칙

> **공용(shared)·공통(common)으로 여러 곳에서 쓰이는 컴포넌트, 훅, 유틸, 스타일은 개별
> 호출부가 아니라 그것이 정의된 파일 자체를 고쳐서, 사용하는 모든 곳에 자동으로 반영되게
> 한다.**

개별 호출부에서 매번 값을 반복 지정하는 방식은 "다음에 같은 걸 새로 쓸 때 이 규칙을 깜빡하면
똑같은 버그가 재발한다"는 구조적 위험을 항상 안고 있다. 사람이든 에이전트든 예외가 아니다.

## 사례: `components/ui/dialog.tsx`

`DialogContent`는 모바일에서 좌우 여백을 `max-w-[calc(100%-2rem)]`(max-width 계열
유틸리티)로 확보하고 있었다. 이후 두 호출부가 데스크톱 너비를 키우려고 접두사 없는
`max-w-lg`/`max-w-md`로 덮어쓰면서, tailwind-merge가 이를 "같은 유틸리티 그룹"으로 보고
모바일 여백까지 함께 지워버렸다. 같은 버그가 한 세션에서 두 번 반복됐다.

```tsx
// ❌ 매번 호출부에서 반복 (재발 위험 — 세 번째 호출부가 생기면 또 깨짐)
<DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
<DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">

// ✅ 공용 정의 자체를 고쳐서 한 번에 해결
// dialog.tsx의 DialogContent 기본 클래스:
//   모바일: inset-x-4                     (position 속성으로 여백 확보 — max-width와 무관)
//   데스크톱: sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm
// → 호출부는 이제 sm:max-w-lg 처럼 원하는 값만 얹으면 됨. 모바일 여백은 절대 깨지지 않음.
<DialogContent className="sm:max-w-lg">
```

핵심은 "여백 확보"와 "최대 너비 제한"이라는 서로 다른 관심사를 서로 다른 CSS 속성(`inset`
vs `max-width`)으로 분리해, 한쪽을 덮어써도 다른 쪽이 깨지지 않도록 설계한 것이다.

## 적용 대상

Dialog 하나에 국한된 규칙이 아니다. 다음 모두에 동일하게 적용한다.

- `components/ui/*` 아래의 모든 shadcn/ui 프리미티브 (Button, Card, Sheet, Toast 등)
- 여러 도메인 컴포넌트에서 재사용되는 커스텀 훅
- 여러 곳에서 import하는 공용 유틸 함수
- `tailwind.config.ts`의 커스텀 토큰, 공용 CSS 변수

## 판단 기준

공용 정의를 고칠지, 호출부를 고칠지 판단할 때 다음을 자문한다.

1. **이 변경을 쓰는 곳마다 반복해야 하는가?** → 그렇다면 공용 정의 파일을 고친다.
2. **이 호출부만 예외적으로 다른 값이 필요한가?** (예: 이 다이얼로그만 유독 넓어야 함) →
   그 경우에만 호출부에서 개별 오버라이드한다.
3. 오버라이드가 "모든 사용처에 공통으로 필요한 UX 보장"(예: 모바일 여백)을 침범하지 않는지
   확인한다. 침범한다면 공용 정의를 서로 다른 CSS 속성/책임으로 재설계해 원천 차단한다.

## 참고

- `code-reviewer` 에이전트는 이 패턴을 Major 리뷰 항목으로 검사한다
  (`.claude/agents/code-reviewer.md` "프론트엔드 스타일 규칙" 참고).
- `component-writer` 에이전트의 "절대 준수 규칙"에도 동일 원칙이 포함되어 있다.
- 관련 메모리: `.claude/memory/feedback_shared_component_single_source_of_truth.md`
