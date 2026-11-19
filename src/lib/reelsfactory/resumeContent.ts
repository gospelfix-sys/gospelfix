import type {
  ContactLink,
  EducationItem,
  ExperienceItem,
  SkillGroup,
  WorkProject,
} from "@/types/reelsfactory.types";
import resume from "@/lib/reelsfactory/data/resume.json";

// 이력서(2026-11-09 수정본)를 옮긴 정적 콘텐츠는 data/resume.json에 있다. 공개 페이지라 나이·주소·연봉·병역과
// 이력서에 대괄호 placeholder로 남아 있던 미확정 수치([30]종 등)는 일부러 싣지 않았다.
// 이 파일은 JSON을 타입에 맞춰 기존 이름으로 내보내기만 해서 import하는 쪽은 바뀌지 않는다.
// JSON에는 주석을 쓸 수 없어 아래 기준을 여기에 둔다.
// - workProjects: API(cms.api 포트폴리오)가 비어 있거나 실패해도 항상 보이도록 하는 폴백 겸 서술의 기준.
//   이미지·링크는 mergeWorks가 API 값으로 덮어쓴다.
// - experiences: 최신순. 수치는 이력서에 확정값으로 적힌 것만 사용했다.

export const OWNER_NAME: string = resume.ownerName;
export const HERO_TAGLINE: string = resume.heroTagline;
export const WORK_INTRO: string[] = resume.workIntro;
export const EXPERIENCE_SUMMARY: string = resume.experienceSummary;
export const ABOUT_HEADLINE: string = resume.aboutHeadline;
export const ABOUT_PARAGRAPHS: string[] = resume.aboutParagraphs;
export const WORK_PROJECTS: WorkProject[] = resume.workProjects;
export const EXPERIENCES: ExperienceItem[] = resume.experiences;
export const SKILL_GROUPS: SkillGroup[] = resume.skillGroups;
export const EDUCATION: EducationItem[] = resume.education;
export const CONTACT_EMAIL: string = resume.contactEmail;
export const CONTACT_PHONE: string = resume.contactPhone;
export const CONTACT_LINKS: ContactLink[] = resume.contactLinks;
