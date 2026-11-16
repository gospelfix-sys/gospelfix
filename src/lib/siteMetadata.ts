// 루트 레이아웃(OG·Twitter 포함)과 /layer 페이지가 같은 설명을 쓰므로 한 곳에서 관리한다
export const SITE_DESCRIPTION =
  "CI 로고, 목업, 배너, 광고소재부터 예약 챗봇이 달린 홈페이지·쇼핑몰까지. 사업에서 필요한 요소들 GOSPELFIX 함께 만들어 드립니다.";

const DEFAULT_SITE_URL = "https://xn--o39aj34ba393o94b.com";

// 빈 문자열·끝 슬래시까지 걸러서 metadataBase·sitemap URL이 깨지지 않게 한다
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(
  /\/+$/,
  "",
);
