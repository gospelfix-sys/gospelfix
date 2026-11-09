import { EDUCATION } from "@/lib/reelsfactory/resumeContent";
import SectionShell, { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

const tone = TONE_CLASSES.cream;

export default function EducationSection() {
  return (
    <SectionShell id="education" tone="cream" className="gap-12">
      <SectionTitle sectionId="education" size="md">
        Education &amp; Certificates
      </SectionTitle>
      <RevealGroup as="ul" className="max-w-5xl">
        {EDUCATION.map((item) => (
          <RevealItem
            as="li"
            key={`${item.title}-${item.period}`}
            className={cn("grid gap-2 border-t py-6 md:grid-cols-[11rem_1fr] md:gap-8", tone.rule)}
          >
            <p className={cn("text-sm tabular-nums", tone.muted)}>{item.period}</p>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-medium">{item.title}</h3>
              <p className={cn("text-sm", tone.muted)}>{item.organization}</p>
              <p className={tone.muted}>{item.description}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}
