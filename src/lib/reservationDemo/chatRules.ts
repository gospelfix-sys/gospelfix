import { FRANCHISE_INFO, RESERVATION_SERVICES } from "@/lib/reservationDemo/mockData";

// "예약"/"변경" 흐름은 날짜·시간 → 이름 순서로 슬롯을 채우는 2단계 대화다. "취소" 흐름은
// 성함 하나만 받으면 끝나는 1단계 대화다. idle이 아닐 때는 새 키워드 매칭 없이 다음
// 메시지를 그 단계의 답변으로 그대로 받아들인다 — 그렇지 않으면 답변 문장에 "예약" 같은
// 트리거 단어가 섞여 있을 때 질문이 반복된다.
export type BookingStep =
  | "idle"
  | "awaiting_datetime"
  | "awaiting_name"
  | "awaiting_cancel_name"
  | "awaiting_change_datetime"
  | "awaiting_change_name";

interface ChatRule {
  keywords: string[];
  reply: string;
  // 답변 말풍선 바로 다음에 이어 붙는 두 번째 말풍선 — "AI 참고용 정보" 디스클레이머나
  // 상담신청 유도처럼, 본문과 톤이 달라 분리해서 보여줘야 하는 경우에만 채운다.
  followUp?: string;
  startsBookingFlow?: boolean;
  startsCancelFlow?: boolean;
  startsChangeFlow?: boolean;
}

// FRANCHISE_INFO(mockData.ts) 값을 그대로 문장에 꽂아 넣는다 — 숫자가 바뀌면
// 이 문자열을 고칠 필요 없이 데이터만 갱신하면 된다.
const FRANCHISE_INQUIRY_REPLY =
  `${FRANCHISE_INFO.category} 가맹 문의를 도와드릴게요!\n` +
  `창업비용, 예약 가능한 시간처럼 궁금하신 항목을 말씀해주시면 안내해드릴게요.`;

const FRANCHISE_COST_REPLY =
  "가맹점 창업비용에 대해서 안내드릴게요.\n" +
  `• ${FRANCHISE_INFO.storeSizePyeong}평 기준 약 ${FRANCHISE_INFO.startupCostManwon.toLocaleString()}만원 소요\n` +
  `• 가맹비 ${FRANCHISE_INFO.franchiseFeeManwon}만원, 교육비 ${FRANCHISE_INFO.trainingFeeManwon}만원, 로열티 ${FRANCHISE_INFO.royaltyPercent}%\n` +
  `• ${FRANCHISE_INFO.depositNote}\n` +
  `• ${FRANCHISE_INFO.adjustNote}`;

// "평균 매출/순이익/폐점 점포 수"처럼 본사만 아는 값은 갖고 있지 않다고 먼저 밝히고,
// 대신 갖고 있는 매장별 매출 예시로 답한다 — 실제 서비스라면 여기 없는 값은 지어내지
// 않는 게 핵심이라, 데모에서도 "모른다"는 문장을 답변에 반드시 포함시킨다.
const storeSalesLines = FRANCHISE_INFO.storeSales
  .map(
    (s) => `• ${s.name}(${s.sizePyeong}평): 월매출 ${s.monthlySalesManwon.toLocaleString()}만 원`,
  )
  .join("\n");

const FRANCHISE_SALES_REPLY =
  "죄송하지만, 제공된 정보에는 최근 3년간 가맹점 평균 매출, 순이익, 폐점·양도 점포 수에 대한 구체적인 데이터는 포함되어 있지 않습니다.\n\n" +
  `다만, ${FRANCHISE_INFO.salesAsOf} 기준으로 일부 매장의 매출 정보는 다음과 같습니다:\n` +
  storeSalesLines +
  "\n\n" +
  `또한, 평균 원가율은 ${FRANCHISE_INFO.costRatioPercent}%, 영업이익률은 약 ${FRANCHISE_INFO.operatingMarginPercent}%로 나타나 있습니다.\n\n` +
  "폐점·양도 점포 수에 대한 정보는 본사에 직접 문의하시는 것을 추천드립니다.";

const FRANCHISE_SALES_FOLLOWUP =
  "이 답변은 AI가 제공한 참고용 정보이며, 일부 내용은 실제와 다를 수 있습니다.\n\n" +
  `${FRANCHISE_INFO.category} 창업을 진지하게 검토 중이시라면, 꼭 본사 전문가의 정확한 상담을 받아보세요!\n\n` +
  "지금 아래 상담신청 하기를 남겨주시면 상세한 안내를 드릴게요.👍";

// CHAT_RULES는 배열 순서대로 검사해 "첫 매칭"만 쓴다(matchGeneralReply 참고) — 구체적인
// 의도(매출/창업비용/시간/취소/변경/예약)를 항상 먼저 검사하고, "가맹"처럼 여러 문장에
// 공통으로 섞이기 쉬운 넓은 키워드는 맨 뒤에 순수 폴백으로만 둔다. 이 도메인은
// RESERVATION_SERVICES의 첫 항목부터가 "가맹 상담"이라 "가맹 예약하고 싶어요"/"가맹
// 취소해주세요"/"가맹 창업비용 알려주세요"처럼 "가맹"과 구체적 의도가 함께 오는 문장이
// 자연스럽게 발생한다 — "가맹"을 앞에 두면 이런 문장이 전부 정적 안내문에서 멈춰버린다.
const CHAT_RULES: ChatRule[] = [
  // 매출/순이익 질문은 "가맹" 규칙보다 먼저 검사해야 한다 — "가맹점 평균 매출은..."처럼
  // 질문에 "가맹"이 섞여 있어도 이 전용 답변이 우선 매칭돼야 하기 때문이다.
  {
    keywords: ["매출", "순이익", "폐점", "양도", "수익성"],
    reply: FRANCHISE_SALES_REPLY,
    followUp: FRANCHISE_SALES_FOLLOWUP,
  },
  { keywords: ["창업비용", "창업"], reply: FRANCHISE_COST_REPLY },
  { keywords: ["몇시", "언제", "시간"], reply: "오늘은 14시, 16시 타임이 비어있어요." },
  {
    keywords: ["취소"],
    reply: "취소 도와드릴게요. 예약하신 성함을 알려주시겠어요?",
    startsCancelFlow: true,
  },
  {
    keywords: ["변경", "바꾸"],
    reply: "일정 변경 가능합니다. 원하시는 새 시간을 알려주세요.",
    startsChangeFlow: true,
  },
  {
    keywords: ["예약", "상담"],
    reply: "네! 원하시는 날짜와 시간을 알려주시면 예약을 도와드릴게요.",
    startsBookingFlow: true,
  },
  // 위 규칙 중 어느 구체적 의도에도 안 걸렸을 때만 매칭되는 순수 폴백.
  { keywords: ["가맹"], reply: FRANCHISE_INQUIRY_REPLY },
];

const FALLBACK_REPLY =
  "'예약', '가맹점 문의', '창업비용'처럼 말씀해주시면 더 빠르게 도와드릴 수 있어요!";

export interface GeneralReplyResult {
  reply: string;
  followUp?: string;
  startsBookingFlow: boolean;
  startsCancelFlow: boolean;
  startsChangeFlow: boolean;
}

// idle 상태에서만 쓰는 일반 키워드 매칭
export function matchGeneralReply(input: string): GeneralReplyResult {
  const normalized = input.toLowerCase();
  const rule = CHAT_RULES.find((r) => r.keywords.some((keyword) => normalized.includes(keyword)));
  if (!rule) {
    return {
      reply: FALLBACK_REPLY,
      startsBookingFlow: false,
      startsCancelFlow: false,
      startsChangeFlow: false,
    };
  }
  return {
    reply: rule.reply,
    followUp: rule.followUp,
    startsBookingFlow: Boolean(rule.startsBookingFlow),
    startsCancelFlow: Boolean(rule.startsCancelFlow),
    startsChangeFlow: Boolean(rule.startsChangeFlow),
  };
}

export const TIME_OPTIONS = ["오전 10시", "오전 11시", "오후 2시", "오후 4시", "오후 6시"];

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const DATE_OPTION_COUNT = 5;

// 선택형 날짜 칩 — 오늘은 제외하고 내일부터 며칠을 보여준다(당일 예약은 받지 않는 데모 정책).
// 라벨은 "10월 29일(목)" 형태라 isValidDesiredTime 검증도 그대로 통과한다.
export function getDateOptions(base: Date = new Date()): string[] {
  return Array.from({ length: DATE_OPTION_COUNT }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index + 1);
    return `${date.getMonth() + 1}월 ${date.getDate()}일(${WEEKDAY_LABELS[date.getDay()]})`;
  });
}

const DATE_TIME_HINT =
  /\d|오늘|내일|모레|오전|오후|아침|점심|저녁|주말|이번\s*주|다음\s*주|[월화수목금토일]요일/;

// 희망 일시는 자유 입력이라 형식을 강제하진 않되, "30dlf"처럼 영문 오타가 섞이거나
// 날짜·시간 단서가 전혀 없는 값은 걸러낸다. am/pm만 영문으로 허용한다.
export function isValidDesiredTime(input: string): boolean {
  const text = input.trim();
  if (/[a-z]/i.test(text.replace(/(?<![a-z])(am|pm)(?![a-z])/gi, ""))) return false;
  return DATE_TIME_HINT.test(text);
}

// 성함은 한글 2~10자 또는 영문 2~30자만 허용한다. 숫자·자음/모음 단독("ㅇㅇ")은 제외.
export function isValidCustomerName(input: string): boolean {
  const text = input.trim();
  return /^[가-힣]{2,10}$/.test(text) || /^[A-Za-z][A-Za-z .'-]{1,29}$/.test(text);
}

// "가맹 상담 예약해주세요"처럼 트리거 메시지에 서비스명이 이미 포함돼 있으면 미리 잡아둔다.
export function detectService(input: string): string | null {
  return RESERVATION_SERVICES.find((service) => input.includes(service)) ?? null;
}
