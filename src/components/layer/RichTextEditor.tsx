"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Link2,
  Unlink,
  ChevronDown,
  ImagePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CustomTextStyle from "@/components/layer/richTextStyle";

const DEFAULT_FONT_SIZE_LABEL = "기본 (16px)";
const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64, 72, 96];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// 작품 업로드 화면의 "텍스트" 블록 전용 Tiptap 리치 에디터. gospelfix.cms.api의
// components/admin/RichEditor(관리자 상품 본문 에디터)와 동일한 확장 구성을 쓰되,
// - 이 앱의 gf-* 디자인 토큰 + Button 컴포넌트로 다시 스타일링했고(dark: 클래스 미사용)
// - 이미지 삽입은 아직 백엔드 연동 전이라 Supabase Storage 업로드 대신 로컬 blob
//   미리보기만 지원한다(추후 cms.api 연동 시 실제 업로드로 교체 예정).
export function RichTextEditor({ value, onChange, placeholder = "내용을 입력하세요" }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CustomTextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapImage.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Placeholder.configure({ placeholder }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "layer-rich-editor-content focus:outline-none min-h-[160px] p-4 text-gf-black",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith("image/"),
        );
        if (files.length === 0) return false;

        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        let insertPos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;

        for (const file of files) {
          const node = view.state.schema.nodes.image.create({ src: URL.createObjectURL(file) });
          view.dispatch(view.state.tr.insert(insertPos, node));
          insertPos += node.nodeSize;
        }
        return true;
      },
    },
  });

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isUnderline: editor.isActive("underline"),
        isStrike: editor.isActive("strike"),
        isHeading1: editor.isActive("heading", { level: 1 }),
        isHeading2: editor.isActive("heading", { level: 2 }),
        isHeading3: editor.isActive("heading", { level: 3 }),
        isAlignLeft: editor.isActive({ textAlign: "left" }),
        isAlignCenter: editor.isActive({ textAlign: "center" }),
        isAlignRight: editor.isActive({ textAlign: "right" }),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        isBlockquote: editor.isActive("blockquote"),
        isCodeBlock: editor.isActive("codeBlock"),
        isLink: editor.isActive("link"),
      };
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL을 입력하세요:", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    try {
      const parsed = new URL(url);
      if (!["https:", "http:", "mailto:"].includes(parsed.protocol)) {
        toast.error("허용되지 않는 URL 형식입니다. (https, http, mailto만 허용)");
        return;
      }
    } catch {
      toast.error("올바른 URL 형식이 아닙니다.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImages(files: FileList | null) {
    if (!editor || !files || files.length === 0) return;
    for (const file of Array.from(files)) {
      editor.chain().focus().setImage({ src: URL.createObjectURL(file) }).run();
    }
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gf-border bg-gf-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gf-border bg-gf-bg p-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={toolbarState?.isBold} title="굵게 (Ctrl+B)">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={toolbarState?.isItalic} title="기울임 (Ctrl+I)">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={toolbarState?.isUnderline} title="밑줄 (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={toolbarState?.isStrike} title="취소선">
          <Strikethrough size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={toolbarState?.isHeading1}
          title="제목 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={toolbarState?.isHeading2}
          title="제목 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={toolbarState?.isHeading3}
          title="제목 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <Divider />

        <FontSizeControl editor={editor} />
        <ColorControl editor={editor} />

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={toolbarState?.isAlignLeft}
          title="왼쪽 정렬"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={toolbarState?.isAlignCenter}
          title="가운데 정렬"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={toolbarState?.isAlignRight}
          title="오른쪽 정렬"
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={toolbarState?.isBulletList} title="글머리 기호">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={toolbarState?.isOrderedList} title="번호 목록">
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={toolbarState?.isBlockquote} title="인용">
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={toolbarState?.isCodeBlock} title="코드 블록">
          <Code2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
          <Minus size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={setLink} active={toolbarState?.isLink} title="링크 추가">
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="링크 제거">
          <Unlink size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="이미지 삽입">
          <ImagePlus size={15} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            insertImages(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-lg",
        active
          ? "border border-gf-orange bg-gf-orange-bg text-gf-orange hover:bg-gf-orange-bg hover:text-gf-orange"
          : "text-gf-gray2 hover:bg-gf-white hover:text-gf-black",
      )}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-gf-border" />;
}

function FontSizeControl({ editor }: { editor: Editor }) {
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

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function ColorControl({ editor }: { editor: Editor }) {
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
