"use client";

import { useRef } from "react";
import { ChevronRight, Image as ImageIcon, Type, Video as VideoIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditorLazy } from "@/components/layer/RichTextEditorLazy";
import { AddBlockButton } from "@/components/layer/upload/AddBlockButton";
import type { ContentBlock } from "@/components/layer/upload/uploadEditorUtils";
import { cn } from "@/lib/utils";

interface UploadCanvasProps {
  blocks: ContentBlock[];
  onImagePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddVideoLinkBlock: () => void;
  onAddTextBlock: () => void;
  onUpdateVideoBlock: (id: string, patch: Partial<ContentBlock>) => void;
  onResolveBlockVideoLink: (id: string) => void;
  onUpdateTextBlock: (id: string, html: string) => void;
  onRemoveBlock: (id: string) => void;
  onOpenFormatGuide: () => void;
}

// 작업 파일 캔버스 — 상세 콘텐츠(content_html)로 직렬화됨
export function UploadCanvas({
  blocks,
  onImagePick,
  onAddVideoLinkBlock,
  onAddTextBlock,
  onUpdateVideoBlock,
  onResolveBlockVideoLink,
  onUpdateTextBlock,
  onRemoveBlock,
  onOpenFormatGuide,
}: UploadCanvasProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 rounded-2xl border border-gf-border bg-gf-white p-6 lg:p-8">
      {blocks.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 text-center">
          <p className="text-xl font-bold text-gf-black">작업 파일을 올려주세요</p>
          <div className="flex items-center gap-8">
            <AddBlockButton
              icon={ImageIcon}
              label="이미지"
              onClick={() => imageInputRef.current?.click()}
            />
            <AddBlockButton icon={VideoIcon} label="영상 링크" onClick={onAddVideoLinkBlock} />
            <AddBlockButton icon={Type} label="에디터" onClick={onAddTextBlock} />
          </div>
          <button
            type="button"
            onClick={onOpenFormatGuide}
            className="inline-flex items-center gap-0.5 text-xs text-gf-gray2 hover:text-gf-black"
          >
            지원 포맷, 코덱 자세히 보기
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={cn(
                "relative",
                block.type !== "text" && "rounded-xl border border-gf-border p-3",
              )}
            >
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                onClick={() => onRemoveBlock(block.id)}
                aria-label="블록 삭제"
                className="absolute right-2 top-2 z-10 rounded-full bg-gf-white"
              >
                <X className="h-3 w-3" />
              </Button>

              {block.type === "image" && block.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.url} alt="" className="max-h-80 w-full rounded-lg object-contain" />
              )}
              {block.type === "video" && (
                <div className="space-y-2">
                  <Input
                    value={block.videoInput ?? ""}
                    onChange={(e) => onUpdateVideoBlock(block.id, { videoInput: e.target.value })}
                    onBlur={() => onResolveBlockVideoLink(block.id)}
                    placeholder="Youtube 또는 Vimeo 링크를 붙여넣으세요"
                    className="h-10 rounded-xl bg-gf-white"
                  />
                  {block.embedUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <iframe
                        src={block.embedUrl}
                        className="absolute inset-0 h-full w-full"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title="영상 미리보기"
                      />
                    </div>
                  )}
                </div>
              )}
              {block.type === "text" && (
                <RichTextEditorLazy
                  value={block.html ?? ""}
                  onChange={(html) => onUpdateTextBlock(block.id, html)}
                />
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <AddBlockButton
              icon={ImageIcon}
              label="이미지"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
            />
            <AddBlockButton
              icon={VideoIcon}
              label="영상 링크"
              size="sm"
              onClick={onAddVideoLinkBlock}
            />
            <AddBlockButton icon={Type} label="에디터" size="sm" onClick={onAddTextBlock} />
          </div>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={onImagePick}
      />
    </div>
  );
}
