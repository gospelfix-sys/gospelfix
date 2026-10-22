---
name: CLAUDE.md 섹션 참조
description: 프로젝트 규칙 문서(CLAUDE.md)의 주요 섹션과 역할
type: reference
---

프로젝트 루트의 `CLAUDE.md`가 모든 규칙의 단일 출처(single source of truth)다.
추가·수정 시 이 파일을 직접 편집한다.

## 주요 섹션

| 섹션 | 위치 | 내용 |
|------|------|------|
| 패키지 매니저 | `## 패키지 매니저` | yarn 전용, npm 금지 |
| Prettier 규칙 | `## 코드 컨벤션 (Prettier)` | 쌍따옴표, 세미콜론, 100자, 2칸 들여쓰기, 후행쉼표 |
| 인라인 style= 금지 | `### 인라인 style= 속성 절대 금지` | className만 허용, Tailwind 임의값 사용 |
| cn() 사용 | `### className 병합은 반드시 cn() 사용` | clsx+tailwind-merge 래퍼 |
| admin 아키텍처 | `## admin/ 아키텍처` | Next.js 15 + React 19, 경로 구조, Recoil |
| main 아키텍처 | `## main/ 아키텍처` | Next.js 14 + React 18, 인증 흐름, Toss Payments |
| Supabase 쿼리 규칙 | `### Supabase 데이터 접근 규칙` | lib/supabase/ 에만 쿼리 작성, select('*') 지양 |
| createAdminClient 보안 | `### createAdminClient 보안 체크리스트` | server-only, NEXT_PUBLIC_ 금지, 클라이언트 import 금지 |
| 환경변수 | `## 환경변수` | .env 파일 구조, TOSS_SECRET_KEY 서버 전용 |

## 관련 문서

- `admin/src/components/README.md` — admin 컴포넌트 폴더별 역할 설명
- `.claude/rules/` — 추가 코딩 컨벤션 규칙 (존재 시)
