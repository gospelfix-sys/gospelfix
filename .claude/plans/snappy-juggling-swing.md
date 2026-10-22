# 결제 안내 팝업 QR코드 동적 생성으로 전환

## Context

상품 상세페이지의 `BuyButton`과 장바구니 `CartModal`에서 결제 시 뜨는 팝업(`PaymentModal.tsx`,
`BatchPaymentModal/index.tsx`)은 현재 미리 캡처해둔 **정적 카카오페이 QR 이미지**
(`public/qr-payment-v1.png`)를 보여준다. 이 QR은 계좌 정보를 담고 있지 않은 단순 이미지 파일이라,
스캔해도 아무 정보도 전달되지 않는다.

사용자는 참고 이미지(free4qr.com 스타일)처럼 **계좌 정보를 실제로 인코딩한 동적 QR**로 바꾸고
싶어한다. 확인 결과 최종 방향은 다음과 같다:

- **UI 형식**: 기존처럼 **팝업(모달)** 유지 — `/pay` 페이지 라우트 신설 안 함
- **QR 인코딩 방식**: 은행/계좌번호/예금주/금액을 담은 **텍스트를 동적 QR로 인코딩**
  (토스 개인 송금 링크나 은행 딥링크는 사용하지 않음 — 범용 표준이 없어 재현성이 없음)
- **웹훅 연동**: 이번 범위 아님 — 기존처럼 사용자가 "입금했어요" 버튼을 눌러 수동으로 알리는
  흐름(`/orders/notify-payment`, `/orders/notify-payment-batch`) 그대로 유지

추가로 조사 중 발견한 사실: `PaymentModal.tsx`와 `BatchPaymentModal/index.tsx`는 QR·계좌정보
블록이 **100% 동일하게 중복**되어 있다(`ACCOUNT_INFO` 상수, QR 렌더 마크업까지 완전 동일).
`.claude/rules/shared-component-changes.md`는 "여러 곳에서 반복해야 하는 변경은 호출부가 아니라
공용 정의 파일 자체를 고친다"를 명시하고 있고, 이번 QR 교체가 정확히 두 파일에 동일하게
적용해야 하는 변경이므로 이 기회에 중복 블록을 공용 컴포넌트로 추출한다(안 그러면
`code-reviewer`가 Major로 잡을 사안이기도 함).

## 구현 계획

### 1. 라이브러리 설치

```bash
yarn add qrcode.react
```

가볍고 TS 타입 내장, `QRCodeSVG` 컴포넌트로 텍스트 → SVG QR을 즉시 렌더 가능. 별도 서버 호출이나
이미지 생성 API 불필요(클라이언트에서 즉시 렌더).

### 2. 계좌 정보 단일 소스 추출

`src/lib/paymentAccount.ts` 신규 생성 — 현재 두 파일에 중복된 `ACCOUNT_INFO` 상수를 여기로
이전:

```ts
export const ACCOUNT_INFO = {
  bank: process.env.NEXT_PUBLIC_PAYMENT_BANK ?? "",
  number: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT ?? "",
  holder: process.env.NEXT_PUBLIC_PAYMENT_HOLDER ?? "",
};
```

### 3. 공용 컴포넌트 `AccountTransferCard` 신규 생성

`src/components/orders/AccountTransferCard.tsx` (신규 `orders` 도메인 폴더 — 결제/주문 관련
공용 UI를 모아둘 위치, `component-layers.md`의 `components/[domain]/` 규칙과 일치).

- Props: `amount: number` 하나만 받음 (계좌정보는 위 단일 소스에서 직접 import)
- 내부에서 QR에 인코딩할 텍스트 조합:
  ```
  은행: {bank}
  계좌번호: {number}
  예금주: {holder}
  금액: {amount.toLocaleString("ko-KR")}원
  ```
- `<QRCodeSVG value={qrText} size={176} />` 로 QR 렌더 (기존 `h-44 w-44` = 176px와 동일 크기 유지)
- 계좌정보 카드(은행/계좌번호/예금주) — 기존 마크업 그대로 이전
- **계좌번호 복사 버튼** 추가: `ShareButton.tsx`의 `navigator.clipboard.writeText()` + `toast()`
  패턴 재사용(신규 유틸 만들지 않고 기존 패턴 그대로 인라인 구현). 참고 이미지의 "계좌번호 자동
  복사" 의도를 실제 자동 복사(스캔 시 트리거 불가)가 아닌, 사용자가 누르면 복사되는 버튼으로
  구현 — 스캔 실패/텍스트만 보이는 카메라 앱 사용자를 위한 보완.
- 스타일은 프로젝트 기존 팔레트(모달에서 이미 쓰는 `gray-50`/`gray-200`/`orange` 톤)를 따름 —
  참고 이미지의 파란색을 그대로 베끼지 않는다.

### 4. 기존 두 모달에서 중복 블록 교체

`src/components/products/PaymentModal.tsx`, `src/components/cart/BatchPaymentModal/index.tsx`
각각에서:

- `QR_IMAGE_PATH`, `ACCOUNT_INFO` 로컬 상수, `Image` import, "QR 코드" + "계좌 정보" 두 블록
  (기존 라인 81~107 상당) 삭제
- 그 자리에 `<AccountTransferCard amount={amount} />` 한 줄로 교체 (`import AccountTransferCard
  from "@/components/orders/AccountTransferCard"`)
- "입금 금액 + 주문번호/상품개수" 블록(오렌지 카드)은 두 파일이 서로 다른 데이터(주문번호 vs
  상품개수)를 보여주므로 공용화하지 않고 각 파일에 그대로 둠

### 5. 미사용 정적 이미지 정리

`public/qr-payment-v1.png`를 참조하는 곳이 이 두 파일뿐임을 확인했음(grep으로 검증 완료). 교체
후 더 이상 참조되지 않으므로 삭제. 실행 단계에서 `git status`로 다른 변경과 섞이지 않는지 확인
후 `git rm` 처리.

## 검증 방법

1. `yarn build` — 타입 에러 및 QR 컴포넌트 빌드 확인
2. `yarn dev` 실행 후 브라우저로:
   - 상품 상세페이지 → 구매 버튼 → `PaymentModal` 팝업에서 QR이 렌더되는지, 계좌정보가 정확히
     표시되는지 확인
   - 계좌번호 복사 버튼 클릭 → 토스트 메시지 + 실제 클립보드 복사 확인
   - 장바구니에서 여러 상품 선택 후 결제 → `BatchPaymentModal`에서 동일하게 동작하는지 확인
3. 실제 스마트폰 카메라로 QR을 스캔해 은행/계좌번호/예금주/금액 텍스트가 올바르게 인식되는지
   확인
4. `yarn lint` 통과 확인

## 실행 후 변경 사항 (최종 구현과의 차이)

계획 실행 후 사용자 피드백을 반영하며 다음과 같이 방향이 바뀌었다.

- **QR 방식**: 계좌 텍스트를 `qrcode.react`로 동적 인코딩했더니 일부 카메라 앱이 계좌번호
  (하이픈 포함 숫자)를 전화번호로 오인해 "통화하시겠습니까?" 프롬프트를 띄우는 문제가 발견됨.
  이후 사용자가 실제 결제 앱으로 연결되는 QR을 원한다는 요구가 명확해졌고, 최종적으로는
  사용자가 직접 제공한 QR 이미지(`public/qr-transfer.png`)를 그대로 사용하는 정적 이미지
  방식으로 되돌아갔다. `qrcode.react`는 설치했다가 다시 제거함(최종 의존성 변경 없음).
- **`AccountTransferCard`**: 계좌번호 복사 버튼은 최종 UI에서 제외(사용자가 준 참고 디자인에
  없어 정확히 재현하는 쪽을 택함). "송금 정보" 헤더 카드에 사이트 메인 컬러(`gf-orange`)를
  적용한 디자인으로 재구성.
- **모달 stacking context 버그 수정**: 상세페이지의 `lg:sticky` 부모가 새 CSS stacking
  context를 만들어 팝업이 z-index와 무관하게 상단 헤더 아래로 깔리는 문제를 발견 →
  `PaymentModal`/`BatchPaymentModal`을 `createPortal(..., document.body)`로 감싸서 해결.
- **모달 셸 공용화 추가**: code-reviewer 리뷰에서 두 모달의 오버레이/카드/닫기버튼/완료화면
  마크업이 여전히 100% 중복된다는 Major 지적을 받아, `src/components/orders/
  PaymentInstructionModal.tsx`를 신규 추출해 두 모달이 공유하도록 정리함(각 파일에는
  `orderId`/`orderIds` 등 도메인별로 다른 로직과 "입금 금액 + 주문번호/상품개수" 블록만 남음).
