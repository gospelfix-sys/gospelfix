import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[rgba(232,229,223,0.5)] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-[rgba(220,38,38,0.2)] md:text-sm dark:bg-[rgba(232,229,223,0.3)] dark:disabled:bg-[rgba(232,229,223,0.8)] dark:aria-invalid:border-[rgba(220,38,38,0.5)] dark:aria-invalid:ring-[rgba(220,38,38,0.4)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
