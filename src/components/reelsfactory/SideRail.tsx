"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { FOCUS_RING, TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import { SECTIONS } from "@/components/reelsfactory/sections";
import RailIndicator from "@/components/reelsfactory/RailIndicator";

export default function SideRail() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  // 옵저버를 레일 안에 둬서 섹션 컴포넌트들이 서버 컴포넌트로 남게 한다.
  // 화면 세로 중앙선에 걸친 섹션을 활성으로 본다 (섹션 높이가 제각각이라 비율 대신 중앙선 기준)
  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element !== null,
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const active = SECTIONS.find((section) => section.id === activeId) ?? SECTIONS[0];
  const tone = TONE_CLASSES[active.tone];

  return (
    <>
      {/* 데스크톱: 좌측 고정 세로 레일. 섹션 배경이 바뀌므로 글자·라인 색을 활성 섹션 톤에 맞춘다 */}
      <nav
        aria-label="페이지 이동"
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center py-8 text-xs tracking-[0.3em] md:flex",
          tone.text,
        )}
      >
        <a href="#home" className={cn("[writing-mode:vertical-rl]", FOCUS_RING)}>
          HOME
        </a>
        <span aria-hidden="true" className={cn("mt-6 h-16 w-px", tone.line)} />
        <ul className="my-6 flex flex-col gap-3">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-label={section.label}
                aria-current={section.id === activeId ? "location" : undefined}
                className={cn("relative flex size-4 items-center justify-center", FOCUS_RING)}
              >
                <span
                  aria-hidden="true"
                  className="block size-1.5 rounded-full border border-current"
                />
                {section.id === activeId && <RailIndicator activeId={activeId} />}
              </a>
            </li>
          ))}
        </ul>
        <span aria-hidden="true" className={cn("w-px flex-1", tone.line)} />
        <span className="mt-6 [writing-mode:vertical-rl]">© 2026</span>
      </nav>

      {/* 모바일: 레일 대신 얇은 상단 고정 바 */}
      <nav
        aria-label="페이지 이동"
        className={cn(
          "fixed inset-x-0 top-0 z-40 flex h-10 items-center justify-between border-b px-6 text-xs tracking-[0.2em] md:hidden",
          tone.base,
          tone.rule,
        )}
      >
        <a href="#home" className={FOCUS_RING}>
          HOME
        </a>
        <span aria-hidden="true" className="uppercase">
          {active.label}
        </span>
        <span>© 2026</span>
      </nav>
    </>
  );
}
