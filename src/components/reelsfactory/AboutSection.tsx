import { ABOUT_HEADLINE, ABOUT_PARAGRAPHS } from "@/lib/reelsfactory/resumeContent";
import SectionShell, { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

const tone = TONE_CLASSES.ink;

export default function AboutSection() {
  return (
    <SectionShell id="about" tone="ink">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionTitle sectionId="about">About</SectionTitle>
        <RevealGroup className="flex max-w-xl flex-col gap-6">
          <RevealItem as="p" className="text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-snug">
            {ABOUT_HEADLINE}
          </RevealItem>
          <div className={cn("flex flex-col gap-4 leading-relaxed", tone.muted)}>
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <RevealItem as="p" key={paragraph}>
                {paragraph}
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </SectionShell>
  );
}
