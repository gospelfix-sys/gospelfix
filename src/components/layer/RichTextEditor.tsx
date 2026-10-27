"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import CustomTextStyle from "@/components/layer/richTextStyle";
import { RichTextToolbar } from "@/components/layer/richText/RichTextToolbar";

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
export function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
}: RichTextEditorProps) {
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

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gf-border bg-gf-white">
      <RichTextToolbar editor={editor} />

      <EditorContent editor={editor} />
    </div>
  );
}
