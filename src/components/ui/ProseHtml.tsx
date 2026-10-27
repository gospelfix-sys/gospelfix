"use client";

import { useMemo, type MouseEvent } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

// lucide Copy / Check 아이콘. 복사됨 상태는 버튼의 data-copied 속성으로 전환한다.
const COPY_ICON = `<svg ${SVG_ATTRS} class="group-data-[copied=true]/button:hidden"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_ICON = `<svg ${SVG_ATTRS} class="hidden text-gf-orange group-data-[copied=true]/button:block"><path d="M20 6 9 17l-5-5"/></svg>`;

const COPY_BUTTON_CLASS = cn(
  buttonVariants({ variant: "outline", size: "icon-sm" }),
  "absolute right-2 top-2 bg-white text-gf-gray1 hover:bg-white",
);
const COPY_BUTTON_HTML = `<button type="button" data-copy-code class="${COPY_BUTTON_CLASS}" aria-label="코드 복사">${COPY_ICON}${CHECK_ICON}</button>`;

// 본문의 <pre> 블록마다 복사 버튼이 든 래퍼를 문자열 단계에서 씌운다. React가 소유한
// dangerouslySetInnerHTML 영역을 이펙트로 직접 고치면 React가 innerHTML을 다시 쓸 때 래퍼와 버튼이
// 통째로 사라지므로, 버튼을 HTML에 미리 넣어 두고 클릭은 컨테이너에서 위임 처리한다.
// 래퍼가 필요한 이유는 <pre>가 overflow-x: auto라 버튼을 <pre> 안에 두면 가로 스크롤 시 밀려나기 때문이다.
// sanitize가 끝난 HTML에만 적용하며, 서버/클라이언트에서 같은 결과가 나오는 순수 함수다.
function addCodeCopyButtons(html: string): string {
  return html.replace(
    /<pre\b[^>]*>[\s\S]*?<\/pre>/g,
    (pre) => `<div class="relative">${COPY_BUTTON_HTML}${pre}</div>`,
  );
}

const resetTimers = new WeakMap<HTMLButtonElement, number>();

interface ProseHtmlProps {
  html: string;
  className?: string;
}

// sanitize된 CMS 본문 HTML을 렌더링하고, 본문 안의 <pre> 블록마다 우측 상단에 복사 버튼을 붙인다.
export function ProseHtml({ html, className }: ProseHtmlProps) {
  const htmlWithButtons = useMemo(() => addCodeCopyButtons(html), [html]);

  async function handleClick(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-copy-code]");
    if (!button) return;

    const text = button.parentElement?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error("복사에 실패했습니다.");
      return;
    }

    button.dataset.copied = "true";
    button.setAttribute("aria-label", "복사됨");
    // 연속 클릭 시 먼저 걸린 타이머가 "복사됨" 표시를 일찍 풀지 않도록 취소한다.
    window.clearTimeout(resetTimers.get(button));
    resetTimers.set(
      button,
      window.setTimeout(() => {
        delete button.dataset.copied;
        button.setAttribute("aria-label", "코드 복사");
      }, 1500),
    );
  }

  return (
    <div
      className={cn("prose-gf", className)}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: htmlWithButtons }}
    />
  );
}
