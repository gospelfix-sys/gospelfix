"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadFileFieldProps {
  newZipFile: File | null;
  filePath: string | null;
  onZipPick: (file: File) => void;
  onZipClear: () => void;
}

export function DownloadFileField({
  newZipFile,
  filePath,
  onZipPick,
  onZipClear,
}: DownloadFileFieldProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gf-black">다운로드 파일</h2>
      {(newZipFile || filePath) && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-gf-border bg-gf-white px-3 py-2 text-sm">
          <span className="truncate text-gf-black">
            {newZipFile ? newZipFile.name : filePath?.split("/").pop()}
          </span>
          <Button type="button" variant="ghost" size="icon-xs" onClick={onZipClear}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => zipInputRef.current?.click()}
      >
        {newZipFile || filePath ? "파일 교체" : "파일 선택"}
      </Button>
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onZipPick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
