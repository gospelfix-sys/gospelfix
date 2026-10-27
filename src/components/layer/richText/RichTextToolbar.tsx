"use client";

import { useRef } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
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
  ImagePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { ToolbarButton, Divider } from "@/components/layer/richText/ToolbarButton";
import { FontSizeControl } from "@/components/layer/richText/FontSizeControl";
import { ColorControl } from "@/components/layer/richText/ColorControl";

interface RichTextToolbarProps {
  editor: Editor;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gf-border bg-gf-bg p-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={toolbarState?.isBold}
        title="굵게 (Ctrl+B)"
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={toolbarState?.isItalic}
        title="기울임 (Ctrl+I)"
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={toolbarState?.isUnderline}
        title="밑줄 (Ctrl+U)"
      >
        <UnderlineIcon size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={toolbarState?.isStrike}
        title="취소선"
      >
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

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={toolbarState?.isBulletList}
        title="글머리 기호"
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={toolbarState?.isOrderedList}
        title="번호 목록"
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={toolbarState?.isBlockquote}
        title="인용"
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={toolbarState?.isCodeBlock}
        title="코드 블록"
      >
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
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
  );
}
