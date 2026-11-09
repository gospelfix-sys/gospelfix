/** Work 섹션에 노출하는 프로젝트. 서술은 이력서, 이미지·링크는 cms.api 포트폴리오가 채운다. */
export interface WorkProject {
  slug: string;
  /** 거대 타이틀로 쓰는 영문 대문자 표기 */
  nameEn: string;
  nameKo: string;
  /** `– CATEGORY` 캡션 */
  category: string;
  /** 기간 표기 (예: "5~7일", "12주") */
  duration: string;
  summary: string;
  situation: string;
  actions: string[];
  tools: string[];
  thumbnail: string;
  images: string[];
  /** null이면 링크 버튼을 그리지 않는다 */
  siteUrl: string | null;
  /** 운영이 끝난 프로젝트의 안내 문구. 있으면 링크 대신 보여준다 */
  archivedNote: string | null;
}

export interface ExperienceItem {
  company: string;
  role: string;
  /** "2025. 01 ~ 2025. 10" 형태 */
  period: string;
  headline: string;
  situation: string;
  actions: string[];
  result: string;
  tools: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface EducationItem {
  title: string;
  organization: string;
  period: string;
  description: string;
}

export interface ContactLink {
  label: string;
  href: string;
}
