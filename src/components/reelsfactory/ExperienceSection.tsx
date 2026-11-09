import { EXPERIENCES, EXPERIENCE_SUMMARY } from "@/lib/reelsfactory/resumeContent";
import ExperienceTimelineItem from "@/components/reelsfactory/ExperienceTimelineItem";
import SectionShell, { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import { cn } from "@/lib/utils";

const tone = TONE_CLASSES.cream;

export default function ExperienceSection() {
  return (
    <SectionShell id="experience" tone="cream" className="gap-12">
      <SectionTitle sectionId="experience" size="md">
        Experience
      </SectionTitle>
      <p className={cn("-mt-6 text-lg", tone.muted)}>{EXPERIENCE_SUMMARY}</p>
      <ol className="max-w-5xl">
        {EXPERIENCES.map((item) => (
          <ExperienceTimelineItem key={`${item.company}-${item.period}`} item={item} />
        ))}
      </ol>
    </SectionShell>
  );
}
