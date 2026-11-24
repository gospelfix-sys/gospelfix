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
  /** 사이트 방문 버튼 아래에 덧붙이는 추가 링크 버튼 */
  extraLinks?: ContactLink[];
  /** 운영이 끝난 프로젝트의 안내 문구. 있으면 링크 대신 보여준다 */
  archivedNote: string | null;
}

/** 대표 프로젝트에 곁들이는 Figma 작업 화면 캡처 */
export interface FeaturedFigmaShot {
  /** public 기준 경로 */
  src: string;
  alt: string;
  caption: string;
  /** next/image가 레이아웃 시프트 없이 비율을 잡도록 원본 픽셀 크기를 적는다 */
  width: number;
  height: number;
}

/** 최상단 대표 프로젝트. 공고의 "대표 프로젝트 3칸" 형식을 따른다. 값이 없는 항목은 그리지 않는다 */
export interface FeaturedProject {
  /** `WorkProject.slug`. 링크·이름은 이 slug로 mergeWorks 결과에서 가져온다 */
  slug: string;
  /** 프로젝트명 옆 한 줄 (기간 / 플랫폼) */
  meta: string;
  background: string[];
  role: string[];
  result: string[];
  /** UX/UI를 고민한 Figma 작업 흔적. 없으면 그리지 않는다 */
  figmaShots?: FeaturedFigmaShot[];
  /** 대표 프로젝트에만 보여줄 추가 링크. 사이트·기획전 링크 뒤에 붙는다 */
  links?: ContactLink[];
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
