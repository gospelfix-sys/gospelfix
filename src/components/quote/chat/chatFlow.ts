export type ChatStepId =
  | "target"
  | "site"
  | "response"
  | "branding"
  | "care"
  | "features"
  | "result"
  | "done";

export interface ChatOption {
  label: string;
}

export interface ChatStepConfig {
  id: ChatStepId;
  question: string;
  options: ChatOption[];
}

// 선택지 문구는 pricingData.ts의 가격표 항목(대상·홈페이지·응대·브랜딩·유지보수)과 같은
// 표현을 쓴다. 가격표를 고치면 여기도 함께 맞춘다. 중간 단계에서는 가격을 노출하지 않는다.
export const CHAT_STEPS: Record<
  "target" | "site" | "response" | "branding" | "care" | "features",
  ChatStepConfig
> = {
  target: {
    id: "target",
    question: "어떤 상황의 사업장이신가요?",
    options: [
      { label: "홈페이지가 없는 1인 가게" },
      { label: "문의·예약을 놓치는 가게" },
      { label: "쇼핑몰·결제·가맹 문의가 있는 업체" },
      { label: "아직 잘 모르겠어요" },
    ],
  },
  site: {
    id: "site",
    question: "어떤 형태의 홈페이지를 생각하고 계세요?",
    options: [{ label: "모바일 1페이지형" }, { label: "멀티페이지" }],
  },
  response: {
    id: "response",
    question: "고객 문의는 어떻게 받고 싶으세요?",
    options: [
      { label: "문의·예약 폼 + 하단 고정 바" },
      { label: "챗봇 24시간 + 문의 내역 확인" },
      { label: "챗봇 24시간 + 결제·쇼핑몰 기능" },
    ],
  },
  branding: {
    id: "branding",
    question: "브랜딩은 어느 정도까지 필요하세요?",
    options: [
      { label: "로고·컬러·폰트 간이 가이드" },
      { label: "로고 + 정식 브랜딩 가이드" },
      { label: "정식 브랜딩 가이드 + 광고소재 초기 세트" },
    ],
  },
  care: {
    id: "care",
    question: "제작 후 유지보수도 필요하신가요?",
    options: [
      { label: "Care Basic (호스팅·도메인·백업)" },
      { label: "Care Standard (챗봇 답변 업데이트·문의 월간 요약)" },
      { label: "Care Plus (광고 통계 리포트·광고소재 제작)" },
      { label: "필요 없어요" },
    ],
  },
  features: {
    id: "features",
    question: "함께 필요한 기능이 있다면 모두 선택해주세요.",
    options: [
      { label: "관리자 화면" },
      { label: "광고·유입 통계 리포트" },
      { label: "광고소재 제작" },
      { label: "잘 모르겠어요" },
      { label: "필요 없어요" },
    ],
  },
};

// "features" 단계는 다중 선택이다. 이 두 라벨은 구체적 기능 선택과 양립할 수 없는
// 단독 선택지라 — 하나를 고르면 나머지 선택(구체적 기능 포함)이 모두 해제된다.
export const EXCLUSIVE_FEATURE_LABELS = ["잘 모르겠어요", "필요 없어요"];

export function getNextStep(current: ChatStepId): ChatStepId {
  switch (current) {
    case "target":
      return "site";
    case "site":
      return "response";
    case "response":
      return "branding";
    case "branding":
      return "care";
    case "care":
      return "features";
    case "features":
      return "result";
    case "result":
      return "done";
    case "done":
      return "done";
  }
}
