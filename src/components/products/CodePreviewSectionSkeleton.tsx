export function CodePreviewSectionSkeleton() {
  return (
    <div className="max-w-[1365px] animate-pulse">
      <h2 className="mb-6 text-xl font-black tracking-[-0.03em] text-gf-black">코드 미리보기</h2>

      <div className="overflow-hidden rounded-2xl bg-[#282c34]">
        <div className="flex border-b border-white/10 px-4 py-3">
          <div className="h-4 w-20 rounded bg-white/10" />
        </div>
        <div className="h-80" />
        <div className="h-11 border-t border-white/10" />
      </div>
    </div>
  );
}
