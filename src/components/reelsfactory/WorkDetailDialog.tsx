import Image from "next/image";

import type { WorkProject } from "@/types/reelsfactory.types";
import { buttonVariants } from "@/components/ui/button";
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
      <DialogContent className="sm:max-w-2xl">
        {work && (
          <>
            <DialogHeader className="pr-8">
              <DialogTitle className="text-xl leading-tight">
                {work.nameKo}
                <span lang="en" className="ml-2 text-xs font-normal text-muted-foreground">
                  {work.nameEn}
                </span>
              </DialogTitle>
              <DialogDescription>{work.summary}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              {gallery.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={src}
                    alt={`${work.nameKo} 화면 ${index + 1}`}
                    fill
                    sizes="(min-width: 640px) 42rem, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <dl className="grid grid-cols-[4rem_1fr] gap-x-3 gap-y-2">
              <dt className="text-muted-foreground">분야</dt>
              <dd>{work.category}</dd>
              <dt className="text-muted-foreground">기간</dt>
              <dd>{work.duration}</dd>
              <dt className="text-muted-foreground">툴</dt>
              <dd>
                <ul className="flex flex-wrap gap-1.5">
                  {work.tools.map((tool) => (
                    <li key={tool} className="rounded-sm border px-2 py-0.5 text-xs">
                      {tool}
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>

            <section aria-labelledby="work-situation" className="flex flex-col gap-1.5">
              <h3 id="work-situation" className="font-medium">
                상황
              </h3>
              <p className="text-muted-foreground">{work.situation}</p>
            </section>

            <section aria-labelledby="work-actions" className="flex flex-col gap-1.5">
              <h3 id="work-actions" className="font-medium">
                행동
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {work.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>

            {work.archivedNote ? (
              <p className="text-muted-foreground">{work.archivedNote}</p>
            ) : (
              work.siteUrl && (
                <a
                  href={work.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "default", size: "lg" })}
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
