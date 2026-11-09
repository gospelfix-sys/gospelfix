import { cn } from "@/lib/utils";
import { RevealLetters } from "@/components/reelsfactory/Reveal";

interface SectionTitleProps {
  /** 소속 섹션 id. 헤딩 id는 `${sectionId}-title`로 만들어 section의 aria-labelledby와 맞춘다 */
  sectionId: string;
  children: string;
  /** 긴 제목("Skills & Tools" 등)은 md로 줄인다 */
  size?: "lg" | "md";
  className?: string;
}

// Italiana는 라틴 전용이라 영문 제목에만 쓴다. 글자 단위 reveal을 위해 문자열만 받는다.
export default function SectionTitle({
  sectionId,
  children,
  size = "lg",
  className,
}: SectionTitleProps) {
  return (
    <h2
      id={`${sectionId}-title`}
      lang="en"
      className={cn(
        "font-rf-display font-normal uppercase leading-none",
        size === "lg" ? "text-[clamp(3.5rem,13vw,9rem)]" : "text-[clamp(2.25rem,8vw,6rem)]",
        className,
      )}
    >
      {/* 헤딩의 접근 가능한 이름은 원문 그대로 두고, 글자 단위로 쪼갠 움직이는 사본은 보조기기에서 숨긴다 */}
      <span className="sr-only">{children}</span>
      <RevealLetters text={children} />
    </h2>
  );
}
