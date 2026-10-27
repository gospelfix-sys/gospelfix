"use client";

import { useEffect, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

interface ColorControlProps {
  editor: Editor;
}

export function ColorControl({ editor }: ColorControlProps) {
  const currentColor = useEditorState({
    editor,
    selector: ({ editor }) => editor.getAttributes("textStyle").color as string | undefined,
  });
  const [hexInput, setHexInput] = useState(currentColor ?? "");

  useEffect(() => {
    setHexInput(currentColor ?? "");
  }, [currentColor]);

  function applyHex(value: string) {
    const normalized = value.trim();
    if (!HEX_COLOR_PATTERN.test(normalized)) return;
    const expanded =
      normalized.length === 4
        ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
        : normalized;
    editor.chain().focus().setColor(expanded).run();
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <label
        title="색상 팔레트에서 선택"
        className="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-gf-white"
      >
        <span
          className="h-4 w-4 rounded-full border border-gf-border"
          // 사용자가 색상 피커로 임의 선택하는 hex 값 — 무한한 값의 집합이라 정적
          // Tailwind 클래스로 표현 불가(@dnd-kit 런타임 transform과 동일 성격의 예외)
          style={{ backgroundColor: currentColor ?? "#000000" }}
        />
        <input
          type="color"
          value={currentColor ?? "#000000"}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <Input
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value)}
        onBlur={() => applyHex(hexInput)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            applyHex(hexInput);
            e.currentTarget.blur();
          }
        }}
        placeholder="#000000"
        title="글자 색상 (HEX)"
        className="h-7 w-[74px] rounded-lg font-mono text-xs uppercase"
      />
      {currentColor && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="색상 지우기"
          className="h-7 px-1.5 text-xs text-gf-gray2 hover:bg-gf-white hover:text-gf-black"
        >
          지우기
        </Button>
      )}
    </div>
  );
}
