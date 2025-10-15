import { Metadata } from "next";
import { SupportNavigation } from "@/components/admin/support/support-navigation";

export const metadata: Metadata = {
  title: "Customer Support | Admin Dashboard",
  description: "Manage customer support tickets and live chat sessions",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-surface-background dark:bg-[var(--bg-primary)]">
      <div className="w-full max-w-none">
        {/* Header Section with Vectura Labs Theme */}
        <div className="mb-8 px-6 py-6 bg-surface-background dark:bg-[var(--bg-primary)] border-b border-ui-border dark:border-[var(--border-primary)]">
          <div className="max-w-none">
            <h1 className="text-3xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)] mb-2">
              Customer Support
            </h1>
            <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
              Manage tickets, chat with customers, and track support metrics
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-6 bg-surface-background dark:bg-[var(--bg-primary)]">
          <SupportNavigation />
        </div>

        {/* Content Section - Full Width Optimized */}
        <div className="mt-6 w-full bg-surface-background dark:bg-[var(--bg-primary)]">
          {children}
        </div>
      </div>
    </div>
  );
}
