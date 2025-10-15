import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Grid } from "lucide-react";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";

export const metadata: Metadata = {
  title: "Image Management | Admin Dashboard",
  description: "Manage images for the website",
};

export default function AdminImageManagerPage() {
  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_IMAGES}
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_IMAGES permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Image Management</h1>
          <p className="text-muted-foreground">
            Upload and manage images for use throughout the website.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Manage Images Card */}
          <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Manage Images</CardTitle>
              <CardDescription>Upload and manage images</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload new images to the website, view all uploaded images, and
                delete images that are no longer needed.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
              >
                <Link href="/admin/image-manager/images">
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- Lucide icon doesn't need alt text */}
                  <Image className="mr-2 h-4 w-4" aria-hidden="true" />
                  Manage Images
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 p-6 border border-neutral-200 dark:border-neutral-800 rounded-none bg-neutral-50 dark:bg-neutral-900">
          <h2 className="text-xl font-bold mb-4">How Image Management Works</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Upload Images</h3>
              <p className="text-sm text-muted-foreground">
                Upload images to the website using the Manage Images page. All
                images are automatically converted to WebP format for optimal
                performance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                2. Use in Components
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the uploaded images directly in your website components by
                referencing their URLs from the image gallery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PermissionProtected>
  );
}
