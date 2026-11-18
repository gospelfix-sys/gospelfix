"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import CustomTextStyle from "@/components/rich-text/richTextStyle";
import { RichTextToolbar } from "@/components/rich-text/RichTextToolbar";
import { registerEditorImage } from "@/components/rich-text/editorImages";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// 작품 업로드 화면의 "텍스트" 블록 전용 Tiptap 리치 에디터. gospelfix.cms.api의
// components/admin/RichEditor(관리자 상품 본문 에디터)와 동일한 확장 구성을 쓰되,
// - 이 앱의 gf-* 디자인 토큰 + Button 컴포넌트로 다시 스타일링했고(dark: 클래스 미사용)
// - 이미지 삽입은 편집 중에는 로컬 blob 미리보기로 보여 주고, 저장 시점에
//   uploadEditorImages()가 실제로 업로드해 URL을 바꿔 넣는다(useUploadWorkSubmit).
export function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      // TipTap v3 StarterKit은 Link·Underline을 이미 포함한다. 끄지 않으면 같은 확장이 두 번 등록돼,
      // StarterKit의 Link(openOnClick 기본 true)가 편집 중 링크를 눌렀을 때 새 탭으로 열어 버린다.
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      CustomTextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapImage.configure({
        // 링크 마크는 인라인 노드에만 씌울 수 있어 이미지를 문단 안의 인라인 노드로 둔다.
        // (화면에서는 preflight의 img display:block 덕분에 기존과 같이 한 줄을 차지한다.)
        inline: true,
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
          const image = view.state.schema.nodes.image.create({ src: registerEditorImage(file) });
          const node = view.state.doc.resolve(insertPos).parent.inlineContent
            ? image
            : view.state.schema.nodes.paragraph.create(null, image);
          view.dispatch(view.state.tr.insert(insertPos, node));
          insertPos += node.nodeSize;
        }
        return true;
      },
      // 스크린샷 등을 클립보드로 붙여넣을 때도 툴바 삽입과 같이 처리한다(기본 동작은 이미지를 무시).
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
          file.type.startsWith("image/"),
        );
        if (files.length === 0) return false;

        event.preventDefault();
        for (const file of files) {
          const node = view.state.schema.nodes.image.create({ src: registerEditorImage(file) });
          view.dispatch(view.state.tr.replaceSelectionWith(node));
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
