"use client";

import { ServiceForm } from "@/components/admin/service-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewServicePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/services">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold ml-2">Create New Service</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        <ServiceForm />
      </div>
    </div>
  );
}
