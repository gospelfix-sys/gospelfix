---
name: admin 컴포넌트 폴더 구조
description: admin/src/components/ 하위 도메인별 폴더 구조와 각 파일의 역할
type: project
---

`admin/src/components/`는 도메인·역할별 폴더로 분리되어 있다.

```
components/
├── editor/
│   ├── SlashCommandList.tsx     # / 커맨드 팔레트 UI (forwardRef)
│   └── TipTapEditor/
│       ├── index.tsx            # TipTap 에디터 본체
│       └── TipTapEditor.css     # 에디터 전용 스타일
├── layout/
│   └── AdminNav.tsx             # 좌측 사이드바 (usePathname 활성 메뉴)
├── news/
│   ├── NewsForm.tsx             # 소식 폼 본체
│   └── NewsFormWrapper.tsx      # 액션 바 + ConfirmDialog
├── portfolio/
│   ├── PortfolioForm.tsx        # 포트폴리오 폼 본체 (dnd-kit 이미지 정렬)
│   └── PortfolioFormWrapper.tsx # 액션 바 + ConfirmDialog
├── products/
│   ├── ProductForm.tsx          # 상품 폼 본체
│   ├── ProductFormWrapper.tsx   # 액션 바 + ConfirmDialog
│   └── DeleteProductButton.tsx  # 목록 행 단건 삭제 버튼
├── providers/
│   └── RecoilProvider.tsx       # "use client" RecoilRoot 래퍼
└── ui/
    ├── Badge/
    ├── Button/
    ├── Checkbox/
    ├── ConfirmDialog/
    └── SortableTableBody/       # dnd-kit 테이블 행 드래그&드롭
```

**데이터 흐름 패턴:**
`FormWrapper → formRef.current?.requestSubmit() → Form.handleSubmit() → onSubmit(Server Action)`

**Why:** 기존에 components/ 루트에 flat하게 놓였던 파일들을 도메인별로 그룹핑하여 main/ 구조와 통일.

**How to apply:** 새 컴포넌트 추가 시 도메인에 맞는 폴더에 배치. 공통 UI는 ui/ 하위에 추가.
상세 설명은 `admin/src/components/README.md` 참조.
