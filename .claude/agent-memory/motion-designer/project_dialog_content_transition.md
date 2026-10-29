---
name: dialog-content-transition
description: 다이얼로그 안 뷰 전환 모션(AuthModal) 패턴과 함정 — 닫힘 중 null 상태, popLayout+높이 측정, overflow-hidden 포커스 링 잘림
metadata:
  type: project
---

2026-10-29 로그인 모달 뷰 전환(social/login/signup) 작업에서 확인한 것.

1. 상태 기반 모달은 닫히는 순간 view가 null이 되지만 base-ui는 퇴장 애니메이션 동안 팝업을 남겨둔다. null을 fallback 뷰로 렌더하면 닫히는 0.2초 동안 내용이 다른 뷰로 바뀌고, key 기반 AnimatePresence면 전환 모션까지 재생된다.
   **How to apply:** 다이얼로그 내용을 상태 값으로 고르는 곳에는 마지막 non-null 값을 유지해 렌더한다(AuthModal `lastView`).

2. 높이가 다른 뷰 전환은 `AnimatePresence mode="popLayout"` + ResizeObserver로 잰 높이를 바깥 motion.div `height`로 애니메이션하는 방식으로 했다. 측정 결과 퇴장 약 0.2초, 등장과 높이 변화 약 0.3초가 겹쳐서 끝난다. `wait`보다 빠르고 높이도 한 번만 바뀐다. popLayout은 퇴장하는 자식을 absolute로 빼므로 측정용 래퍼에 `relative`가 필요하다.

3. 높이 래퍼의 `overflow-hidden`이 Input의 `ring-3` 포커스 링을 자르므로 `-m-1` 바깥 + `p-1` 안쪽으로 서로 상쇄해 여유를 둔다.

관련: [[home-layer-motion]]
