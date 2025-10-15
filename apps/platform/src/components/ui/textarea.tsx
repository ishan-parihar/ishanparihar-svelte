import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-none border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm placeholder:text-neutral-500 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-700 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 dark:focus-visible:ring-primary dark:focus-visible:border-primary",
        className,
      )}
      ref={ref}
      aria-invalid={props["aria-invalid"]}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
