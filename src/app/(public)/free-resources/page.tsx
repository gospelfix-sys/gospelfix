import { Metadata } from "next";
import { LayerShell } from "@/components/layer/LayerShell";

export const metadata: Metadata = {
  title: "무료 리소스 | 모다(MODA)",
  description: "모다(MODA)에서 무료로 제공하는 리소스를 준비하고 있습니다.",
};

export default function FreeResourcesPage() {
  return (
    <LayerShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-black tracking-[-0.03em] text-gf-black uppercase">
          Free Resources
        </h1>
        <p className="text-sm text-gf-gray1">콘텐츠를 준비 중입니다. 곧 만나보실 수 있어요.</p>
      </div>
    </LayerShell>
  );
}
