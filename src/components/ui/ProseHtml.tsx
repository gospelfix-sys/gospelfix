"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  getText: () => string;
}

function CopyButton({ getText }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={handleCopy}
      aria-label={copied ? "복사됨" : "코드 복사"}
      className="absolute right-2 top-2 bg-white text-gf-gray1 hover:bg-white"
    >
      {copied ? <Check className="text-gf-orange" /> : <Copy />}
    </Button>
  );
}

interface ProseHtmlProps {
  html: string;
  className?: string;
}

// sanitize된 CMS 본문 HTML을 렌더링하고, 본문 안의 <pre> 블록마다 우측 상단에 복사 버튼을 붙인다.
// 본문은 dangerouslySetInnerHTML이라 React 트리에 <pre>가 없으므로, 마운트 후 DOM에서 찾아
// 래퍼(div.relative)로 감싼 뒤 portal로 버튼을 렌더링한다. 래퍼가 필요한 이유는 <pre>가
// overflow-x: auto라 버튼을 <pre> 안에 두면 가로 스크롤 시 함께 밀려나기 때문이다.
export function ProseHtml({ html, className }: ProseHtmlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<{ wrapper: HTMLElement; pre: HTMLPreElement }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const created: { wrapper: HTMLElement; pre: HTMLPreElement }[] = [];
    container.querySelectorAll("pre").forEach((pre) => {
      const wrapper = document.createElement("div");
      wrapper.className = "relative";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      created.push({ wrapper, pre });
    });
    setTargets(created);

    // 개발 StrictMode의 이펙트 재실행에도 래퍼가 중첩되지 않도록 원래 구조로 되돌린다.
    return () => {
      created.forEach(({ wrapper, pre }) => {
        wrapper.parentNode?.insertBefore(pre, wrapper);
        wrapper.remove();
      });
      setTargets([]);
    };
  }, [html]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn("prose-gf", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {targets.map(({ wrapper, pre }, index) =>
        createPortal(<CopyButton getText={() => pre.textContent ?? ""} />, wrapper, `pre-${index}`),
      )}
    </>
  );
}
