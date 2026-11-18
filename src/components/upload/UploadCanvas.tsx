"use client";

import { useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Image as ImageIcon,
  Plus,
  Type,
  Video as VideoIcon,
  X,
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditorLazy } from "@/components/rich-text/RichTextEditorLazy";
import { AddBlockButton } from "@/components/upload/AddBlockButton";
import { SortableGalleryImage } from "@/components/upload/SortableGalleryImage";
import { SortableBlock } from "@/components/upload/SortableBlock";
import type { ContentBlock, GalleryDevice } from "@/components/upload/uploadEditorUtils";
import { cn } from "@/lib/utils";

interface UploadCanvasProps {
  blocks: ContentBlock[];
  onImagePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddGalleryImages: (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetGalleryImageDevice: (blockId: string, imageId: string, device: GalleryDevice) => void;
  onRemoveGalleryImage: (blockId: string, imageId: string) => void;
  onReorderGalleryImages: (blockId: string, activeId: string, overId: string) => void;
  onAddVideoLinkBlock: () => void;
  onAddTextBlock: () => void;
  onUpdateVideoBlock: (id: string, patch: Partial<ContentBlock>) => void;
  onResolveBlockVideoLink: (id: string) => void;
  onUpdateTextBlock: (id: string, html: string) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onReorderBlocks: (activeId: string, overId: string) => void;
  onOpenFormatGuide: () => void;
}

// 작업 파일 캔버스 — 상세 콘텐츠(content_html)로 직렬화됨
export function UploadCanvas({
  blocks,
  onImagePick,
  onAddGalleryImages,
  onSetGalleryImageDevice,
  onRemoveGalleryImage,
  onReorderGalleryImages,
  onAddVideoLinkBlock,
  onAddTextBlock,
  onUpdateVideoBlock,
  onResolveBlockVideoLink,
  onUpdateTextBlock,
  onRemoveBlock,
  onMoveBlock,
  onReorderBlocks,
  onOpenFormatGuide,
}: UploadCanvasProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  // 묶음마다 "사진 추가" 버튼이 있지만 파일 입력은 하나만 두고, 어느 묶음에 넣을지는 ref로 기억한다.
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const galleryTargetRef = useRef<string | null>(null);

  // 마우스는 8px 이상 끌어야 시작해 클릭과 구분하고, 터치는 길게 눌러야 시작해 스크롤과 구분한다.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over) onReorderBlocks(String(active.id), String(over.id));
  }

  function handleGalleryDragEnd(blockId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (over) onReorderGalleryImages(blockId, String(active.id), String(over.id));
  }

  function openGalleryPicker(blockId: string) {
    galleryTargetRef.current = blockId;
    galleryInputRef.current?.click();
  }

  function handleGalleryPick(e: React.ChangeEvent<HTMLInputElement>) {
    const blockId = galleryTargetRef.current;
    galleryTargetRef.current = null;
    if (!blockId) {
      e.target.value = "";
      return;
    }
    onAddGalleryImages(blockId, e);
  }

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block, blockIndex) => (
                <SortableBlock
                  key={block.id}
                  id={block.id}
                  className={cn(block.type !== "text" && "rounded-xl border border-gf-border p-3")}
                >
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="round"
                      size="icon-xs"
                      onClick={() => onMoveBlock(block.id, "up")}
                      disabled={blockIndex === 0}
                      aria-label="블록 위로 이동"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="round"
                      size="icon-xs"
                      onClick={() => onMoveBlock(block.id, "down")}
                      disabled={blockIndex === blocks.length - 1}
                      aria-label="블록 아래로 이동"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="round"
                      size="icon-xs"
                      onClick={() => onRemoveBlock(block.id)}
                      aria-label="블록 삭제"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {block.type === "image" && block.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={block.url}
                      alt=""
                      className="max-h-80 w-full rounded-lg object-contain"
                    />
                  )}
                  {block.type === "gallery" && (
                    <div className="space-y-3 pr-24">
                      <p className="text-xs text-gf-gray2">
                        사진 {block.images?.length ?? 0}장 · 상세페이지에서 좌우로 넘겨 볼 수
                        있어요. 사진 아래 버튼으로 Desktop/Mobile 용도를 바꾸면 상세페이지에 전환
                        토글이 생겨요.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {/* 블록 정렬 컨텍스트와 별개로 묶음마다 자기 컨텍스트를 둬서 사진끼리만 정렬된다. */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleGalleryDragEnd(block.id, event)}
                        >
                          <SortableContext
                            items={(block.images ?? []).map((image) => image.id)}
                            strategy={rectSortingStrategy}
                          >
                            {(block.images ?? []).map((image, idx) => (
                              <SortableGalleryImage key={image.id} id={image.id}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.url}
                                  alt={`묶음 이미지 ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                {/* 누르면 Desktop ↔ Mobile 용도가 바뀐다. 상세페이지 토글이 이 값으로 사진을 거른다. */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  onClick={() =>
                                    onSetGalleryImageDevice(
                                      block.id,
                                      image.id,
                                      image.device === "mobile" ? "desktop" : "mobile",
                                    )
                                  }
                                  aria-label={`묶음 이미지 ${idx + 1} 용도 변경`}
                                  className="absolute inset-x-1 bottom-1 h-5 justify-center rounded-full bg-white px-0 text-[10px] text-black"
                                >
                                  {image.device === "mobile" ? "Mobile" : "Desktop"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="round"
                                  size="icon-xs"
                                  onClick={() => onRemoveGalleryImage(block.id, image.id)}
                                  aria-label={`묶음 이미지 ${idx + 1} 삭제`}
                                  className="absolute right-1 top-1"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </SortableGalleryImage>
                            ))}
                          </SortableContext>
                        </DndContext>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openGalleryPicker(block.id)}
                          className="h-24 w-24 flex-col gap-1 rounded-lg border-dashed text-gf-gray2"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-xs">사진 추가</span>
                        </Button>
                      </div>
                    </div>
                  )}
                  {block.type === "video" && (
                    <div className="space-y-2">
                      <Input
                        value={block.videoInput ?? ""}
                        onChange={(e) =>
                          onUpdateVideoBlock(block.id, { videoInput: e.target.value })
                        }
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
                </SortableBlock>
              ))}
            </SortableContext>
          </DndContext>

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
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={onImagePick}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={handleGalleryPick}
      />
    </div>
  );
}
