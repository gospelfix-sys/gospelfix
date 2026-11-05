"use client";

import { useRef } from "react";
import { Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CoverUploadFieldProps {
  coverMode: "image" | "video-link";
  coverPreview: string | null;
  coverVideoInput: string;
  onCoverModeChange: (mode: "image" | "video-link") => void;
  onCoverVideoInputChange: (value: string) => void;
  onCoverPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverVideoBlur: () => void;
}

export function CoverUploadField({
  coverMode,
  coverPreview,
  coverVideoInput,
  onCoverModeChange,
  onCoverVideoInputChange,
  onCoverPick,
  onCoverVideoBlur,
}: CoverUploadFieldProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gf-black">표지 업로드</h2>
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
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gf-bg">
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="표지 미리보기" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gf-gray2" />
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
            표지 업로드
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
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onCoverPick}
        />
      </div>
      <p className="text-xs text-gf-gray2">
        {coverMode === "image"
          ? "권장 사이즈 1080x1350px (4:5 세로형) · JPG, PNG, WEBP"
          : "링크를 붙여넣으면 영상 썸네일이 표지로 자동 적용됩니다."}
      </p>
    </div>
  );
}
