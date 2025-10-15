import { UserSession } from "@/components/auth/UserSession";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | Ishan Parihar",
  description: "Admin dashboard for managing content",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full mx-auto py-6">
      <div className="mb-6 flex items-center justify-between px-4">
        <Link href="/admin">
          <h1 className="text-3xl font-bold hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer">
            Admin Dashboard
          </h1>
        </Link>
        <UserSession />
      </div>
      {children}
    </main>
  );
}
