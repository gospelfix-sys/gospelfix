import { EXPERIENCES } from "@/lib/reelsfactory/resumeContent";
import ExperienceTimelineItem from "@/components/reelsfactory/ExperienceTimelineItem";
import SectionShell from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";

export default function ExperienceSection() {
  return (
    <SectionShell id="experience" tone="cream" className="gap-12">
      <SectionTitle sectionId="experience" size="md">
        Experience
      </SectionTitle>
      <ol className="max-w-5xl">
        {EXPERIENCES.map((item) => (
          <ExperienceTimelineItem key={`${item.company}-${item.period}`} item={item} />
        ))}
      </ol>
    </SectionShell>
  );
}
