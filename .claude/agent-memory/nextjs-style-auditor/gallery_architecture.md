---
name: 갤러리 페이지 아키텍처
description: HeroBanner/CtaBanner 분리 패턴, ProductCard 배지 시스템, 카드 그리드 레이아웃
type: project
---

## 컴포넌트 분리 패턴

- `src/components/main/HeroBanner.tsx` — 'use client', 3슬라이드 자동로테이션(3초), 화살표/도트 인디케이터
- `src/components/main/CtaBanner.tsx` — 'use client', 하단 CTA 섹션 (onMouseEnter/Leave 호버)
- `src/components/products/ProductCard.tsx` — 'use client', isPick/isNew prop 수신
- `src/app/(public)/main/page.tsx` — 서버 컴포넌트, products fetch 후 isPick(index<3)/isNew(30일 이내) 계산하여 전달

## ProductCard 배지 로직

- `isPick`: 현재는 index < 3 (DB products.is_featured 필드 추가 시 교체 예정)
- `isNew`: created_at 기준 30일 이내, isPick과 동시에 true면 PICK 우선
- 제작자(publisher): 현재 'GOSPELFIX' 하드코딩, 추후 product.publisher 필드 추가 시 교체

## 카드 그리드

- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` — webjangi 스타일 4열 갤러리
- gap-5 (기존 gap-6 → 좀 더 밀도 있는 갤러리 느낌)
