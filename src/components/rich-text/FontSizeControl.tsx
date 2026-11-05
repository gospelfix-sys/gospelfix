"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_FONT_SIZE_LABEL = "기본 (16px)";
const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64, 72, 96];

interface FontSizeControlProps {
  editor: Editor;
}

export function FontSizeControl({ editor }: FontSizeControlProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSize = useEditorState({
    editor,
    selector: ({ editor }) => editor.getAttributes("textStyle").fontSize as string | undefined,
  });

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function select(size: number | null) {
    if (size === null) {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(`${size}px`).run();
    }
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        title="글자 크기"
        className="h-7 gap-0.5 px-1.5 text-xs text-gf-gray2 hover:bg-gf-white hover:text-gf-black"
      >
        {currentSize ? currentSize.replace("px", "") : DEFAULT_FONT_SIZE_LABEL}
        <ChevronDown size={12} />
      </Button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-32 overflow-auto rounded-xl border border-gf-border bg-gf-white p-1 text-sm shadow-lg"
        >
          <li
            role="option"
            aria-selected={!currentSize}
            onClick={() => select(null)}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-1.5 font-medium text-gf-black hover:bg-gf-bg",
              !currentSize && "bg-gf-bg",
            )}
          >
            {DEFAULT_FONT_SIZE_LABEL}
          </li>
          {FONT_SIZE_OPTIONS.map((size) => (
            <li
              key={size}
              role="option"
              aria-selected={currentSize === `${size}px`}
              onClick={() => select(size)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-gf-black hover:bg-gf-bg",
                currentSize === `${size}px` && "bg-gf-bg",
              )}
            >
              {size}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
