import {
  Globe,
  Calendar,
  Wallet,
  Code2,
  PackageOpen,
  Users,
  ClipboardList,
  MessageCircle,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { ProductOption, PRODUCT_FORMAT_LABELS } from "@/types/product.types";
import { formatWorkPeriodDays } from "@/lib/utils";

type ProductInfoChipsMode = "free" | "paid";

interface ProductInfoChipsProps {
  purchaseOptions: ProductOption[];
  category: string;
  // "free": 무료 상품 — 결제/작업기간 등 유료 구매 전제의 칩을 숨긴다
  // "paid": 유료 상품 — 8개 칩 전부 노출
  mode: ProductInfoChipsMode;
  // true면 "AI 확장" 칩을 추가로 노출하고 스타터 킷 다운로드 링크를 함께 보여준다
  hasAiStarterKit?: boolean;
}

interface Chip {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const AI_STARTER_KIT_PATH = "/downloads/claude-starter-kit.zip";

// 유료 구매를 전제로 해서 무료 상품(mode: "free")에는 노출하지 않는 칩 라벨
const PAID_ONLY_LABELS = new Set(["작업기간", "결제수단"]);

export function ProductInfoChips({
  purchaseOptions,
  category,
  mode,
  hasAiStarterKit,
}: ProductInfoChipsProps) {
  const simpleOption = purchaseOptions.find((option) => !option.is_inquiry_only);
  const hasInquiryOption = purchaseOptions.some((option) => option.is_inquiry_only);

  const simpleWorkPeriod = formatWorkPeriodDays(simpleOption?.work_period_days);
  const workPeriodValue =
    simpleWorkPeriod != null
      ? hasInquiryOption
        ? `단순복사 ${simpleWorkPeriod} · 커스터마이징 협의`
        : simpleWorkPeriod
      : "구매 옵션 참고";

  const formatValue = PRODUCT_FORMAT_LABELS[category] ?? "AI기반 홈페이지";

  const allChips: Chip[] = [
    { icon: Globe, label: "진행방식", value: "전 과정 온라인" },
    { icon: Calendar, label: "작업기간", value: workPeriodValue },
    { icon: Wallet, label: "결제수단", value: "계좌이체" },
    { icon: Code2, label: "제공형태", value: formatValue },
    { icon: PackageOpen, label: "콘텐츠", value: "별도 준비 필요" },
    { icon: Users, label: "구매대상", value: "누구나 가능" },
    { icon: ClipboardList, label: "진행현황", value: "마이페이지에서 확인" },
    { icon: MessageCircle, label: "문의", value: "카카오 채널" },
  ];

  if (hasAiStarterKit) {
    allChips.push({
      icon: Sparkles,
      label: "AI 확장",
      value: "Claude Code 세팅 포함 · 다운로드",
      href: AI_STARTER_KIT_PATH,
    });
  }

  const chips =
    mode === "free" ? allChips.filter((chip) => !PAID_ONLY_LABELS.has(chip.label)) : allChips;

  return (
    <div className="rounded-2xl border border-gf-border bg-gf-white p-5">
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {chips.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-gf-gray2" />
            <p className="text-sm text-gf-gray1">
              <span className="font-medium text-gf-black">{label}</span> :{" "}
              {href ? (
                <a href={href} download className="text-gf-orange2 underline">
                  {value}
                </a>
              ) : (
                value
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
