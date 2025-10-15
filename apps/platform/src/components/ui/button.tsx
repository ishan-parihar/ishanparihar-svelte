"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-none bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 transition-all duration-200 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90",
        destructive:
          "rounded-none bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 dark:bg-red-700 dark:border-red-700 dark:hover:bg-red-800 dark:hover:border-red-800",
        outline:
          "rounded-none border border-neutral-800 bg-transparent text-neutral-800 hover:bg-neutral-100 dark:border-white dark:text-white dark:hover:bg-white/10",
        secondary:
          "rounded-none bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700",
        ghost:
          "rounded-none text-neutral-800 hover:bg-neutral-100 dark:text-white dark:hover:bg-white/10",
        link: "rounded-none text-neutral-800 underline-offset-4 hover:underline dark:text-white",
        cosmic:
          "rounded-none bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 transition-all duration-200 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-none",
        sm: "h-8 px-3 text-xs rounded-none",
        lg: "h-10 px-8 rounded-none",
        icon: "h-9 w-9 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Remove any rounded-* classes from className
    const cleanedClassName = className?.replace(/rounded-\w+/g, "") || "";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className: cleanedClassName }),
          "rounded-none",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
