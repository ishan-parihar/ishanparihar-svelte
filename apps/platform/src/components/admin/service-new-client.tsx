"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ServiceForm } from "@/components/admin/service-form";

export function ServiceNewClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Service</h1>
          <p className="text-muted-foreground mt-2">
            Add a new service or product to your offerings
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/services">← Back to Services</Link>
        </Button>
      </div>

      {/* Service Form */}
      <ServiceForm />
    </div>
  );
}
