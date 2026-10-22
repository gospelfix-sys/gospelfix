---
name: slug_input_ime_composition_pattern
description: 실시간 필터링(slugify 등)을 적용하는 controlled input은 한글 IME 조합 중 강제 필터링하면 입력이 깨질 수 있어 isComposing 분기가 필요한 패턴
type: feedback
---

`UploadWorkEditor.tsx`의 슬러그(URL) 입력 필드 리뷰에서 발견한 패턴. `slugify()` 정규식을
한글 허용에서 영문 소문자/숫자/하이픈 전용으로 좁히면서, 입력 핸들러가 매 keystroke마다
`setSlug(slugify(value))`를 호출해 controlled input의 value를 즉시 덮어썼다. 1차 리뷰에서
BLOCKED — 한글 IME 조합 중(사용자가 실수로 한글 입력기를 켜둔 채 타이핑)에는 브라우저가
`compositionstart` → 여러 차례 `input`(React `onChange`도 매번 발생) → `compositionend`
순서로 조합 버퍼를 관리하는데, 조합이 끝나기 전에 React가 필터링된(대부분 빈 문자열) 값으로
강제 리렌더링하면 브라우저의 조합 버퍼와 React가 그리는 DOM value가 어긋나 조합이 깨지거나
글자가 중복/누락될 수 있다.

**Why:** 이 프로젝트에는 이미 `ChatPanel.tsx:115`에 `e.nativeEvent.isComposing`으로 한글
IME 조합 상태를 체크하는 선례가 있다(Enter 키 전송 방지 목적). "타이핑 즉시 필터링"이
요구사항인 입력 필드(슬러그, 아이디, 코드 등 ASCII 전용 필드)에서 흔히 재현되는
controlled-input IME 버그 패턴이라, 이 저장소에서는 같은 기준을 일관되게 적용해야 한다.

**How to apply:** slug/username/코드 같이 "특정 문자만 허용 + 실시간 필터링"을 요구하는
새 입력 필드를 리뷰할 때마다, `onChange`에서 매 keystroke마다 강제 필터링을 적용하는지,
그리고 `e.nativeEvent.isComposing`(또는 `onCompositionEnd`) 분기가 있는지 반드시 확인할
것. 없다면 Major로 판정. 해결 패턴(2026-08-28 실제 적용분,
`components/growth/UploadWorkEditor.tsx`):

```tsx
function handleSlugChange(value: string, isComposing: boolean) {
  setSlug(isComposing ? value : slugify(value));
}

<Input
  value={slug}
  onChange={(e) => handleSlugChange(e.target.value, e.nativeEvent.isComposing)}
  onCompositionEnd={(e) => setSlug(slugify((e.target as HTMLInputElement).value))}
/>
```

영문 타이핑은 애초에 composition 이벤트가 발생하지 않아 기존 실시간 필터링 동작에 영향이
없고, 한글 IME가 켜진 예외 케이스에서만 조합 완료 시점에 정리된다.
