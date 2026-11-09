import { SKILL_GROUPS } from "@/lib/reelsfactory/resumeContent";
import SectionShell, { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

const tone = TONE_CLASSES.ink;

export default function SkillsSection() {
  return (
    <SectionShell id="skills" tone="ink" className="gap-12">
      <SectionTitle sectionId="skills" size="md">
        Skills &amp; Tools
      </SectionTitle>
      <RevealGroup className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_GROUPS.map((group) => (
          <RevealItem
            key={group.label}
            className={cn("flex flex-col gap-4 border-t pt-4", tone.rule)}
          >
            <h3 lang="en" className={cn("text-sm uppercase tracking-[0.2em]", tone.muted)}>
              {group.label}
            </h3>
            <ul className="flex flex-col gap-1 text-xl">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}
