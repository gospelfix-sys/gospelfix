import Image from "next/image";

import type { WorkProject } from "@/types/reelsfactory.types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import ToolGroups from "@/components/reelsfactory/ToolGroups";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkDetailDialogProps {
  /** 닫힘 애니메이션 동안에도 내용이 유지되도록 부모가 마지막 선택값을 계속 넘긴다 */
  work: WorkProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WorkDetailDialog({ work, open, onOpenChange }: WorkDetailDialogProps) {
  // API 이미지가 없으면 썸네일 한 장으로 대신한다
  const gallery = work ? (work.images.length > 0 ? work.images : [work.thumbnail]) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 포털로 body에 렌더돼 섹션 색을 상속받지 못하므로 rf 팔레트를 직접 입힌다. 닫기(X) 버튼은 공용 Button(ghost)이라 슬롯 선택자로 색만 맞춘다 */}
      <DialogContent
        className={cn(
          "bg-rf-ink text-rf-cream ring-rf-cream/20 sm:max-w-2xl",
          "[&>[data-slot=dialog-close]]:text-rf-cream [&>[data-slot=dialog-close]:hover]:bg-rf-cream/15",
        )}
      >
        {work && (
          <>
            <DialogHeader className="pr-8">
              <DialogTitle className="text-xl leading-tight text-inherit">
                {work.nameKo}
                <span lang="en" className="ml-2 text-xs font-normal text-rf-cream/70">
                  {work.nameEn}
                </span>
              </DialogTitle>
              <DialogDescription className="text-rf-cream/70">{work.summary}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              {gallery.map((src, index) => (
                // 상세페이지 캡처는 세로로 길어 고정 비율 칸에 넣으면 잘리므로, 원본 비율대로 폭에 맞춘다
                <div
                  key={`${src}-${index}`}
                  className="w-full overflow-hidden rounded-lg bg-rf-cream/10"
                >
                  <Image
                    src={src}
                    alt={`${work.nameKo} 화면 ${index + 1}`}
                    width={0}
                    height={0}
                    sizes="(min-width: 640px) 42rem, 100vw"
                    className="block h-auto w-full"
                  />
                </div>
              ))}
            </div>

            <dl className="grid grid-cols-[4rem_1fr] gap-x-3 gap-y-2">
              <dt className="text-rf-cream/70">분야</dt>
              <dd>{work.category}</dd>
              <dt className="text-rf-cream/70">기간</dt>
              <dd>{work.duration}</dd>
              <dt className="text-rf-cream/70">툴</dt>
              <dd>
                <ToolGroups
                  tools={work.tools}
                  chipClassName="border border-rf-cream/30"
                  labelClassName="text-rf-cream/70"
                />
              </dd>
            </dl>

            <section aria-labelledby="work-situation" className="flex flex-col gap-1.5">
              <h3 id="work-situation" className="font-medium text-inherit">
                상황
              </h3>
              <p className="text-rf-cream/70">{work.situation}</p>
            </section>

            <section aria-labelledby="work-actions" className="flex flex-col gap-1.5">
              <h3 id="work-actions" className="font-medium text-inherit">
                행동
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-rf-cream/70">
                {work.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>

            {work.archivedNote ? (
              <p className="text-rf-cream/70">{work.archivedNote}</p>
            ) : (
              work.siteUrl && (
                <a
                  href={work.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "bg-rf-cream text-rf-ink hover:bg-rf-cream/85",
                  )}
                >
                  사이트 방문
                  <span className="sr-only"> (새 탭에서 열림)</span>
                </a>
              )
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
