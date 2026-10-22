import type { MockCustomer, MockReservation } from "@/types/reservationDemo.types";

export const RESERVATION_SERVICES = ["가맹 상담", "매장 방문", "본사 미팅", "창업 설명회"];

// 새로고침해도 예약 데이터가 유지되는 걸 보여주기 위한 로컬스토리지 키
export const RESERVATION_DEMO_STORAGE_KEY = "gospelfix_reservation_demo_v1";

// 챗봇이 "가맹점 문의"/"창업비용" 질문에 답할 때 참조하는 데이터 — 문구 대신 이 값만
// 바꾸면 챗봇 답변 전체(가격, 조건)가 함께 갱신된다.
export const FRANCHISE_INFO = {
  category: "한식 백반 프랜차이즈",
  storeSizePyeong: 15,
  startupCostManwon: 6500,
  franchiseFeeManwon: 500,
  trainingFeeManwon: 500,
  royaltyPercent: 2.2,
  depositNote: "계약이행보증금 없음 → 초기 부담 완화",
  adjustNote: "평수·입지에 따라 조정 가능",
  // 평균 매출/순이익 등 "어려운 질문"에 답할 때 쓰는 참고용 매장 데이터 — 실제 가맹 본사
  // 데이터가 아니라 데모용 예시치이므로 챗봇 답변에도 "참고용" 문구를 함께 붙인다.
  salesAsOf: "2025년 8월",
  storeSales: [
    { name: "수지점", sizePyeong: 8, monthlySalesManwon: 3800 },
    { name: "서현점", sizePyeong: 15, monthlySalesManwon: 6600 },
    { name: "흥덕점", sizePyeong: 13, monthlySalesManwon: 4300 },
    { name: "정자점", sizePyeong: 18, monthlySalesManwon: 9200 },
  ],
  costRatioPercent: 31,
  operatingMarginPercent: 30,
};

export const MOCK_RESERVATIONS: MockReservation[] = [
  {
    id: "r1",
    customerName: "김민지",
    channel: "chatbot",
    service: "가맹 상담",
    requestedAt: "어제 23:41 접수",
    desiredTime: "8/18 (화) 15:00",
    status: "confirmed",
  },
  {
    id: "r2",
    customerName: "박서연",
    channel: "form",
    service: "매장 방문",
    requestedAt: "오늘 09:12 접수",
    desiredTime: "8/19 (수) 11:00",
    status: "pending",
  },
  {
    id: "r3",
    customerName: "이하늘",
    channel: "chatbot",
    service: "창업 설명회",
    requestedAt: "오늘 10:30 접수",
    desiredTime: "8/20 (목) 19:00",
    status: "changed",
  },
  {
    id: "r4",
    customerName: "정우진",
    channel: "form",
    service: "본사 미팅",
    requestedAt: "오늘 13:05 접수",
    desiredTime: "8/21 (금) 14:00",
    status: "pending",
  },
  {
    id: "r5",
    customerName: "최유나",
    channel: "chatbot",
    service: "가맹 상담",
    requestedAt: "그제 22:58 접수",
    desiredTime: "8/17 (월) 16:30",
    status: "cancelled",
  },
];

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: "c1",
    name: "김민지",
    phone: "010-****-2841",
    visits: [
      { date: "2026.07.12", service: "가맹 상담", status: "confirmed" },
      { date: "2026.06.02", service: "본사 미팅", status: "confirmed" },
      { date: "2026.04.19", service: "매장 방문", status: "cancelled" },
    ],
  },
  {
    id: "c2",
    name: "박서연",
    phone: "010-****-7715",
    visits: [
      { date: "2026.08.01", service: "매장 방문", status: "confirmed" },
      { date: "2026.05.20", service: "가맹 상담", status: "confirmed" },
    ],
  },
  {
    id: "c3",
    name: "이하늘",
    phone: "010-****-3390",
    visits: [
      { date: "2026.07.30", service: "창업 설명회", status: "confirmed" },
      { date: "2026.07.02", service: "창업 설명회", status: "confirmed" },
      { date: "2026.06.05", service: "창업 설명회", status: "changed" },
    ],
  },
];
