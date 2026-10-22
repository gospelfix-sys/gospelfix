"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CheckCircle, Info, TriangleAlert, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn(
        "toaster group",
        "[--normal-bg:var(--popover)] [--normal-text:var(--popover-foreground)] [--normal-border:var(--border)] [--border-radius:var(--radius)]",
      )}
      icons={{
        success: <CheckCircle className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <X className="size-4" />,
        loading: <RefreshCw className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
