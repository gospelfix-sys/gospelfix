"use client";

import { useState } from "react";
import { motion } from "motion/react";

import type { WorkProject } from "@/types/reelsfactory.types";
import { WORK_INTRO } from "@/lib/reelsfactory/resumeContent";
import SectionShell, { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import SectionTitle from "@/components/reelsfactory/SectionTitle";
import WorkDetailDialog from "@/components/reelsfactory/WorkDetailDialog";
import WorkListItem from "@/components/reelsfactory/WorkListItem";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/reelsfactory/Reveal";
import {
  REVEAL_CONTAINER_VARIANTS,
  REVEAL_VIEWPORT,
} from "@/components/reelsfactory/revealPresets";
import type { WorkActiveSource } from "@/components/reelsfactory/WorkListItem";

interface WorkSectionProps {
  works: WorkProject[];
}

const tone = TONE_CLASSES.cream;

export default function WorkSection({ works }: WorkSectionProps) {
  // 닫힘 애니메이션 중 내용이 사라지지 않도록 선택값과 열림 여부를 분리한다
  const [selected, setSelected] = useState<WorkProject | null>(null);
  const [open, setOpen] = useState(false);
  // 마우스로 가리키거나 키보드로 포커스한 항목. 나머지 항목을 흐리게 하고 프리뷰를 띄우는 기준이다
  const [active, setActive] = useState<{ slug: string; source: WorkActiveSource } | null>(null);

  const handleSelect = (work: WorkProject) => {
    setSelected(work);
    setOpen(true);
  };

  return (
    <SectionShell id="work" tone="cream">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionTitle sectionId="work">Work</SectionTitle>
          <RevealGroup className={cn("flex max-w-sm flex-col gap-3", tone.muted)}>
            {WORK_INTRO.map((paragraph) => (
              <RevealItem as="p" key={paragraph}>
                {paragraph}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {works.length > 0 && (
          // 항목 사이 간격(gap-6)을 지날 때 흐림이 깜빡이지 않도록 해제는 목록을 벗어날 때만 한다
          <motion.ul
            variants={REVEAL_CONTAINER_VARIANTS}
            initial="hidden"
            whileInView="shown"
            viewport={REVEAL_VIEWPORT}
            onPointerLeave={() => setActive((prev) => (prev?.source === "pointer" ? null : prev))}
            className="flex flex-col gap-6 lg:justify-center"
          >
            {works.map((work) => (
              <WorkListItem
                key={work.slug}
                work={work}
                onSelect={handleSelect}
                activeSource={active?.slug === work.slug ? active.source : null}
                dimmed={active !== null && active.slug !== work.slug}
                onActiveChange={(source) => setActive(source ? { slug: work.slug, source } : null)}
              />
            ))}
          </motion.ul>
        )}
      </div>

      <WorkDetailDialog work={selected} open={open} onOpenChange={setOpen} />
    </SectionShell>
  );
}
