export type PricingTabKey = "build" | "care";

export interface PricingPlan {
  name: string;
  price: string;
  // 구축은 일회성, 유지보수는 월 구독이라 단위 문구를 플랜에서 들고 있는다
  priceUnit: string;
  recommended?: boolean;
  // 구축 3단계를 한 문장으로 묶는 메시지
  tagline?: string;
  // 하위 플랜을 포함하는 상위 플랜에서 "무엇 + 추가분"인지 강조하는 문구
  includes?: string;
  // 값이 없는 항목은 카드에서 생략한다
  // 배열이면 항목마다 한 줄씩 표시한다
  // emphasis는 value 안에서 굵게 강조할 부분 문자열(문자열 value에만 적용)
  features: { label: string; value: string | string[]; emphasis?: string }[];
}

export interface PricingTab {
  key: PricingTabKey;
  label: string;
  caption: string;
  plans: PricingPlan[];
}

export const PRICING_TABS: PricingTab[] = [
  {
    key: "build",
    label: "구축",
    caption: "일회성 비용입니다.",
    plans: [
      {
        name: "Basic",
        price: "80만",
        priceUnit: "원",
        tagline: "문의를 받습니다.",
        features: [
          { label: "대상", value: "홈페이지가 없는 1인 가게" },
          { label: "브랜딩", value: "로고·컬러·폰트 간이 가이드" },
          { label: "홈페이지", value: "모바일 1페이지형" },
          { label: "응대", value: "문의·예약 폼 + 하단 고정 바" },
          { label: "수정", value: "2회" },
          { label: "기간", value: "5~7일" },
        ],
      },
      {
        name: "Standard",
        price: "150만",
        priceUnit: "원",
        recommended: true,
        tagline: "문의를 놓치지 않고 정리합니다 (챗봇 + 사장님 화면).",
        features: [
          { label: "대상", value: "홈페이지 문의·예약을 놓치는 가게" },
          { label: "브랜딩", value: "로고 + 정식 브랜딩 가이드" },
          { label: "홈페이지", value: "멀티페이지 + 챗봇 연동" },
          { label: "응대", value: "챗봇 24시간 + 문의 내역 확인" },
          { label: "수정", value: "3회" },
          { label: "기간", value: "10~14일" },
        ],
      },
      {
        name: "Advanced",
        price: "300만",
        priceUnit: "원",
        tagline: "성과를 보고 키웁니다 (챗봇 + 통계 + 광고소재).",
        features: [
          { label: "대상", value: "쇼핑몰·결제·가맹 문의가 있는 업체" },
          { label: "브랜딩", value: "정식 브랜딩 가이드 + 광고소재 초기 세트" },
          { label: "홈페이지", value: "멀티페이지 + 챗봇 연동 + 관리자 화면" },
          { label: "응대", value: "챗봇 24시간 + 결제·쇼핑몰 기능" },
          { label: "성과 확인", value: "광고·유입 통계 리포트" },
          { label: "수정", value: "5회" },
          { label: "기간", value: "3~4주" },
        ],
      },
    ],
  },
  {
    key: "care",
    label: "유지보수",
    caption: "월 구독이며 구축 비용과 별도입니다.",
    plans: [
      {
        name: "Care Basic",
        price: "5만",
        priceUnit: "원 / 월",
        features: [
          { label: "포함", value: "호스팅·도메인 관리" },
          { label: "관리", value: "SSL 인증서 갱신 · 정기 백업" },
          { label: "장애 대응", value: "접수 순서대로 대응" },
          { label: "수정", value: "월 1회", emphasis: "월" },
        ],
      },
      {
        name: "Care Standard",
        price: "12만",
        priceUnit: "원 / 월",
        recommended: true,
        includes: "Care Basic 전체 포함 +",
        features: [
          {
            label: "추가 포함",
            value: ["챗봇 답변 내용 업데이트", "문의·예약 현황 월간 요약"],
          },
          { label: "점검", value: "접속 장애·오류 정기 점검" },
          { label: "장애 대응", value: "우선 대응" },
          { label: "수정", value: "월 3회", emphasis: "월" },
        ],
      },
      {
        name: "Care Plus",
        price: "20만",
        priceUnit: "원 / 월",
        includes: "Care Standard 전체 포함 +",
        features: [
          { label: "추가 포함", value: ["광고 통계 리포트", "광고소재 제작"] },
          { label: "성과 점검", value: "월간 리포트 기반 개선 제안" },
          { label: "장애 대응", value: "최우선 대응" },
          { label: "수정", value: "월 5회", emphasis: "월" },
        ],
      },
    ],
  },
];
