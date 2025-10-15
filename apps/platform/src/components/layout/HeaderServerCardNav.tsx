"use client";

import { CardNavHeader } from "../reactbits/CardNav/CardNavHeader";

interface NavLink {
  href: string;
  label: string;
}

interface HeaderServerCardNavProps {
  navLinks?: NavLink[];
  showAuthButtons?: boolean;
}

export function HeaderServerCardNav({
  navLinks,
  showAuthButtons = true,
}: HeaderServerCardNavProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] pointer-events-none">
      <div className="pointer-events-auto">
        <CardNavHeader
          navLinks={navLinks}
          showAuthButtons={showAuthButtons}
        />
      </div>
    </div>
  );
}
