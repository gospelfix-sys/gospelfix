"use client";

import { useRef } from "react";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CoverUploadFieldProps {
  coverMode: "image" | "video-link";
  coverPreview: string | null;
  coverVideoInput: string;
  onCoverModeChange: (mode: "image" | "video-link") => void;
  onCoverVideoInputChange: (value: string) => void;
  onCoverPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverRemove: () => void;
  onCoverVideoBlur: () => void;
}

export function CoverUploadField({
  coverMode,
  coverPreview,
  coverVideoInput,
  onCoverModeChange,
  onCoverVideoInputChange,
  onCoverPick,
  onCoverRemove,
  onCoverVideoBlur,
}: CoverUploadFieldProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gf-black">섬네일 업로드</h2>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={coverMode === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => onCoverModeChange("image")}
        >
          이미지 업로드
        </Button>
        <Button
          type="button"
          variant={coverMode === "video-link" ? "default" : "outline"}
          size="sm"
          onClick={() => onCoverModeChange("video-link")}
        >
          Youtube/Vimeo 링크
        </Button>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-gf-border bg-gf-white p-3">
        {/* 삭제 버튼이 둥근 모서리 클리핑에 잘리지 않게 overflow-hidden 박스 바깥 래퍼에 둔다 */}
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gf-bg">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="섬네일 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-gf-gray2" />
            )}
          </div>
          {coverPreview && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onCoverRemove}
              aria-label="섬네일 삭제"
              className="absolute -right-1.5 -top-1.5 size-5 rounded-full bg-gf-black text-white shadow hover:bg-gf-black hover:text-white"
            >
              <X />
            </Button>
          )}
        </div>
        {coverMode === "image" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => coverInputRef.current?.click()}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            섬네일 업로드
          </Button>
        ) : (
          <Input
            value={coverVideoInput}
            onChange={(e) => onCoverVideoInputChange(e.target.value)}
            onBlur={onCoverVideoBlur}
            placeholder="Youtube 또는 Vimeo 링크 붙여넣기"
            className="h-10 flex-1 rounded-xl bg-gf-white"
          />
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onCoverPick}
        />
      </div>
      <p className="text-xs text-gf-gray2">
        {coverMode === "image"
          ? "권장 사이즈 1200x600px (2:1 가로형) · JPG, PNG, WEBP, AVIF"
          : "링크를 붙여넣으면 영상 썸네일이 섬네일로 자동 적용됩니다."}
      </p>
    </div>
  );
}
