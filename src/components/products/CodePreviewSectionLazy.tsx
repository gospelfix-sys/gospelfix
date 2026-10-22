"use client";

import dynamic from "next/dynamic";
import { CodePreviewSectionSkeleton } from "./CodePreviewSectionSkeleton";

// react-syntax-highlighter(6개 언어 모듈 + 테마)는 순수 클라이언트 인터랙션(탭 전환, 복사)이고
// 비로그인 시 blur 처리되어 SEO 가치가 낮으므로 ssr:false로 서버 렌더링 비용과 초기 클라이언트
// 번들에서 제외하고, 화면에 보일 때만 별도 청크로 불러온다.
export const CodePreviewSectionLazy = dynamic(
  () => import("./CodePreviewSection").then((m) => m.CodePreviewSection),
  { ssr: false, loading: () => <CodePreviewSectionSkeleton /> },
);
