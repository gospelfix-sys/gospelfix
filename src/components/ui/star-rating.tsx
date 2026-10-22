"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  size?: number;
  showHalf?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({
  value,
  size = 16,
  showHalf = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const displayValue = interactive && hovered > 0 ? hovered : value;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const starClassName = showHalf
          ? displayValue >= star
            ? "fill-gf-orange text-gf-orange"
            : displayValue >= star - 0.5
              ? "fill-gf-orange/40 text-gf-orange"
              : "fill-gf-border text-gf-border"
          : displayValue >= star
            ? "fill-gf-orange text-gf-orange"
            : "fill-gf-border text-gf-border";

        if (!interactive) {
          return <Star key={star} width={size} height={size} className={starClassName} />;
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star width={size} height={size} className={starClassName} />
          </button>
        );
      })}
    </div>
  );
}
