---
name: 프로젝트 브랜드 메인 컬러
description: GOSPELFIX Mall admin 앱의 메인 브랜드 컬러 #ff5500 — 사용 위치, Tailwind 적용 방법, 출처
type: project
---

메인 브랜드 컬러는 `#ff5500` (오렌지-레드)이다.

**적용 위치 (admin 앱)**:
- 사이드바 로고 박스 배경색
- 사이드바 활성 메뉴 텍스트 색상
- 사이드바 메뉴 hover 상태 액센트

**Tailwind 적용 방법**:
- 텍스트: `text-[#ff5500]`
- 배경: `bg-[#ff5500]`
- 테두리: `border-[#ff5500]`
- CSS 변수로 등록된 경우 `--gf-orange`에 해당 (`var(--gf-orange)` 참조)

**Why:** 사용자가 TRSTUDIO 스타일 참고 디자인 이미지를 보고 직접 지정한 브랜드 컬러. main 앱의 `--gf-orange` CSS 변수와 동일한 값.

**How to apply:** admin 컴포넌트 작성 시 오렌지 계열 컬러가 필요하면 `#ff5500`을 기준으로 한다. `style=` 인라인 속성 금지 — 반드시 `className`의 Tailwind 임의값 또는 커스텀 토큰 클래스를 사용한다.
