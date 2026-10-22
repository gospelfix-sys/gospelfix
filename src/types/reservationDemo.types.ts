// 홈페이지 "예약 통합 AI 쇼케이스" 섹션 전용 목업 타입 — 실제 API/DB 모델이 아님.
// 채널 통합 데모용 예약 1건. 챗봇 문의와 예약 폼 접수가 이 하나의 타입으로 합쳐진다.
export type ReservationChannel = "chatbot" | "form";
export type ReservationStatus = "pending" | "confirmed" | "changed" | "cancelled";

export interface MockReservation {
  id: string;
  customerName: string;
  channel: ReservationChannel;
  service: string;
  requestedAt: string;
  desiredTime: string;
  status: ReservationStatus;
}

export interface MockCustomerVisit {
  date: string;
  service: string;
  status: ReservationStatus;
}

export interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  visits: MockCustomerVisit[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}
