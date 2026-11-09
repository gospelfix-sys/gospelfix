export type SectionTone = "ink" | "cream";

export interface SectionMeta {
  id: string;
  /** 레일과 모바일 바에 보여줄 영문 라벨 */
  label: string;
  tone: SectionTone;
}

// 배경 톤이 교차하므로 레일 색을 활성 섹션의 tone으로 정하기 위해 톤까지 한곳에 둔다.
// 순서는 페이지 렌더 순서와 같아야 한다.
export const SECTIONS: SectionMeta[] = [
  { id: "home", label: "Home", tone: "ink" },
  { id: "work", label: "Work", tone: "cream" },
  { id: "about", label: "About", tone: "ink" },
  { id: "experience", label: "Experience", tone: "cream" },
  { id: "skills", label: "Skills", tone: "ink" },
  { id: "education", label: "Education", tone: "cream" },
  { id: "contact", label: "Contact", tone: "ink" },
];
