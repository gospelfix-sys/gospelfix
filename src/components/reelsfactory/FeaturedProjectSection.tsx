import type { WorkProject } from "@/types/reelsfactory.types";
import { FEATURED_PROJECT } from "@/lib/reelsfactory/resumeContent";
import SectionShell, { FOCUS_RING, TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

interface FeaturedProjectSectionProps {
  /** slug로 찾은 대표 프로젝트. 이름과 링크는 mergeWorks가 채운 값을 그대로 쓴다 */
  work: WorkProject;
}

const tone = TONE_CLASSES.cream;

// 공고의 "대표 프로젝트" 3칸 이름을 그대로 쓴다
const BLOCKS = [
  { key: "background", title: "배경과 목표" },
  { key: "role", title: "본인의 역할과 판단" },
  { key: "result", title: "결과와 배운 점" },
] as const;

export default function FeaturedProjectSection({ work }: FeaturedProjectSectionProps) {
  const links = [
    ...(work.siteUrl ? [{ label: "쇼핑몰 보기", href: work.siteUrl }] : []),
    ...(work.extraLinks ?? []),
  ];

  return (
    <SectionShell id="featured" tone="cream">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionTitle sectionId="featured" size="md">
            Featured
          </SectionTitle>
          <RevealGroup className={cn("flex max-w-sm flex-col gap-1", tone.muted)}>
            <RevealItem as="p" className="text-sm uppercase tracking-[0.2em]">
              대표 프로젝트
            </RevealItem>
          </RevealGroup>
        </div>

        <RevealGroup className="flex max-w-2xl flex-col gap-10">
          <RevealItem className="flex flex-col gap-2">
            <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-snug">
              {work.nameKo}
            </p>
            <p className={cn("text-sm", tone.muted)}>{FEATURED_PROJECT.meta}</p>
          </RevealItem>

          {BLOCKS.map(({ key, title }) => {
            const items = FEATURED_PROJECT[key];
            if (items.length === 0) return null;
            return (
              <RevealItem key={key} className={cn("flex flex-col gap-3 border-t pt-4", tone.rule)}>
                <h3 className="text-xl font-medium text-inherit">{title}</h3>
                <ul className={cn("flex flex-col gap-2 leading-relaxed", tone.muted)}>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </RevealItem>
            );
          })}

          {links.length > 0 && (
            <RevealItem as="ul" className="flex flex-wrap gap-x-8 gap-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("underline underline-offset-4 hover:text-rf-ink/70", FOCUS_RING)}
                  >
                    {link.label}
                    <span className="sr-only"> (새 탭에서 열림)</span>
                  </a>
                </li>
              ))}
            </RevealItem>
          )}
        </RevealGroup>
      </div>
    </SectionShell>
  );
}
