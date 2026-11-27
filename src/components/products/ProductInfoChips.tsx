import {
  Globe,
  Wallet,
  Code2,
  PackageOpen,
  Users,
  ClipboardList,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { PRODUCT_FORMAT_LABELS, type ProductInfoChip } from "@/types/product.types";

type ProductInfoChipsMode = "free" | "paid";

interface ProductInfoChipsProps {
  category: string;
  // "free": 무료 상품 — 결제수단 등 유료 구매 전제의 칩을 숨긴다
  // "paid": 유료 상품 — 6개 칩 전부 노출(상품마다 다른 작업기간은 구매항목 카드에서 보여준다)
  mode: ProductInfoChipsMode;
  // true면 "AI 확장" 칩을 추가로 노출하고 스타터 킷 다운로드 링크를 함께 보여준다
  hasAiStarterKit?: boolean;
  // 판매자가 등록한 칩. 비어 있으면(미등록·구버전 데이터) 기본 6칩으로 대체한다
  chips?: ProductInfoChip[] | null;
}

interface Chip {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const AI_STARTER_KIT_PATH = "/downloads/claude-starter-kit.zip";

// 유료 구매를 전제로 해서 무료 상품(mode: "free")에는 노출하지 않는 칩 라벨
const PAID_ONLY_LABELS = new Set(["결제수단"]);

// 기본 칩 라벨에 대응하는 아이콘. 판매자가 직접 만든 라벨은 Tag로 통일한다.
// 판매자 입력을 키로 조회하므로 객체 리터럴이 아니라 Map을 쓴다(constructor 같은 값이 프로토타입 함수를 집지 않게)
const LABEL_ICONS = new Map<string, LucideIcon>([
  ["진행방식", Globe],
  ["결제수단", Wallet],
  ["제공형태", Code2],
  ["콘텐츠", PackageOpen],
  ["구매대상", Users],
  ["진행현황", ClipboardList],
]);

export function ProductInfoChips({
  category,
  mode,
  hasAiStarterKit,
  chips: sellerChips,
}: ProductInfoChipsProps) {
  const formatValue = PRODUCT_FORMAT_LABELS[category] ?? PRODUCT_FORMAT_LABELS.website;

  const defaultChips: Chip[] = [
    { icon: Globe, label: "진행방식", value: "전 과정 온라인" },
    { icon: Wallet, label: "결제수단", value: "계좌이체" },
    { icon: Code2, label: "제공형태", value: formatValue },
    { icon: PackageOpen, label: "콘텐츠", value: "별도 준비 필요" },
    { icon: Users, label: "구매대상", value: "누구나 가능" },
    { icon: ClipboardList, label: "진행현황", value: "마이페이지에서 확인" },
  ];

  const allChips: Chip[] = sellerChips?.length
    ? sellerChips.map((chip) => ({
        icon: LABEL_ICONS.get(chip.label) ?? Tag,
        label: chip.label,
        value: chip.value,
      }))
    : defaultChips;

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

  // 무료 필터 뒤에 남는 칩이 없으면 빈 테두리 박스만 남으므로 렌더하지 않는다
  if (chips.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gf-border bg-gf-white p-5">
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {chips.map(({ icon: Icon, label, value, href }, index) => (
          // 아이콘을 문단 안에 인라인으로 두어, 값이 길어 줄바꿈돼도 둘째 줄이 아이콘 아래(왼쪽 끝)부터 시작하게 한다
          <p key={`${label}-${index}`} className="text-sm leading-relaxed text-gf-gray1">
            <Icon className="mr-2 inline-block size-4 -translate-y-px align-middle text-gf-gray2" />
            <span className="font-medium text-gf-black">{label}</span> :{" "}
            {href ? (
              <a href={href} download className="text-gf-orange2 underline">
                {value}
              </a>
            ) : (
              value
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
