"use client";

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Check, Copy, Lock } from "lucide-react";
import { toast } from "sonner";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import { Button } from "@/components/ui/button";
import { Tab } from "@/components/ui/Tab";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product.types";
import { isAuthenticatedSelector } from "@/store/selectors/authSelector";
import { useAuth } from "@/hooks/useAuth";

// oneDark 테마의 pre 태그 기본값(margin/borderRadius)을 제거한 커스텀 테마.
// react-syntax-highlighter는 style 프롭의 'pre[class*="language-"]' 항목을 그대로
// <pre>의 inline style로 적용하는데, inline style은 className(m-0/rounded-none)보다
// 항상 우선하므로 className만으로는 지울 수 없어 테마 객체 자체를 수정한다.
const codeTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    margin: 0,
    borderRadius: 0,
  },
};

SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);

// 탭 라벨(파일명)의 확장자로 Prism 언어를 추론. 관리자가 자유 입력하는 라벨이라
// 확장자가 없거나 낯선 경우도 있어, 그럴 땐 markup(일반 텍스트에 가장 무난)으로 폴백한다.
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  html: "markup",
  htm: "markup",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  md: "markdown",
  markdown: "markdown",
};

function getLanguageFromLabel(label: string): string {
  const extension = label.split(".").pop()?.toLowerCase();
  return (extension && EXTENSION_LANGUAGE_MAP[extension]) || "markup";
}

interface CodePreviewSectionProps {
  product: Product;
}

export function CodePreviewSection({ product }: CodePreviewSectionProps) {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const { openAuthModal } = useAuth();
  const tabs = (product.code_preview ?? []).filter(
    (item) => item.code.trim().length > 0,
  );

  const [activeKey, setActiveKey] = useState(tabs[0]?.id);
  const [copied, setCopied] = useState(false);

  // 인터셉팅 라우트 모달처럼 컴포넌트가 리마운트되지 않은 채 product만 바뀌는
  // 경로에서, 이전 상품의 활성 탭이 그대로 남는 상태 불일치를 막는다.
  useEffect(() => {
    setActiveKey(tabs[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  if (tabs.length === 0) return null;

  const activeTab = tabs.find((tab) => tab.id === activeKey) ?? tabs[0];

  async function handleCopy() {
    if (!isAuthenticated) {
      openAuthModal("login", `/detail/${product.slug}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  return (
    <div className="max-w-[1365px]">
      <h2 className="mb-6 text-xl font-black tracking-[-0.03em] text-gf-black">코드 미리보기</h2>

      <div className="overflow-hidden rounded-2xl">
        <div role="tablist" className="flex overflow-x-auto border-b border-white/10 bg-[#282c34]">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              active={tab.id === activeTab.id}
              onClick={() => setActiveKey(tab.id)}
              className={cn(
                tab.id === activeTab.id
                  ? "border-gf-orange text-gf-orange"
                  : "border-transparent text-white/60 hover:text-white",
              )}
            >
              {tab.label}
            </Tab>
          ))}
        </div>

        <div className="relative">
          <SyntaxHighlighter
            language={getLanguageFromLabel(activeTab.label)}
            style={codeTheme} // react-syntax-highlighter 테마 객체(Prism 토큰별 컬러 매핑) — style= 예외 허용
            className={cn(
              "m-0 max-h-80 rounded-none text-[13px]",
              !isAuthenticated && "select-none blur-md",
            )}
            codeTagProps={{ className: "font-mono" }}
          >
            {activeTab.code}
          </SyntaxHighlighter>

          {/* 비회원 블라인드 오버레이 — blur만으로는 텍스트가 일부 비쳐 보일 수 있어
              반투명 배경을 함께 덮어 코드 내용이 실제로 보이지 않도록 한다. */}
          {!isAuthenticated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#282c34]/70 px-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-white/10">
                <Lock className="size-5 text-white" />
              </div>
              <p className="text-sm font-bold text-white">로그인하면 전체 코드를 볼 수 있어요</p>
              <Button
                type="button"
                onClick={() => openAuthModal("login", `/detail/${product.slug}`)}
                className="h-9 rounded-full bg-gf-orange px-5 text-sm font-bold text-white hover:bg-gf-orange/90"
              >
                로그인하기
              </Button>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={handleCopy}
          className="h-auto w-full gap-2 rounded-none border-0 border-t border-white/10 bg-[#282c34] py-3 text-sm font-bold tracking-wide text-gf-orange hover:bg-[#282c34] hover:text-gf-orange"
        >
          {!isAuthenticated ? (
            <Lock className="h-4 w-4" />
          ) : copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {!isAuthenticated ? "로그인하고 복사하기" : copied ? "복사됨" : "COPY"}
        </Button>
      </div>
    </div>
  );
}
