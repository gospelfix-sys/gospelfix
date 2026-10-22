import { Metadata } from "next";
import { LayerShell } from "@/components/layer/LayerShell";

export const metadata: Metadata = {
  title: "크리에이터 | 모다(MODA)",
  description: "모다(MODA)의 크리에이터를 소개하는 페이지를 준비하고 있습니다.",
};

export default function CreatorPage() {
  return (
    <LayerShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-black tracking-[-0.03em] text-gf-black uppercase">Creator</h1>
        <p className="text-sm text-gf-gray1">콘텐츠를 준비 중입니다. 곧 만나보실 수 있어요.</p>
      </div>
    </LayerShell>
  );
}
