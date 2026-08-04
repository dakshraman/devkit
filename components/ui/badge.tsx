import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/12 text-primary",
        secondary: "border-border bg-accent text-accent-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/12 text-amber-600 dark:text-amber-400",
        danger: "border-transparent bg-red-500/12 text-red-600 dark:text-red-400",
        info: "border-transparent bg-sky-500/12 text-sky-600 dark:text-sky-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}