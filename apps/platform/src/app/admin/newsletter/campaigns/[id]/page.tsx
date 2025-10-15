import { Metadata } from "next";
import { CampaignEditorClient } from "@/components/admin/newsletter/campaign-editor-client";

export const metadata: Metadata = {
  title: "Edit Campaign - Newsletter Management",
  description: "Edit newsletter campaign",
};

export default async function CampaignEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Campaign</h1>
      <CampaignEditorClient campaignId={id} />
    </div>
  );
}
