import type { ExperienceItem } from "@/types/reelsfactory.types";
import { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

interface ExperienceTimelineItemProps {
  item: ExperienceItem;
}

const tone = TONE_CLASSES.cream;

export default function ExperienceTimelineItem({ item }: ExperienceTimelineItemProps) {
  return (
    // 항목 하나가 화면보다 길 수 있어 목록 전체가 아니라 항목마다 따로 화면 진입을 감지한다
    <RevealGroup
      as="li"
      className={cn("grid gap-3 border-t py-8 md:grid-cols-[11rem_1fr] md:gap-8", tone.rule)}
    >
      <RevealItem as="p" className={cn("text-sm tabular-nums", tone.muted)}>
        {item.period}
      </RevealItem>

      <RevealItem className="flex flex-col gap-3">
        <div>
          <h3 className="text-2xl font-medium text-inherit">{item.company}</h3>
          <p className={cn("text-sm", tone.muted)}>{item.role}</p>
        </div>
        <p className="font-medium">{item.headline}</p>
        <p className={tone.muted}>{item.situation}</p>
        <ul className={cn("list-disc space-y-1 pl-5", tone.muted)}>
          {item.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        <p>
          <span className="font-medium">결과 </span>
          <span className={tone.muted}>{item.result}</span>
        </p>
        <ul className="flex flex-wrap gap-1.5" aria-label="사용 툴">
          {item.tools.map((tool) => (
            <li key={tool} className={cn("rounded-sm px-2 py-0.5 text-xs", tone.chip)}>
              {tool}
            </li>
          ))}
        </ul>
      </RevealItem>
    </RevealGroup>
  );
}
