"use client";

import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ReceiptActionsProps {
  orderId: string;
  receiptUrl?: string;
}

export function ReceiptActions({ orderId, receiptUrl }: ReceiptActionsProps) {
  const handleDownload = () => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Link href={`/admin/sales/orders/${orderId}`}>
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
      </Link>

      {receiptUrl && (
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      )}
    </div>
  );
}

export function ReceiptDownloadButton({ receiptUrl }: { receiptUrl: string }) {
  const handleDownload = () => {
    window.open(receiptUrl, "_blank");
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      Open in New Tab / Download
    </Button>
  );
}
