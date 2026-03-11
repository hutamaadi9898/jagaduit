import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.25rem] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-4 py-3 text-primary-foreground shadow-[0_12px_28px_rgba(236,102,65,0.25)] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(236,102,65,0.3)]",
        secondary: "bg-secondary px-4 py-3 text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border bg-white/80 px-4 py-3 text-foreground hover:border-primary/40 hover:bg-white",
        ghost: "px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive px-4 py-3 text-destructive-foreground hover:bg-destructive/90"
      },
      size: {
        default: "h-12",
        sm: "h-10 rounded-2xl px-3 text-xs",
        lg: "h-14 rounded-[1.5rem] px-6 text-base",
        icon: "h-11 w-11 rounded-2xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
