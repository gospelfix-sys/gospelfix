"use client";

import dynamic from "next/dynamic";

// @tiptap/* + prosemirror-* 의존성이 무거워(수 MB) UploadWorkEditor의 초기 JS 청크에
// 정적으로 포함되면 /upload 진입 시 텍스트 블록을 아직 추가하지 않은 사용자도
// 그 비용을 그대로 지불하게 된다. 텍스트 블록이 실제로 화면에 렌더될 때만 별도 청크로
// 불러온다(순수 클라이언트 인터랙션이라 ssr:false).
export const RichTextEditorLazy = dynamic(
  () => import("./RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full animate-pulse rounded-xl border border-gf-border bg-gf-bg" />
    ),
  },
);
