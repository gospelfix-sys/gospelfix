import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-[rgba(220,38,38,0.2)] dark:aria-invalid:border-[rgba(220,38,38,0.5)] dark:aria-invalid:ring-[rgba(220,38,38,0.4)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-[rgba(255,85,0,0.8)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-[rgba(232,229,223,0.3)] dark:hover:bg-[rgba(232,229,223,0.5)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[rgba(255,255,255,0.8)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-[rgba(240,238,232,0.5)]",
        destructive:
          "bg-[rgba(220,38,38,0.1)] text-destructive hover:bg-[rgba(220,38,38,0.2)] focus-visible:border-[rgba(220,38,38,0.4)] focus-visible:ring-[rgba(220,38,38,0.2)] dark:bg-[rgba(220,38,38,0.2)] dark:hover:bg-[rgba(220,38,38,0.3)] dark:focus-visible:ring-[rgba(220,38,38,0.4)]",
        link: "text-primary underline-offset-4 hover:underline",
        // 사진 위에 얹는 흰 원형 버튼. --gf-white는 다크 모드에서 어두워지므로 색을 고정한다.
        floating:
          "border-white bg-white text-black shadow-md hover:border-gf-orange hover:bg-white hover:text-gf-orange dark:hover:bg-white",
        // 카드·블록 모서리에 얹는 작은 원형 아이콘 버튼(삭제·이동·핸들).
        round: "border-border bg-gf-white text-foreground hover:bg-muted",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-sm px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-sm",
        "icon-lg": "size-9",
      },
    },
    // size의 rounded-*가 variant보다 뒤에 적용되므로 원형은 여기서 한 번 더 보장한다.
    compoundVariants: [{ variant: ["floating", "round"], class: "rounded-full" }],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLElement,
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
