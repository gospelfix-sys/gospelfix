---
name: Quote Wizard 구현 완료
description: /quote 경로에 5단계 가견적 신청 위저드 구현 — Recoil sessionStorage 퍼시스턴스, jsPDF 동적 임포트, Supabase anon INSERT
type: project
---

5단계 가견적 위저드가 `(public)/quote` 라우트에 구현됨.

**Why:** 디자인 서비스 특성상 사전 견적 확인 수요가 높아 비인증 사용자도 접근 가능한 공개 라우트로 구현. Supabase `quote_submissions` 테이블에 anon INSERT로 제출.

**How to apply:** quote 관련 기능 수정 시 `src/lib/quote/` (순수 함수·정적 데이터), `src/components/quote/` (UI), `src/store/atoms/quoteAtom.ts` (상태), `src/types/quote.types.ts` (타입) 분리 구조를 유지할 것. PDF 생성은 `pdfGenerator.ts`에서 jsPDF + html2canvas를 dynamic import로 처리 (SSR 방지 필수).
