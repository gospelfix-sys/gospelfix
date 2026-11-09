import type {
  ContactLink,
  EducationItem,
  ExperienceItem,
  SkillGroup,
  WorkProject,
} from "@/types/reelsfactory.types";

// 이력서(2026-11-09 수정본)를 옮긴 정적 콘텐츠. 공개 페이지라 나이·주소·연봉·병역과 이력서에
// 대괄호 placeholder로 남아 있던 미확정 수치([30]종 등)는 일부러 싣지 않았다.

export const OWNER_NAME = "소윤호";

export const HERO_TAGLINE = "디자인과 구현 사이의 간극을 줄이는 웹디자이너";

export const WORK_INTRO = [
  "기획부터 UI 디자인, 퍼블리싱, 배포까지 직접 맡은 프로젝트입니다.",
  "디자인이 화면에서 끝나지 않고 사용자가 만나는 실제 결과물이 되도록 만듭니다.",
];

export const EXPERIENCE_SUMMARY = "디자인과 개발 경력 총 8년입니다.";

export const ABOUT_HEADLINE = "웹디자이너 소윤호입니다.";

export const ABOUT_PARAGRAPHS = [
  "웹디자이너로 커리어를 시작했고, 이후 프론트엔드 개발자로 일하며 디자인이 구현 단계에서 어떻게 달라지는지 직접 경험했습니다.",
  "디자이너가 구현 가능성과 데이터 구조를 이해하고 있으면 시안의 완성도와 협업 속도가 모두 높아진다고 생각합니다.",
  "컴포넌트와 타이포, 색상 같은 디자인 기준을 먼저 정리하고 시스템으로 만들어 일관성을 지킵니다. AI를 활용해 시안 제작과 API 연동 화면 구현의 반복 작업을 줄이고, 그 시간을 사용자 경험을 고민하는 데 씁니다.",
];

// API(cms.api 포트폴리오)가 비어 있거나 실패해도 3건이 항상 보이도록 하는 폴백 겸 서술의 기준.
// 이미지·링크는 mergeWorks가 API 값으로 덮어쓴다.
export const WORK_PROJECTS: WorkProject[] = [
  {
    slug: "gopoomgyeok-daepae",
    nameEn: "GOPUMGYEOK DAEPAE",
    nameKo: "고품격대패",
    category: "프랜차이즈 가맹 모집 랜딩페이지",
    duration: "5~7일",
    summary: "가맹 문의를 받을 온라인 창구를 기획부터 배포까지 5~7일 만에 만들었습니다.",
    situation: "가맹 문의를 받을 온라인 창구가 없다는 문제가 있었습니다.",
    actions: [
      "Planning · Design · Full-Stack Development 수행",
      "모바일 퍼스트 반응형으로 설계",
      "운영자가 직접 관리할 수 있는 관리자 페이지를 분리해 구축",
    ],
    tools: ["Figma", "HTML5", "CSS3", "React", "Next.js", "Illustrator"],
    thumbnail: "/reelsfactory/gopoomgyeok.avif",
    images: [],
    siteUrl: "https://xn--i89a2dz9q2p1bhpb.com/",
    archivedNote: null,
  },
  {
    slug: "yezakeumak",
    nameEn: "YEZAKEUMAK",
    nameKo: "예작음악 신문사",
    category: "클래식 음악 미디어 웹사이트",
    duration: "12주",
    summary:
      "클래식 음악 미디어 분야에 없던 반응형 홈페이지를 기획부터 개발까지 직접 만들었습니다.",
    situation:
      "클래식 음악 미디어 분야에는 반응형 기반의 홈페이지가 없었고, 콘텐츠가 쌓일수록 탐색이 어려워지는 정보구조·UI 문제가 있었습니다.",
    actions: [
      "Planning · Design · Full-Stack Development 수행",
      "클래식 음악 미디어 분야에서 찾아보기 어려웠던 반응형 기반 홈페이지를 처음으로 제작해 PC와 모바일 어디서든 기사를 읽을 수 있게 구현",
      "콘텐츠가 쌓여도 탐색하기 쉽도록 정보구조와 UX/UI를 직접 설계·디자인해 제작",
    ],
    tools: ["Figma", "HTML5", "CSS3", "React", "Next.js", "Illustrator"],
    thumbnail: "/reelsfactory/yezakeumak.avif",
    images: [],
    // 계약 만료로 운영이 끝난 사이트라 외부 링크는 숨기고 안내 문구만 보여준다
    siteUrl: null,
    archivedNote: "계약이 만료되어 더 이상 운영하지 않습니다.",
  },
  {
    slug: "deartintsanta",
    nameEn: "DEARTINTSANTA",
    nameKo: "디어틴트산타",
    category: "브랜드 스토어",
    duration: "20주",
    summary:
      "브랜드 에셋부터 쇼핑몰 UX/UI, 로딩·인터랙션까지 디자인 의도가 그대로 전달되게 만들었습니다.",
    situation: "브랜드 아이덴티티와 쇼핑몰 UX/UI를 전면 개선해야 했습니다.",
    actions: [
      "Planning · Design · Full-Stack Development 수행",
      "CI 로고, 목업, 배너, 광고소재를 직접 디자인",
      "폰트를 Pretendard로 통일하고 모노톤 중심으로 정리해 일관된 브랜드 톤 구축",
      "카페24 기반 쇼핑몰 스킨을 직접 커스텀하고 로딩 화면과 인터랙션까지 구현",
    ],
    tools: ["Figma", "HTML5", "CSS3", "React", "Next.js", "Illustrator"],
    thumbnail: "/reelsfactory/deartintsanta.avif",
    images: [],
    siteUrl: "https://deartintsanta.com",
    archivedNote: null,
  },
];

// 최신순. 이력서의 상황·행동·결과를 요약했고, 수치는 이력서에 확정값으로 적힌 것만 사용했다.
export const EXPERIENCES: ExperienceItem[] = [
  {
    company: "GospelFix",
    role: "대표 · 웹디자인·브랜딩·프론트개발",
    period: "2026. 03 ~ 현재",
    headline: "중소사업장 웹사이트와 브랜드 제작",
    situation: "중소사업장의 웹사이트와 브랜드 제작을 기획부터 배포까지 1인으로 수행합니다.",
    actions: [
      "기획, UI 디자인, 프론트개발, 배포를 직접 수행",
      "CI 로고, 배너, 상세페이지, 광고소재 등 브랜드 디자인 에셋 제작",
      "고품격대패, 예작음악 신문사, 디어틴트산타 제작",
    ],
    result: "프로젝트별 상세는 Work 섹션에 정리했습니다.",
    tools: [
      "Figma",
      "Photoshop",
      "HTML5",
      "CSS3",
      "React",
      "Next.js",
      "styled-components",
      "Claude",
      "Cafe24",
      "고도몰",
      "샵바이",
      "Illustrator",
    ],
  },
  {
    company: "비스톤스",
    role: "프론트엔드개발팀 사원",
    period: "2025. 01 ~ 2025. 10",
    headline: "삼성전자 패밀리몰 기획전·이벤트 페이지",
    situation:
      "삼성전자 AI구독클럽 제휴 혜택 페이지 리뉴얼과 상시 기획전·이벤트 운영이 필요했습니다. (발주처 PTKOREA, 기여도 50%)",
    actions: ["Figma로 기획전·이벤트 페이지 시안 설계", "HTML5, SCSS, jQuery로 직접 구현·운영"],
    result: "기획전·이벤트 제작·운영",
    tools: ["Photoshop", "HTML5", "SCSS", "JavaScript", "jQuery"],
  },
  {
    company: "펠리즈(Feliz)",
    role: "개발팀 프리랜서",
    period: "2024. 09 ~ 2024. 11",
    headline: "SKT UX 가이드라인 기반 티월드 채널 UI",
    situation: "티멤버십·티다이렉트샵·티월드 3개 채널을 통합하는 서비스 UI 작업이었습니다.",
    actions: [
      "티월드 채널을 담당해 Figma 가이드를 UI 컴포넌트로 일관되게 구현",
      "드래그 기능을 커스텀 훅으로 분리해 재사용 가능하게 구성",
    ],
    result: "계약 기간(3개월) 내 완료. Atomic 컴포넌트와 Bottom Sheet UI 제작",
    tools: ["Figma", "React", "Next.js", "TypeScript"],
  },
  {
    company: "㈜오엠티랩스",
    role: "개발팀 사원",
    period: "2023. 05 ~ 2024. 06",
    headline: "BBQ몰 및 기업·이벤트 사이트 UI 디자인·구현",
    situation:
      "BBQ 냉동식품 쇼핑몰과 어드민을 신규 구축하고(기여도 50%), 롯데맛진·스카이벤처스·나도구독왕 등 6개 사이트를 단독으로 제작했습니다.",
    actions: [
      "Figma로 UI를 설계하고 디자이너와 협업해 차트·달력 UI 커스터마이징",
      "쇼핑몰은 NHN커머스 API와 연동",
    ],
    result: "쇼핑몰과 기업·이벤트 사이트 오픈",
    tools: ["Figma", "React", "Next.js", "TypeScript", "styled-components"],
  },
  {
    company: "더스포츠커뮤니케이션",
    role: "개발팀 프리랜서",
    period: "2022. 12 ~ 2023. 03",
    headline: "전북현대모터스FC 오피셜 스토어 구축",
    situation: "구단 공식 온라인 스토어를 신규 구축했습니다. (NHN커머스 기반, 기여도 50%)",
    actions: [
      "메인·리스트·상세·장바구니·로그인·GNB/LNB 화면을 Figma 시안 기준으로 구현",
      "크로스브라우징 대응",
    ],
    result: "계약 기간 내 오픈·검수 완료, PC·모바일 대응",
    tools: ["Figma", "Vue2", "SCSS"],
  },
  {
    company: "더크림유니언",
    role: "플랫폼 콘텐츠 그룹 대리",
    period: "2019. 09 ~ 2021. 12",
    headline: "기업·쇼핑 사이트 디자인 개편 및 운영",
    situation:
      "KB자산운용, 대웅제약, 미래에셋, IFC몰 등 다수 사이트의 노후화된 UI 개선이 필요했습니다.",
    actions: [
      "UI/UX 개선점을 도출해 디자인을 개편하고 PC/모바일 반응형으로 구현",
      "IFC몰 쇼핑 정보·이벤트 페이지 제작",
    ],
    result:
      "포스코ICT 웹접근성 개선 프로젝트에서 한국웹접근성인증평가원 인증 마크 획득, 담당 사이트 6개 운영",
    tools: ["Photoshop", "HTML5", "CSS3", "JavaScript", "jQuery"],
  },
  {
    company: "아타그룹",
    role: "웹디자이너(퍼블리셔)",
    period: "2019. 03 ~ 2019. 08",
    headline: "기업·자사 웹사이트 UI 퍼블리싱 및 개선",
    situation: "운영 중인 기업·자사 사이트의 구조와 사용성 개선이 필요했습니다.",
    actions: [
      "Photoshop 시안 기반으로 반응형 UI 퍼블리싱",
      "마크업 정리, 공통 CSS 분리, 반응형 전환, 이미지 최적화로 구조 개선",
    ],
    result: "담당 사이트 1개",
    tools: ["Photoshop", "HTML5", "CSS3", "JavaScript", "jQuery"],
  },
  {
    company: "㈜스탤리온미디어",
    role: "웹디자이너",
    period: "2015. 11 ~ 2017. 08",
    headline: "OFUNLIFE 쇼핑·영상 플랫폼 상품 콘텐츠 제작 및 UI 디자인",
    situation: "상품 판매를 위한 콘텐츠 제작부터 화면 디자인까지 필요했습니다.",
    actions: [
      "제품 사진 촬영, 누끼 편집·보정, 상품 상세페이지와 기획전·이벤트 페이지 디자인",
      "메인·리스트·상세 페이지 UI 디자인과 PC/모바일 반응형 퍼블리싱",
      "기획팀과 협업해 사용자 경험 개선안 제안·적용",
    ],
    result:
      "제품 촬영부터 누끼, 상세페이지, 기획전·이벤트 페이지까지 상품 콘텐츠 제작 전 과정을 직접 담당 (1년 10개월간 상시 운영)",
    tools: ["Photoshop", "HTML5", "CSS3", "JavaScript", "jQuery"],
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  { label: "Design", items: ["Figma", "Photoshop", "Illustrator"] },
  { label: "Markup & Style", items: ["HTML5", "CSS3", "SCSS", "JavaScript", "jQuery"] },
  { label: "Frontend", items: ["React", "Next.js", "TypeScript", "Vue2"] },
  { label: "Commerce & CMS", items: ["Cafe24", "NHN커머스", "WordPress"] },
];

export const EDUCATION: EducationItem[] = [
  {
    title: "원티드 프론트엔드 코스 프리온보딩 7차",
    organization: "원티드",
    period: "2022. 10 ~ 2022. 11",
    description: "팀 프로젝트 6회를 진행하며 React, React Query, styled-components를 다뤘습니다.",
  },
  {
    title: "항해99 부트캠프 7기",
    organization: "스파르타코딩클럽",
    period: "2022. 05 ~ 2022. 08",
    description:
      "팀 프로젝트 3회, React 기반 CSR. 중복 useState를 커스텀 훅으로 분리하고 Axios interceptor로 토큰 재요청을 구현했습니다.",
  },
  {
    title: "비개발자를 위한 웹개발 종합반",
    organization: "스파르타코딩클럽",
    period: "2022. 02 ~ 2022. 03",
    description: "HTML/CSS/JS 기초부터 AWS 배포까지, 공공 API 연동 실시간 페이지를 제작했습니다.",
  },
  {
    title: "웹 퍼블리셔 및 프론트 개발 양성과정",
    organization: "KIC캠퍼스",
    period: "2019. 02 ~ 2019. 08",
    description:
      "웹 퍼블리싱 기초와 팀 프로젝트, React 클래스 문법으로 CRUD 미니 프로젝트를 진행했습니다.",
  },
  {
    title: "디지털디자인 전문가 양성 과정",
    organization: "(주)동서울아카데미",
    period: "2015. 05 ~ 2015. 09",
    description:
      "국비지원 540시간. Illustrator·Photoshop 기반 그래픽 디자인과 웹디자인(UI/GUI)을 배웠습니다.",
  },
  {
    title: "GTQ(그래픽기술자격) 포토샵 1급",
    organization: "한국생산성본부",
    period: "2015. 07",
    description: "자격증",
  },
];

export const CONTACT_EMAIL = "thdbsgh3443@kakao.com";
export const CONTACT_PHONE = "010-3388-2024";

export const CONTACT_LINKS: ContactLink[] = [
  { label: "GospelFix", href: "https://gospelfix-ashy.vercel.app/layer" },
  { label: "Profile", href: "https://gospelfiprofile.vercel.app/" },
];
