import { NotFoundClient } from "@/components/not-found-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Ishan Parihar",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NotFoundClient />
    </div>
  );
}
