import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { AccountDetailPageClient } from "@/components/admin/accounts/account-detail-page-client";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";

interface AccountDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export async function generateMetadata({
  params,
}: AccountDetailPageProps): Promise<Metadata> {
  try {
    const { userId } = await params;
    const accountData = await api.admin.getAccountDetails({ userId });
    return {
      title: `${accountData.user.name || accountData.user.email} - Account Details`,
      description: `Account details for ${accountData.user.email}`,
    };
  } catch {
    return {
      title: "Account Details - Admin Dashboard",
      description: "View detailed account information",
    };
  }
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  try {
    const { userId } = await params;

    // Use await directly. The `api` object is designed to throw an error that can be caught.
    const accountDetails = await api.admin.getAccountDetails({ userId });

    // The check below is now redundant if the tRPC procedure throws, but it's good defensive coding.
    if (!accountDetails?.user) {
      notFound();
    }

    return (
      <PermissionProtected
        requiredPermission={PERMISSION_SCOPES.MANAGE_USERS}
        fallback={
          <div className="w-full mx-auto py-8 px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
            <p className="mb-4">
              You need the MANAGE_USERS permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Please contact an administrator to request access.
            </p>
          </div>
        }
      >
        <div className="w-full mx-auto py-8 px-4">
          <AccountDetailPageClient accountData={accountDetails} />
        </div>
      </PermissionProtected>
    );
  } catch (error) {
    // If the tRPC call threw a TRPCError with code 'NOT_FOUND', this catch block will execute.
    notFound();
  }
}
