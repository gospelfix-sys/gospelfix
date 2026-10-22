"use client";

import { useState } from "react";
import { useRecoilState } from "recoil";
import { quoteWizardAtom } from "@/store/atoms/quoteAtom";
import type { ShopIndustry, ShopStatus, ProductionScope, SelectedLineItem, LineItemId } from "@/types/quote.types";
import {
  SHOP_INDUSTRY_OPTIONS,
  SHOP_STATUS_OPTIONS,
} from "@/lib/quote/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Step02ScopeDetailProps {
  onNext: () => void;
  onBack: () => void;
}

// ────────────────────────────────────────────────────────────
// 공통 — 오렌지 체크마크 인디케이터
// ────────────────────────────────────────────────────────────
function CheckIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors",
        selected ? "bg-[#ff5500]" : "border-2 border-gray-200 bg-white",
      )}
    >
      {selected && (
        <svg width="11" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 11 9">
          <path d="M1 4.5l3 3 6-7" />
        </svg>
      )}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// 수량 조절 버튼
// ────────────────────────────────────────────────────────────
function QuantityControl({
  value,
  min,
  max,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <Button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      >
        −
      </Button>
      <span className="min-w-[4rem] text-center text-sm font-bold text-gray-900">
        {value} {unit}
      </span>
      <Button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      >
        +
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 토글 스위치 — 트랙 44px, 원 20px, 여백 2px
// ────────────────────────────────────────────────────────────
function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-gray-900" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "absolute top-[4px] h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
          on ? "left-[26px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// 쇼핑몰 제작 Step 2
// ────────────────────────────────────────────────────────────
const PRODUCTION_SCOPE_OPTIONS: {
  id: ProductionScope;
  label: string;
  description: string;
  boldTerms: string[];
}[] = [
  {
    id: "basic",
    label: "기본 제작 중심",
    description: "쇼핑몰 디자인, 반응형 최적화, 상품 세팅(최대 50개), 결제·배송 기본 셋업",
    boldTerms: ["결제·배송 기본 셋업"],
  },
  {
    id: "planning_copy",
    label: "기획·콘텐츠 포함",
    description: "카테고리 구조 기획, 상세페이지 문구, 배너·썸네일 디자인 세트",
    boldTerms: ["상세페이지 문구", "배너·썸네일 디자인 세트"],
  },
  {
    id: "premium",
    label: "프리미엄 풀패키지",
    description: "브랜드 전략, 고급 인터랙션, 마케팅 픽셀·SEO 셋업, 런칭 지원",
    boldTerms: ["마케팅 픽셀·SEO 셋업", "런칭 지원"],
  },
];

function HighlightedDescription({
  description,
  boldTerms,
}: {
  description: string;
  boldTerms: string[];
}) {
  let parts: (string | JSX.Element)[] = [description];
  boldTerms.forEach((term) => {
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return [part];
      const segments = part.split(term);
      return segments.flatMap((seg, i) =>
        i < segments.length - 1 ? [seg, <strong key={`${term}-${i}`}>{term}</strong>] : [seg],
      );
    });
  });
  return <>{parts}</>;
}

function ShoppingMallStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [state, setState] = useRecoilState(quoteWizardAtom);
  const [addonsOpen, setAddonsOpen] = useState(true);

  const canNext =
    state.shopIndustry !== null &&
    state.shopStatus !== null &&
    state.productionScope !== null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">
          STEP 02 / 05
        </p>
        <h2 className="text-2xl font-bold text-gray-900">쇼핑몰 기본 정보</h2>
        <p className="mt-2 text-sm text-gray-500">정확한 견적을 위해 몇 가지 알려주세요.</p>
      </div>

      {/* 01 — 업종 */}
      <section>
        <p className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            01
          </span>
          어떤 상품을 판매하시나요?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SHOP_INDUSTRY_OPTIONS.map((opt) => {
            const selected = state.shopIndustry === opt.id;
            return (
              <Button
                key={opt.id}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, shopIndustry: opt.id as ShopIndustry }))}
                className={cn(
                  "h-auto flex flex-col gap-2 rounded-xl border px-2 py-4 text-center whitespace-normal",
                  selected
                    ? "border-[#ff5500] bg-[#fff5f0]"
                    : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className={cn("text-xs font-semibold", selected ? "text-[#ff5500]" : "text-gray-700")}>
                  {opt.label}
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* 02 — 현재 상황 */}
      <section>
        <p className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            02
          </span>
          현재 상황을 알려주세요.
        </p>
        <div className="flex flex-col gap-2">
          {SHOP_STATUS_OPTIONS.map((opt) => {
            const selected = state.shopStatus === opt.id;
            return (
              <Button
                key={opt.id}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, shopStatus: opt.id as ShopStatus }))}
                className={cn(
                  "h-auto w-full justify-between rounded-xl border p-4 text-left whitespace-normal",
                  selected ? "border-[#ff5500] bg-white" : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                </div>
                <CheckIndicator selected={selected} />
              </Button>
            );
          })}
        </div>
      </section>

      {/* 03 — 제작 범위 */}
      <section>
        <p className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            03
          </span>
          원하는 제작 범위를 선택해주세요.
        </p>
        <div className="flex flex-col gap-3">
          {PRODUCTION_SCOPE_OPTIONS.map((opt) => {
            const selected = state.productionScope === opt.id;
            return (
              <Button
                key={opt.id}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, productionScope: opt.id as ProductionScope }))}
                className={cn(
                  "h-auto w-full justify-between rounded-xl border p-4 text-left whitespace-normal",
                  selected ? "border-[#ff5500] bg-white" : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <HighlightedDescription description={opt.description} boldTerms={opt.boldTerms} />
                  </p>
                </div>
                <CheckIndicator selected={selected} />
              </Button>
            );
          })}
        </div>
      </section>

      {/* 추가 항목 */}
      <section>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setAddonsOpen((v) => !v)}
          className="h-auto w-full justify-start gap-2 p-0 text-base font-bold text-gray-900 hover:bg-transparent hover:text-gray-900"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm text-white">
            +
          </span>
          추가로 필요한 항목이 있나요?
        </Button>
        {addonsOpen && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">시스템 개발이 필요해요</p>
                  <p className="mt-0.5 text-xs text-gray-500">예약·결제·회원·관리자·외부 연동 등</p>
                  <p className="mt-1 text-xs font-semibold text-[#ff5500]">별도 문의</p>
                </div>
              </div>
              <ToggleSwitch
                on={state.needsSystemDev}
                onToggle={() => setState((prev) => ({ ...prev, needsSystemDev: !prev.needsSystemDev }))}
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="h-auto rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="h-auto flex-1 rounded-xl bg-[#ff5500] py-4 text-sm font-bold text-white hover:bg-[#e04d00] disabled:opacity-40"
        >
          다음 →
        </Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 홈페이지 / 랜딩 Step 2
// ────────────────────────────────────────────────────────────
const PAGE_ITEM_IDS: LineItemId[] = [
  "homepage_page_1",
  "homepage_page_2_3",
  "homepage_page_4_7",
  "homepage_page_8plus",
];

const LANG_ITEM_IDS: LineItemId[] = ["homepage_lang_1", "homepage_lang_2", "homepage_lang_3"];

const HOMEPAGE_PAGE_OPTIONS: { id: LineItemId; label: string; description: string }[] = [
  { id: "homepage_page_1", label: "원페이지·랜딩페이지", description: "단일 페이지 구성 · 섹션별 스크롤 레이아웃" },
  { id: "homepage_page_2_3", label: "2~3페이지", description: "소개·제품·연락처 등 2–3개 페이지 구성" },
  { id: "homepage_page_4_7", label: "4~7페이지", description: "중간 규모 기업·브랜드 홈페이지" },
  { id: "homepage_page_8plus", label: "8페이지 이상", description: "대형 브랜드·풀스케일 홈페이지" },
];

const HOMEPAGE_SCOPE_OPTIONS: {
  id: ProductionScope;
  label: string;
  description: string;
}[] = [
  {
    id: "basic",
    label: "기본 제작 중심",
    description: "전용 디자인, 반응형 제작, 문의 폼, 기본 SEO",
  },
  {
    id: "planning_copy",
    label: "기획·카피라이팅 포함",
    description: "기본 제작 중심 + 웹 기획, 문구 정리, 게시판 연동",
  },
];

const HOMEPAGE_LANG_OPTIONS: { id: LineItemId | null; label: string; description: string }[] = [
  { id: null, label: "필요 없음", description: "국문 홈페이지로 제작 · 추가 비용 없음" },
  { id: "homepage_lang_1", label: "1개 언어 추가", description: "영문 등 추가 언어 1개 제작" },
  { id: "homepage_lang_2", label: "2개 언어 추가", description: "추가 언어 2개 제작" },
  { id: "homepage_lang_3", label: "3개 언어 추가", description: "추가 언어 3개 제작" },
];

function HomepageStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [state, setState] = useRecoilState(quoteWizardAtom);

  function getSelectedPageId(): LineItemId | null {
    return state.selectedItems.find((i) => PAGE_ITEM_IDS.includes(i.id))?.id ?? null;
  }

  function getSelectedLangId(): LineItemId | null {
    return state.selectedItems.find((i) => LANG_ITEM_IDS.includes(i.id))?.id ?? null;
  }

  function selectPage(id: LineItemId) {
    setState((prev) => {
      const withoutPage = prev.selectedItems.filter((i) => !PAGE_ITEM_IDS.includes(i.id));
      return { ...prev, selectedItems: [...withoutPage, { id, quantity: 1, withCopywriting: false }] };
    });
  }

  function selectLang(id: LineItemId | null) {
    setState((prev) => {
      const withoutLang = prev.selectedItems.filter((i) => !LANG_ITEM_IDS.includes(i.id));
      if (!id) return { ...prev, selectedItems: withoutLang };
      return { ...prev, selectedItems: [...withoutLang, { id, quantity: 1, withCopywriting: false }] };
    });
  }

  function selectScope(id: ProductionScope) {
    setState((prev) => ({ ...prev, productionScope: id }));
  }

  const selectedPageId = getSelectedPageId();
  const selectedLangId = getSelectedLangId();
  const canNext = selectedPageId !== null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">STEP 02 / 05</p>
        <h2 className="text-2xl font-bold text-gray-900">홈페이지 기본 정보</h2>
        <p className="mt-2 text-sm text-gray-500">정확한 견적을 위해 몇 가지 알려주세요.</p>
      </div>

      {/* 01 — 페이지 수 */}
      <section>
        <p className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            01
          </span>
          페이지 수를 선택해주세요. <span className="text-[#ff5500]">*</span>
        </p>
        <div className="flex flex-col gap-2">
          {HOMEPAGE_PAGE_OPTIONS.map((opt) => {
            const selected = selectedPageId === opt.id;
            return (
              <Button
                key={opt.id}
                type="button"
                onClick={() => selectPage(opt.id)}
                className={cn(
                  "h-auto w-full justify-between rounded-xl border p-4 text-left whitespace-normal",
                  selected ? "border-[#ff5500] bg-white" : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                </div>
                <CheckIndicator selected={selected} />
              </Button>
            );
          })}
        </div>
      </section>

      {/* 02 — 제작 범위 */}
      <section>
        <p className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            02
          </span>
          원하는 제작 범위를 선택해주세요. <span className="text-[#ff5500]">*</span>
        </p>
        <div className="flex flex-col gap-2">
          {HOMEPAGE_SCOPE_OPTIONS.map((opt) => {
            const selected = (state.productionScope ?? "basic") === opt.id;
            return (
              <Button
                key={opt.id}
                type="button"
                onClick={() => selectScope(opt.id)}
                className={cn(
                  "h-auto w-full justify-between rounded-xl border p-4 text-left whitespace-normal",
                  selected ? "border-[#ff5500] bg-white" : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                </div>
                <CheckIndicator selected={selected} />
              </Button>
            );
          })}
        </div>
      </section>

      {/* 03 — 다국어 */}
      <section>
        <p className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            03
          </span>
          다국어 페이지가 필요하신가요?{" "}
          <span className="text-sm font-normal text-gray-400">(선택)</span>
        </p>
        <div className="flex flex-col gap-2">
          {HOMEPAGE_LANG_OPTIONS.map((opt) => {
            const selected = opt.id === null ? selectedLangId === null : selectedLangId === opt.id;
            return (
              <Button
                key={opt.id ?? "none"}
                type="button"
                onClick={() => selectLang(opt.id)}
                className={cn(
                  "h-auto w-full justify-between rounded-xl border p-4 text-left whitespace-normal",
                  selected ? "border-[#ff5500] bg-white" : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                </div>
                <CheckIndicator selected={selected} />
              </Button>
            );
          })}
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="h-auto rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="h-auto flex-1 rounded-xl bg-[#ff5500] py-4 text-sm font-bold text-white hover:bg-[#e04d00] disabled:opacity-40"
        >
          다음 →
        </Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// AI 자동화 / MVP 개발 Step 2
// ────────────────────────────────────────────────────────────
const AI_ITEMS: { id: LineItemId; label: string; description: string }[] = [
  { id: "ai_pipeline", label: "자동화 파이프라인 구축", description: "Make · n8n · Zapier 기반 업무 자동화 플로우 설계 및 구현" },
  { id: "ai_mvp_basic", label: "AI MVP 개발 (기본)", description: "LLM 연동 챗봇·에이전트 MVP 개발 (API 연동 포함)" },
];

function AiMvpStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [state, setState] = useRecoilState(quoteWizardAtom);

  function hasItem(id: LineItemId) {
    return state.selectedItems.some((i) => i.id === id);
  }

  function toggleItem(id: LineItemId) {
    setState((prev) => {
      const exists = prev.selectedItems.some((i) => i.id === id);
      if (exists) return { ...prev, selectedItems: prev.selectedItems.filter((i) => i.id !== id) };
      return { ...prev, selectedItems: [...prev.selectedItems, { id, quantity: 1, withCopywriting: false }] };
    });
  }

  const canNext = state.selectedItems.some((i) =>
    (["ai_pipeline", "ai_mvp_basic"] as LineItemId[]).includes(i.id),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">STEP 02 / 05</p>
        <h2 className="text-2xl font-bold text-gray-900">어떤 AI 서비스가 필요하세요?</h2>
        <p className="mt-2 text-sm text-gray-500">중복 선택 가능해요.</p>
      </div>

      <section>
        <div className="flex flex-col gap-3">
          {AI_ITEMS.map((opt) => {
            const selected = hasItem(opt.id);
            return (
              <Button
                key={opt.id}
                type="button"
                onClick={() => toggleItem(opt.id)}
                className={cn(
                  "h-auto w-full justify-between rounded-xl border p-4 text-left whitespace-normal",
                  selected ? "border-[#ff5500] bg-white" : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                </div>
                <CheckIndicator selected={selected} />
              </Button>
            );
          })}
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="h-auto rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="h-auto flex-1 rounded-xl bg-[#ff5500] py-4 text-sm font-bold text-white hover:bg-[#e04d00] disabled:opacity-40"
        >
          다음 →
        </Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 유지보수 구독 Step 2
// ────────────────────────────────────────────────────────────
const CLAUDE_TIER_IDS: LineItemId[] = ["maintenance_ai_claude_pro", "maintenance_ai_claude_max"];
const CODEX_TIER_IDS: LineItemId[] = [
  "maintenance_ai_codex_go",
  "maintenance_ai_codex_plus",
  "maintenance_ai_codex_pro",
];

const CLAUDE_TIERS: { id: LineItemId; label: string; price: string; description: string }[] = [
  {
    id: "maintenance_ai_claude_pro",
    label: "Pro",
    price: "28,000원/월",
    description: "우선 접근 · 확장 사용량",
  },
  {
    id: "maintenance_ai_claude_max",
    label: "Max",
    price: "160,000원/월",
    description: "Claude Code 에이전트 · 최대 사용량",
  },
];

const CODEX_TIERS: { id: LineItemId; label: string; price: string; description: string; disabled?: boolean }[] = [
  {
    id: "maintenance_ai_codex_go",
    label: "Go",
    price: "12,000원/월",
    description: "입문 플랜 · 기본 에이전트 사용",
    disabled: true,
  },
  {
    id: "maintenance_ai_codex_plus",
    label: "Plus",
    price: "30,000원/월",
    description: "확장 사용량 · AI 코딩 에이전트",
  },
  {
    id: "maintenance_ai_codex_pro",
    label: "Pro",
    price: "150,000원/월",
    description: "최대 사용량 · 우선 처리",
  },
];

function MaintenanceStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [state, setState] = useRecoilState(quoteWizardAtom);

  function getItem(id: LineItemId): SelectedLineItem | undefined {
    return state.selectedItems.find((i) => i.id === id);
  }

  function setQuantity(id: LineItemId, qty: number) {
    setState((prev) => {
      const filtered = prev.selectedItems.filter((i) => i.id !== id);
      if (qty <= 0) return { ...prev, selectedItems: filtered };
      const exists = prev.selectedItems.find((i) => i.id === id);
      if (exists) return { ...prev, selectedItems: [...filtered, { ...exists, quantity: qty }] };
      return { ...prev, selectedItems: [...filtered, { id, quantity: qty, withCopywriting: false }] };
    });
  }

  function toggleItem(id: LineItemId, defaultQty: number) {
    setState((prev) => {
      const exists = prev.selectedItems.some((i) => i.id === id);
      if (exists) return { ...prev, selectedItems: prev.selectedItems.filter((i) => i.id !== id) };
      return { ...prev, selectedItems: [...prev.selectedItems, { id, quantity: defaultQty, withCopywriting: false }] };
    });
  }

  function toggleMonthly() {
    setState((prev) => {
      const exists = prev.selectedItems.some((i) => i.id === "maintenance_monthly");
      if (exists) {
        const allAiIds = [...CLAUDE_TIER_IDS, ...CODEX_TIER_IDS];
        return {
          ...prev,
          selectedItems: prev.selectedItems.filter(
            (i) => i.id !== "maintenance_monthly" && !allAiIds.includes(i.id),
          ),
        };
      }
      return {
        ...prev,
        selectedItems: [
          ...prev.selectedItems,
          { id: "maintenance_monthly", quantity: 3, withCopywriting: false },
        ],
      };
    });
  }

  // 같은 그룹 내에서 하나만 선택 (mutual exclusion)
  function selectTier(id: LineItemId, groupIds: LineItemId[]) {
    setState((prev) => {
      const alreadySelected = prev.selectedItems.some((i) => i.id === id);
      const withoutGroup = prev.selectedItems.filter((i) => !groupIds.includes(i.id));
      if (alreadySelected) return { ...prev, selectedItems: withoutGroup };
      return { ...prev, selectedItems: [...withoutGroup, { id, quantity: 1, withCopywriting: false }] };
    });
  }

  const monthlyItem = getItem("maintenance_monthly");
  const featureItem = getItem("maintenance_feature");
  const selectedClaudeTier = CLAUDE_TIER_IDS.find((id) => getItem(id));
  const selectedCodexTier = CODEX_TIER_IDS.find((id) => getItem(id));
  const claudeItem = selectedClaudeTier ? getItem(selectedClaudeTier) : undefined;
  const codexItem = selectedCodexTier ? getItem(selectedCodexTier) : undefined;

  const canNext = !!featureItem || (!!monthlyItem && (!!claudeItem || !!codexItem));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">STEP 02 / 05</p>
        <h2 className="text-2xl font-bold text-gray-900">유지보수 범위를 선택해주세요</h2>
        <p className="mt-2 text-sm text-gray-500">필요한 항목을 선택하고 수량을 조정해주세요.</p>
      </div>

      {/* 월 정기 유지보수 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">월 정기 유지보수</p>
            <p className="mt-0.5 text-xs text-gray-500">
              월 정기 운영 관리 · 오류 수정 · 콘텐츠 업데이트
            </p>
            <p className="mt-1 text-xs font-semibold text-[#ff5500]">330,000원/월</p>
          </div>
          <ToggleSwitch
            on={!!monthlyItem}
            onToggle={toggleMonthly}
          />
        </div>
        {monthlyItem && (
          <QuantityControl
            value={monthlyItem.quantity}
            min={1}
            max={24}
            unit="개월"
            onChange={(v) => setQuantity("maintenance_monthly", v)}
          />
        )}
      </section>

      {/* 기능 추가 개발 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">기능 추가 개발</p>
            <p className="mt-0.5 text-xs text-gray-500">신규 기능 단위 개발</p>
            <p className="mt-1 text-xs font-semibold text-[#ff5500]">550,000원/건</p>
          </div>
          <ToggleSwitch
            on={!!featureItem}
            onToggle={() => toggleItem("maintenance_feature", 1)}
          />
        </div>
        {featureItem && (
          <QuantityControl
            value={featureItem.quantity}
            min={1}
            max={20}
            unit="건"
            onChange={(v) => setQuantity("maintenance_feature", v)}
          />
        )}
      </section>

      {/* AI 요금제 — 월 정기 유지보수 선택 시 노출 */}
      {!!monthlyItem && (
        <>
          {/* 구분선 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI 요금제</p>
                <span className="rounded-full bg-[#ff5500] px-2 py-0.5 text-[10px] font-bold text-white">
                  필수
                </span>
              </div>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <p className="text-center text-xs text-gray-400">
              Claude 또는 ChatGPT Codex 중 하나를 반드시 선택해주세요.
            </p>
          </div>

          {/* 계정 공유 안내 */}
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-sm">⚠️</span>
            <p className="text-xs leading-relaxed text-amber-800">
              AI 요금제를 선택하시면 유지보수 기간 동안{" "}
              <strong className="font-bold">GOSPEL FIX</strong>에게 해당 AI 서비스 계정을
              공유해주셔야 합니다.
            </p>
          </div>

          {/* Claude 요금제 */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base">🤖</span>
              <p className="text-sm font-bold text-gray-900">Claude 요금제 (Anthropic)</p>
            </div>
            <div className="flex flex-col gap-2">
              {CLAUDE_TIERS.map((tier) => {
                const selected = selectedClaudeTier === tier.id;
                return (
                  <Button
                    key={tier.id}
                    type="button"
                    onClick={() => selectTier(tier.id, CLAUDE_TIER_IDS)}
                    className={cn(
                      "flex h-auto w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-[#ff5500] bg-[#fff5f0]"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300",
                    )}
                  >
                    <div>
                      <p className={cn("text-sm font-bold", selected ? "text-[#ff5500]" : "text-gray-900")}>
                        {tier.label}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{tier.description}</p>
                    </div>
                    <p className={cn("shrink-0 text-xs font-semibold", selected ? "text-[#ff5500]" : "text-gray-500")}>
                      {tier.price}
                    </p>
                  </Button>
                );
              })}
            </div>
            {claudeItem && (
              <QuantityControl
                value={claudeItem.quantity}
                min={1}
                max={24}
                unit="개월"
                onChange={(v) => selectedClaudeTier && setQuantity(selectedClaudeTier, v)}
              />
            )}
          </section>

          {/* ChatGPT Codex 요금제 */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base">⚡</span>
              <p className="text-sm font-bold text-gray-900">ChatGPT Codex 요금제 (OpenAI)</p>
            </div>
            <div className="flex flex-col gap-2">
              {CODEX_TIERS.map((tier) => {
                const selected = selectedCodexTier === tier.id;
                return (
                  <Button
                    key={tier.id}
                    type="button"
                    disabled={tier.disabled}
                    onClick={() => !tier.disabled && selectTier(tier.id, CODEX_TIER_IDS)}
                    className={cn(
                      "flex h-auto w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                      tier.disabled
                        ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-40"
                        : selected
                          ? "border-[#ff5500] bg-[#fff5f0]"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300",
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-bold", selected && !tier.disabled ? "text-[#ff5500]" : "text-gray-900")}>
                          {tier.label}
                        </p>
                        {tier.disabled && (
                          <span className="text-[10px] font-semibold text-red-400">실무 적용 불가</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{tier.description}</p>
                    </div>
                    <p className={cn("shrink-0 text-xs font-semibold", selected && !tier.disabled ? "text-[#ff5500]" : "text-gray-500")}>
                      {tier.price}
                    </p>
                  </Button>
                );
              })}
            </div>
            {codexItem && (
              <QuantityControl
                value={codexItem.quantity}
                min={1}
                max={24}
                unit="개월"
                onChange={(v) => selectedCodexTier && setQuantity(selectedCodexTier, v)}
              />
            )}
          </section>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="h-auto rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="h-auto flex-1 rounded-xl bg-[#ff5500] py-4 text-sm font-bold text-white hover:bg-[#e04d00] disabled:opacity-40"
        >
          다음 →
        </Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 메인 라우터
// ────────────────────────────────────────────────────────────
export function Step02ScopeDetail({ onNext, onBack }: Step02ScopeDetailProps) {
  const [state] = useRecoilState(quoteWizardAtom);
  const category = state.selectedCategories[0];

  if (category === "shopping_mall") {
    return <ShoppingMallStep onNext={onNext} onBack={onBack} />;
  }
  if (category === "homepage") {
    return <HomepageStep onNext={onNext} onBack={onBack} />;
  }
  if (category === "ai_mvp") {
    return <AiMvpStep onNext={onNext} onBack={onBack} />;
  }
  if (category === "maintenance") {
    return <MaintenanceStep onNext={onNext} onBack={onBack} />;
  }

  // fallback — 카테고리 미선택 시
  return null;
}
