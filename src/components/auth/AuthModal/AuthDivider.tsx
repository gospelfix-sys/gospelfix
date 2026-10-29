import { cn } from "@/lib/utils";

interface AuthDividerProps {
  label: string;
  className?: string;
}

// 가운데 문구가 있는 가로 구분선
export default function AuthDivider({ label, className }: AuthDividerProps) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <div className="h-px flex-1 bg-gf-line" />
      <span className="text-xs text-gf-gray2">{label}</span>
      <div className="h-px flex-1 bg-gf-line" />
    </div>
  );
}
