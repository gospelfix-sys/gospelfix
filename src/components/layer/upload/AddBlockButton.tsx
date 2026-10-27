"use client";

import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddBlockButtonProps {
  icon: typeof ImageIcon;
  label: string;
  onClick: () => void;
  size?: "default" | "sm";
}

export function AddBlockButton({
  icon: Icon,
  label,
  onClick,
  size = "default",
}: AddBlockButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-auto flex-col gap-2 rounded-none p-0 hover:bg-transparent"
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-gf-orange-bg text-gf-orange transition-colors group-hover/button:bg-gf-orange group-hover/button:text-white",
          size === "default" ? "h-16 w-16" : "h-11 w-11",
        )}
      >
        <Icon className={size === "default" ? "h-6 w-6" : "h-4 w-4"} />
      </span>
      <span className="text-xs font-semibold text-gf-gray2">{label}</span>
    </Button>
  );
}
