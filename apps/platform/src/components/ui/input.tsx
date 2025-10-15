import * as React from "react";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  // Client-side only rendering for elements with dynamic styles
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create a version of props without style if not mounted yet
  const safeProps =
    !isMounted && props.style ? { ...props, style: undefined } : props;

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-none border border-neutral-300 bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-neutral-500 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-700 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 dark:focus-visible:ring-primary dark:focus-visible:border-primary",
        className,
      )}
      ref={ref}
      aria-invalid={props["aria-invalid"]}
      {...safeProps}
    />
  );
});
Input.displayName = "Input";

export { Input };
