# 가스펄픽스 개발 철학

이 문서는 가스펄픽스(GOSPELFIX) 사용자 앱의 코드 작성 원칙을 정의한다.
아키텍처와 컨벤션의 상세 기준은 `CLAUDE.md`와 `.claude/rules/`가 우선하며,
이 문서는 구현 결정을 내릴 때의 사고 틀만 다룬다.

---

## 핵심 원칙

- **코드는 적을수록 좋다** — 가장 좋은 코드는 작성하지 않은 코드다
- **중복은 두 번째 등장에서 추출한다** — 같은 JSX가 2곳 이상 반복되면 추출 (`CLAUDE.md` 기준)
- **cms.api가 할 수 있는 것을 앱 코드로 구현하지 않는다** — 인증·데이터·검증 로직은 cms.api에 둔다. 이 앱은 Supabase를 직접 호출하지 않는다
- **타입은 any 없이** — 타입 안전성은 협상 불가
- **에러는 조용히 삼키지 않는다** — 모든 에러는 처리하거나 전파한다
- **지금 필요한 것만 구현한다** — "나중에 유용할 것 같아서"는 금지

---

## 결정 사다리

코드를 작성하기 전 아래 단계를 순서대로 통과한다.
이전 단계에서 해결되면 즉시 멈추고 그 방법을 사용한다.

```
1. [NEED]    지금 이 기능 없으면 동작 안 되나?
2. [EXIST]   src/lib, src/hooks, src/store, components/ui 에 이미 있나?
3. [NEXT]    Next.js 내장 기능으로 처리되나? (Server Component, Server Action, Route Handler 등)
4. [CMS]     cms.api가 처리하나? (인증, 데이터, 검증) → 필요하면 cms.api 저장소에서 해결
5. [PKG]     설치된 패키지로 되나? (zod, react-hook-form, shadcn/ui, recoil, sonner 등)
6. [PATTERN] 기존 BFF 패턴(serverFetch / cmsApiFetch / axiosInstance) 확장으로 되나?
7. [INLINE]  10줄 이하 인라인으로 해결되나?
8. [BUILD]   위 모두 해당 없을 때만: 최소 구현, 최소 파일, 최소 의존성
```

---

## 경고 신호

아래 상황이 오면 즉시 결정 사다리로 돌아간다:

- `yarn add`를 하려는 순간 → 5단계 재확인
- 새 파일을 3개 이상 만들려는 순간 → 8단계 재검토
- "나중에 유용할 것 같아서" → 1단계 위반
- 앱에서 Supabase나 cms.api를 직접 호출하려는 순간 → 4·6단계 재확인 (cms.api 호출은 `src/app/api/*/route.ts` 안에서만)
- 동일 패턴이 두 번째 등장 → 6단계 적용 후 추출
