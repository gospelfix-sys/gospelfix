import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용가이드 | GOSPELFIX",
  description: "GOSPELFIX 이용 방법을 안내합니다.",
};

export default function GuidePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-gf-bg px-6 text-center">
      <h1 className="text-2xl font-black tracking-[-0.03em] text-gf-black">이용가이드</h1>
      <p className="text-sm text-gf-gray1">콘텐츠를 준비 중입니다. 곧 만나보실 수 있어요.</p>
    </div>
  );
}
