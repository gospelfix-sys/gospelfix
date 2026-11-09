import { HERO_TAGLINE, OWNER_NAME } from "@/lib/reelsfactory/resumeContent";
import SectionShell, { FOCUS_RING, TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

interface HeroLink {
  label: string;
  href: string;
}

const HERO_LINKS: HeroLink[] = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const tone = TONE_CLASSES.ink;

export default function HeroSection() {
  return (
    <SectionShell id="home" tone="ink" className="gap-12">
      <RevealGroup as="header" className="flex flex-col gap-3">
        <RevealItem
          as="h1"
          id="home-title"
          className="text-[clamp(1.5rem,4vw,2.5rem)] font-light tracking-wide text-inherit"
        >
          {OWNER_NAME}
        </RevealItem>
        <RevealItem as="p" className={cn("max-w-xl text-base", tone.muted)}>
          {HERO_TAGLINE}
        </RevealItem>
      </RevealGroup>

      <nav aria-label="주요 섹션">
        {/* 이름·소개(2개 x 0.07초)가 먼저 자리 잡은 뒤 내비가 이어서 올라오게 시작을 늦춘다 */}
        <RevealGroup as="ul" delay={0.2} className="flex flex-col">
          {HERO_LINKS.map((link) => (
            <RevealItem as="li" key={link.href}>
              <a
                href={link.href}
                lang="en"
                className={cn(
                  "block font-rf-display text-[clamp(3.5rem,16vw,12rem)] uppercase leading-[0.95] hover:text-rf-cream/70",
                  FOCUS_RING,
                )}
              >
                {link.label}
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </nav>
    </SectionShell>
  );
}
