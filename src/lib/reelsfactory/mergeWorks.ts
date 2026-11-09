import { WORK_PROJECTS } from "@/lib/reelsfactory/resumeContent";
import type { PortfolioListItem } from "@/types/portfolio.types";
import type { WorkProject } from "@/types/reelsfactory.types";

// slug별 매칭 키워드. 여기에 없는 API 항목(예: 몽골 단기선교팀)은 취업용 페이지에서 제외된다.
const MATCH_KEYWORDS: Record<string, string[]> = {
  "gopoomgyeok-daepae": ["고품격대패", "gopoomgyeok"],
  yezakeumak: ["yezakeumak", "예작음악"],
  deartintsanta: ["deartintsanta", "디어틴트산타"],
};

// href에 쓰이는 값이라 javascript:·data: 같은 스킴은 걸러낸다
const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const stripTags = (html: string): string => html.replace(/<[^>]*>/g, " ");

const matchesProject = (item: PortfolioListItem, slug: string): boolean => {
  const haystack = [item.title, ...item.tags, stripTags(item.description)].join(" ").toLowerCase();
  return (MATCH_KEYWORDS[slug] ?? []).some((keyword) => haystack.includes(keyword.toLowerCase()));
};

/**
 * 이력서 기반 정적 3건을 뼈대로 두고, cms.api 포트폴리오가 있으면 썸네일·이미지·사이트 링크와
 * 정렬 순서만 덮어쓴다. 서술과 기간은 이력서가 기준이라 API 값으로 바꾸지 않는다.
 */
export function mergeWorks(apiItems: PortfolioListItem[]): WorkProject[] {
  const merged = WORK_PROJECTS.map((project, index) => {
    const match = apiItems.find((item) => matchesProject(item, project.slug));
    if (!match) return { project, order: 1000 + index };

    return {
      project: {
        ...project,
        thumbnail: match.thumbnail_url || project.thumbnail,
        images: match.images ?? [],
        // 운영 종료로 링크를 숨기기로 한 프로젝트는 API에 주소가 있어도 노출하지 않는다
        siteUrl: project.archivedNote
          ? null
          : isHttpUrl(match.site_url)
            ? match.site_url
            : project.siteUrl,
      },
      order: match.sort_order,
    };
  });

  return merged.sort((a, b) => a.order - b.order).map(({ project }) => project);
}
