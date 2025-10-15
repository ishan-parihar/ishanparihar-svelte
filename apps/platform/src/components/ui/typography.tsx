import React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function DisplayHeading({ children, className }: TypographyProps) {
  return (
    <h1 className={cn("text-4xl md:text-5xl font-heading", className)}>
      {children}
    </h1>
  );
}

export function LargeHeading({ children, className }: TypographyProps) {
  return <h2 className={cn("text-3xl font-heading", className)}>{children}</h2>;
}

export function MediumHeading({ children, className }: TypographyProps) {
  return <h3 className={cn("text-2xl font-heading", className)}>{children}</h3>;
}

export function SmallHeading({ children, className }: TypographyProps) {
  return (
    <h4 className={cn("text-xl font-ui font-semibold", className)}>
      {children}
    </h4>
  );
}

export function Paragraph({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-base font-ui leading-relaxed mb-4", className)}>
      {children}
    </p>
  );
}

export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xl font-ui leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function Blockquote({ children, className }: TypographyProps) {
  return (
    <blockquote
      className={cn(
        "border-l-4 border-primary pl-4 italic font-ui text-foreground",
        className,
      )}
    >
      {children}
    </blockquote>
  );
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code
      className={cn(
        "bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono",
        className,
      )}
    >
      {children}
    </code>
  );
}

export function MonoText({ children, className }: TypographyProps) {
  return (
    <span className={cn("font-mono text-sm tracking-wide", className)}>
      {children}
    </span>
  );
}
