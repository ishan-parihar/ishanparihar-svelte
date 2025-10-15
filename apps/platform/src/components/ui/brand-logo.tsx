"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "signature";
}

const sizeClasses = {
  sm: "text-lg md:text-xl",
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
  xl: "text-3xl md:text-4xl",
};

export function BrandLogo({
  className,
  href = "/",
  size = "md",
  variant = "default",
}: BrandLogoProps) {
  const logoText = "Ishan Parihar";

  const logoClasses = cn(
    "font-logo transition-all duration-300 text-foreground",
    sizeClasses[size],
    variant === "signature" && "text-primary",
    "hover:text-primary",
    className,
  );

  if (href) {
    return (
      <Link href={href} className="inline-block group">
        <span className={logoClasses}>{logoText}</span>
      </Link>
    );
  }

  return <span className={logoClasses}>{logoText}</span>;
}

// Specific logo variants for different use cases
export function HeaderLogo({ className }: { className?: string }) {
  return <BrandLogo size="md" className={className} href="/" />;
}

export function FooterLogo({ className }: { className?: string }) {
  return <BrandLogo size="lg" className={className} href="/" />;
}

export function SignatureLogo({
  className,
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <BrandLogo size={size} variant="signature" className={className} href="/" />
  );
}
