export type ChatStepId =
  | "purpose"
  | "format"
  | "pageCount"
  | "showcase"
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

export const CHAT_STEPS: Record<
  "purpose" | "format" | "pageCount" | "showcase" | "features",
  ChatStepConfig
> = {
  purpose: {
    id: "purpose",
    question: "먼저, 홈페이지를 새로 제작하시나요?",
    options: [{ label: "새로 제작해요" }, { label: "운영 중인 사이트를 다시 만들래요" }],
  },
  format: {
    id: "format",
    question: "어떤 형태의 홈페이지를 생각하고 계세요?",
    options: [
      { label: "한 페이지에 내용을 담고 싶어요" },
      { label: "여러 메뉴와 페이지가 필요해요" },
    ],
  },
  pageCount: {
    id: "pageCount",
    question: "필요한 페이지는 어느 정도로 예상하시나요?",
    options: [
      { label: "5페이지 이하" },
      { label: "6~10페이지" },
      { label: "11~20페이지" },
      { label: "21페이지 이상" },
      { label: "아직 잘 모르겠어요" },
    ],
  },
  showcase: {
    id: "showcase",
    question: "홈페이지를 통해 가장 보여주고 싶은 것은 무엇인가요?",
    options: [
      { label: "회사 또는 브랜드 소개" },
      { label: "서비스 소개" },
      { label: "제품 소개" },
      { label: "프로젝트와 사례" },
      { label: "특정 사업이나 프로젝트 홍보" },
      { label: "아직 잘 모르겠어요" },
    ],
  },
  features: {
    id: "features",
    question: "홈페이지에 필요한 기능이 있다면 모두 선택해주세요.",
    options: [
      { label: "문의·상담 신청" },
      { label: "게시판" },
      { label: "회원 기능" },
      { label: "팝업 기능" },
      { label: "기타 기능" },
      { label: "잘 모르겠어요" },
      { label: "필요 없어요" },
    ],
  },
};

// "features" 단계는 다중 선택이다. 이 두 라벨은 구체적 기능 선택과 양립할 수 없는
// 단독 선택지라 — 하나를 고르면 나머지 선택(구체적 기능 포함)이 모두 해제된다.
export const EXCLUSIVE_FEATURE_LABELS = ["잘 모르겠어요", "필요 없어요"];

const MULTI_PAGE_FORMAT_LABEL = "여러 메뉴와 페이지가 필요해요";

// format 답변이 "여러 메뉴와 페이지"일 때만 pageCount 단계를 거친다 — 한 페이지 선택 시 바로
// showcase로 건너뛴다.
export function getNextStep(current: ChatStepId, formatAnswer: string | null): ChatStepId {
  switch (current) {
    case "purpose":
      return "format";
    case "format":
      return formatAnswer === MULTI_PAGE_FORMAT_LABEL ? "pageCount" : "showcase";
    case "pageCount":
      return "showcase";
    case "showcase":
      return "features";
    case "features":
      return "result";
    case "result":
      return "done";
    case "done":
      return "done";
  }
}
