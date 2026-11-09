import {
  CONTACT_EMAIL,
  CONTACT_LINKS,
  CONTACT_PHONE,
  OWNER_NAME,
} from "@/lib/reelsfactory/resumeContent";
import SectionShell, { FOCUS_RING, TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";

const tone = TONE_CLASSES.ink;

const BIG_LINK_CLASS =
  "break-all underline underline-offset-8 hover:text-rf-cream/70 text-[clamp(1.25rem,4.5vw,3rem)] font-light";

export default function ContactSection() {
  return (
    <SectionShell id="contact" tone="ink" className="gap-12">
      <SectionTitle sectionId="contact">Hello.</SectionTitle>

      {/* 제목 아래 묶음을 한 번에 stagger하려고 감쌌다. 바깥 gap-12와 같은 간격을 안에서도 유지한다 */}
      <RevealGroup className="flex flex-col gap-12">
        <RevealItem className="flex flex-col gap-4">
          <a href={`mailto:${CONTACT_EMAIL}`} className={cn(BIG_LINK_CLASS, FOCUS_RING)}>
            {CONTACT_EMAIL}
          </a>
          {/* 전화번호의 하이픈은 tel: 링크에서 제거해 기기 간 호환을 맞춘다 */}
          <a
            href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
            className={cn(BIG_LINK_CLASS, FOCUS_RING)}
          >
            {CONTACT_PHONE}
          </a>
        </RevealItem>

        <RevealItem as="ul" className="flex flex-wrap gap-x-8 gap-y-3">
          {CONTACT_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("underline underline-offset-4 hover:text-rf-cream/70", FOCUS_RING)}
              >
                {link.label}
                <span className="sr-only"> (새 탭에서 열림)</span>
              </a>
            </li>
          ))}
        </RevealItem>

        <RevealItem as="p" className={cn("text-xs", tone.muted)}>
          © 2026 {OWNER_NAME}
        </RevealItem>
      </RevealGroup>
    </SectionShell>
  );
}
