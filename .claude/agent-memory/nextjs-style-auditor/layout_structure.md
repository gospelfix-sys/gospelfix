---
name: 레이아웃 컴포넌트 구조
description: PublicHeader/Footer 위치, 클라이언트/서버 경계, (public) 라우트 그룹 구조
type: project
---

- `(public)/layout.tsx`: PublicHeader + Footer를 감싸는 서버 컴포넌트 레이아웃, `pt-16`으로 고정 헤더 오프셋 처리
- `PublicHeader`: 'use client' — Recoil(authUserAtom, authLoadingAtom) 구독, 스크롤 감지, 모바일 메뉴
- `Footer`: 서버 컴포넌트 (인터랙션 없음)
- 인터랙티브 이벤트(`onMouseEnter/Leave`)가 있는 UI는 반드시 클라이언트 컴포넌트로 분리 — page.tsx는 서버 컴포넌트

**How to apply:** page.tsx 내 호버 인터랙션이 필요한 섹션은 `src/components/main/` 하위 클라이언트 컴포넌트로 추출
