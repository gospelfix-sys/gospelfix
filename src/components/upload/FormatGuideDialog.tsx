"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FormatGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormatGuideDialog({ open, onOpenChange }: FormatGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">업로드 가능한 파일 안내</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-gf-black">파일 포맷</h3>
            <p className="text-sm text-gf-gray1">이미지 JPG, PNG, WEBP</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-gf-black">최대 용량</h3>
            <p className="text-sm text-gf-gray1">이미지 20MB</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-gf-black">동영상</h3>
            <p className="text-sm text-gf-gray1">
              파일 업로드는 지원하지 않습니다. Youtube 또는 Vimeo에 영상을 올린 뒤 공유 링크를
              붙여넣어주세요.
            </p>
          </div>
          <p className="border-t border-gf-border pt-4 text-xs text-gf-gray2">
            위 형식 외의 이미지 파일은 업로드할 수 없습니다. 다른 형식의 이미지는 위 포맷으로
            변환한 뒤 업로드해주세요.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
