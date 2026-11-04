"use client";

import { useState } from "react";
import { Tab } from "@/components/ui/Tab";
import { cn } from "@/lib/utils";
import { PRICING_TABS, type PricingTabKey } from "@/components/main/pricingData";

export function PricingSection() {
  const [activeKey, setActiveKey] = useState<PricingTabKey>("build");
  const activeTab = PRICING_TABS.find((tab) => tab.key === activeKey) ?? PRICING_TABS[0];

  return (
    <section id="pricing" className="bg-gf-bg px-6 pt-20 pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="gf-section-label">Pricing</span>
          <h2 className="gf-section-title">구축부터 유지보수까지, 단계별로 선택하세요</h2>
          <p className="mt-2 text-sm text-gf-gray2">
            {activeTab.caption} 모든 가격은 세전(부가세 별도)입니다.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="가격 구분"
          className="mx-auto mb-8 flex w-fit justify-center border-b border-gf-border"
        >
          {PRICING_TABS.map((tab) => (
            <Tab
              key={tab.key}
              active={tab.key === activeKey}
              onClick={() => setActiveKey(tab.key)}
              className={cn(
                "px-8",
                tab.key === activeKey
                  ? "border-gf-orange text-gf-orange"
                  : "border-transparent text-gf-gray2 hover:text-gf-black",
              )}
            >
              {tab.label}
            </Tab>
          ))}
        </div>

        <div role="tabpanel" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {activeTab.plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col gap-5 rounded-2xl border bg-white p-6",
                plan.recommended
                  ? "border-gf-orange shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
                  : "border-gf-border",
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gf-black">{plan.name}</h3>
                  {plan.recommended && (
                    <span className="rounded-full bg-gf-orange-bg px-2 py-0.5 text-[11px] font-extrabold text-gf-orange">
                      추천
                    </span>
                  )}
                </div>
                <p className="flex flex-wrap items-baseline gap-x-1 text-gf-black">
                  <span
                    className={cn(
                      "text-3xl font-black tracking-tight",
                      plan.recommended && "text-gf-orange",
                    )}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-gf-gray2">{plan.priceUnit}</span>
                  <span className="ml-1 text-xs font-medium text-gf-gray2">세전 (부가세 별도)</span>
                </p>
              </div>

              {plan.tagline && <p className="text-sm font-bold text-gf-black">{plan.tagline}</p>}

              {plan.includes && (
                <p className="rounded-xl bg-gf-orange-bg px-3 py-2 text-sm font-bold text-gf-orange">
                  {plan.includes}
                </p>
              )}

              <dl className="flex flex-col gap-3 border-t border-gf-border pt-5">
                {plan.features.map((feature) => (
                  <div key={feature.label} className="flex flex-col gap-0.5">
                    <dt className="text-[11px] font-bold text-gf-gray2">{feature.label}</dt>
                    {(Array.isArray(feature.value) ? feature.value : [feature.value]).map(
                      (line) => (
                        <dd key={line} className="text-sm text-gf-black">
                          {line}
                        </dd>
                      ),
                    )}
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
