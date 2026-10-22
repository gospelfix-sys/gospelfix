---
name: 프로젝트 스타일 설정
description: GOSPELFIX Mall main 앱의 shadcn/ui 스타일, Tailwind 버전, 브랜드 색상 토큰 정보
type: project
---

- shadcn/ui 스타일: base-nova — `asChild` prop 없음, `<Link className={buttonVariants()}>` 패턴 사용
- Tailwind 버전: v3 (`tailwind.config.ts` 기반, `@tailwind base/components/utilities` 사용)
- 브랜드 CSS 토큰: `--gf-bg`, `--gf-white`, `--gf-black`, `--gf-gray1~3`, `--gf-border`, `--gf-orange`, `--gf-orange2`, `--gf-orange-bg`
- 폰트: `--font-kr` (Pretendard Variable), `--font-en` (DM Sans) — Tailwind `font-sans`/`font-en` 으로 매핑됨
- GOSPELFIX 유틸리티 클래스: `gf-text-black`, `gf-text-orange`, `gf-bg-white`, `gf-border`, `gf-badge`, `gf-hero-title`, `gf-section-label`, `gf-section-title`, `gf-btn-primary`, `gf-btn-secondary`, `gf-feature-card`, `gf-badge-pick`, `gf-badge-new`

**Why:** base-nova는 @base-ui/react/button 기반으로 Radix asChild 패턴 미지원
**How to apply:** 버튼처럼 보이는 Link는 반드시 `buttonVariants()` 클래스를 직접 적용
