"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

export function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-lg",
        active
          ? "border border-gf-orange bg-gf-orange-bg text-gf-orange hover:bg-gf-orange-bg hover:text-gf-orange"
          : "text-gf-gray2 hover:bg-gf-white hover:text-gf-black",
      )}
    >
      {children}
    </Button>
  );
}

export function Divider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-gf-border" />;
}
