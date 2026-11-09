import { cn } from "@/lib/utils";

interface ToolGroupsProps {
  tools: string[];
  /** 칩 하나에 얹는 테두리·글자색 클래스 */
  chipClassName: string;
  /** 그룹 라벨(LLM(AI)/디자인툴/개발툴/커머스 플랫폼)에 얹는 글자색 클래스 */
  labelClassName: string;
}

// 데이터는 툴 이름 한 배열로 두고, 화면에서만 LLM·디자인툴·개발툴·커머스 플랫폼 4개 그룹으로 가른다.
const DESIGN_TOOLS = new Set(["Figma", "Photoshop", "Illustrator"]);
const LLM_TOOLS = new Set(["Claude"]);
const SHOP_TOOLS = new Set(["Cafe24", "고도몰", "샵바이"]);

export default function ToolGroups({ tools, chipClassName, labelClassName }: ToolGroupsProps) {
  // 개발툴은 다른 그룹에 등록되지 않은 나머지라, 새 개발 툴은 데이터에만 추가하면 된다
  const groups = [
    { label: "LLM(AI)", items: tools.filter((tool) => LLM_TOOLS.has(tool)) },
    { label: "디자인툴", items: tools.filter((tool) => DESIGN_TOOLS.has(tool)) },
    {
      label: "개발툴",
      items: tools.filter(
        (tool) => !DESIGN_TOOLS.has(tool) && !LLM_TOOLS.has(tool) && !SHOP_TOOLS.has(tool),
      ),
    },
    { label: "커머스 플랫폼", items: tools.filter((tool) => SHOP_TOOLS.has(tool)) },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className={cn("w-24 shrink-0 text-xs", labelClassName)}>{group.label}</span>
          <ul className="flex flex-wrap gap-1.5" aria-label={group.label}>
            {group.items.map((tool) => (
              <li key={tool} className={cn("rounded-sm px-2 py-0.5 text-xs", chipClassName)}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
