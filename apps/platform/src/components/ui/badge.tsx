import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90",
        secondary:
          "border-transparent bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700",
        destructive:
          "border-transparent bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90",
        outline: "border-black text-black dark:border-white dark:text-white",
        // Status badge variants (monotone)
        active:
          "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black",
        inactive:
          "border-neutral-300 bg-transparent text-neutral-700 dark:border-neutral-700 dark:text-neutral-300",
        pending:
          "border-neutral-400 bg-transparent text-neutral-800 dark:border-neutral-600 dark:text-neutral-200",
        success:
          "border-black bg-white text-black dark:border-white dark:bg-black dark:text-white",
        warning:
          "border-dashed border-black text-black dark:border-white dark:text-white",
        error:
          "border-2 border-black text-black dark:border-white dark:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
