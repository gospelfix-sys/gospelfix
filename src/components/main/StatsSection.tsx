"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    num: 12,
    cardSuffix: "+",
    kpiSuffix: "+",
    label: "완료 프로젝트",
    kpiLabel: "완료 프로젝트",
    desc: "AI Agent 자동화 · 쇼핑몰 · 웹사이트 포함",
  },
  {
    num: 10,
    cardSuffix: "+",
    kpiSuffix: "+",
    label: "함께한 고객사",
    kpiLabel: "함께한 고객사",
    desc: "국내 다양한 업종 고객사 포함",
  },
  {
    num: 98,
    cardSuffix: "%",
    kpiSuffix: "%",
    label: "고객 만족도",
    kpiLabel: "고객 만족도",
    desc: "실제 운영 클라이언트 기준",
  },
  {
    num: 24,
    cardSuffix: "시간",
    kpiSuffix: "H",
    label: "무중단 자동화",
    kpiLabel: "AI 무중단 운영",
    desc: "AI가 쉬지 않고 일합니다",
  },
];

const BARS: { label: string; value: number; widthClass: string }[] = [
  { label: "반복 업무 자동화율", value: 91, widthClass: "w-[91%]" },
  { label: "고객 응대 응답 속도 개선", value: 88, widthClass: "w-[88%]" },
  { label: "문의·전환율 향상", value: 76, widthClass: "w-[76%]" },
  { label: "운영 비용 절감", value: 65, widthClass: "w-[65%]" },
];

const ALL_TARGETS = [...STATS.map((s) => s.num), ...BARS.map((b) => b.value)];

function useCountUpGroup(targets: number[], duration: number, active: boolean) {
  const [values, setValues] = useState<number[]>(targets.map(() => 0));
  const targetsRef = useRef(targets);
  const durationRef = useRef(duration);

  useEffect(() => {
    targetsRef.current = targets;
    durationRef.current = duration;
  });

  useEffect(() => {
    if (!active) {
      setValues(targetsRef.current.map(() => 0));
      return;
    }
    let rafId: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationRef.current, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValues(targetsRef.current.map((t) => Math.round(eased * t)));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return values;
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStarted(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animated = useCountUpGroup(ALL_TARGETS, 1500, started);

  const statsEnd = STATS.length;
  const barsEnd = statsEnd + BARS.length;
  const statsNums = animated.slice(0, statsEnd);
  const barsVals = animated.slice(statsEnd, barsEnd);

  return (
    <section ref={sectionRef} className="px-6 pt-20 pb-24 bg-white border-t border-b border-gf-border">
      <div className="text-center mb-12">
        <span className="gf-section-label">Why GospelFix</span>
        <h2 className="gf-section-title">AI가 바꾸는 비즈니스, 숫자로 증명합니다</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {STATS.map((s, i) => (
          <div key={s.label} className="gf-feature-card rounded-2xl p-7 border border-gf-border">
            <div className="text-5xl sm:text-[clamp(44px,5vw,68px)] font-black text-gf-orange leading-none mb-2.5 tracking-tight">
              {statsNums[i]}
              <span className="text-2xl text-gf-black">{s.cardSuffix}</span>
            </div>
            <div className="text-gf-black font-bold text-sm mb-1.5">{s.label}</div>
            <div className="text-gf-gray2 text-xs leading-relaxed font-light">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="gf-feature-card rounded-2xl p-8 border border-gf-border">
          <div className="text-gf-black font-bold text-sm mb-7">GospelFix 도입 후 클라이언트 성과</div>
          <div className="flex flex-col gap-5">
            {BARS.map((b, i) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gf-gray2 font-normal">{b.label}</span>
                  <span className="text-gf-orange font-bold">{barsVals[i]}%</span>
                </div>
                <div className="h-1 bg-gf-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-gf-orange rounded-full transition-[width] duration-[1500ms] ease-out",
                      started ? b.widthClass : "w-0",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gf-feature-card rounded-2xl p-8 border border-gf-border">
          <div className="text-gf-black font-bold text-sm mb-7">핵심 지표</div>
          <div className="grid grid-cols-2 gap-6">
            {STATS.map((s, i) => (
              <div key={s.kpiLabel} className="text-center">
                <div className="text-4xl font-black text-gf-black leading-none mb-1.5 tracking-tight">
                  {statsNums[i]}
                  <span className="text-gf-orange">{s.kpiSuffix}</span>
                </div>
                <div className="text-gf-gray2 text-xs font-normal">{s.kpiLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
