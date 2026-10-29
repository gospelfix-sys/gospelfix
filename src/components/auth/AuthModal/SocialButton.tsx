import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

// 구글·카카오 소셜 로그인 버튼이 공유하는 공용 버튼
export default function SocialButton({ icon, label, onClick, className }: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      className={cn("h-11 w-full gap-2", className)}
    >
      {icon}
      {label}
    </Button>
  );
}
