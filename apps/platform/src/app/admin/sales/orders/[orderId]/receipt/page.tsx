import { api } from "@/trpc/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

interface ReceiptPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { orderId } = await params;
  const order = await api.payments.getOrderDetails({ orderId });

  if (!order) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Receipt</h1>
          <p className="text-muted-foreground">
            Order #{order.order_number} &middot; {order.customer_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/sales/orders/${order.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Order
            </Button>
          </Link>
          {order.receipt_url && (
            <a
              href={order.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {order.receipt_url ? (
        <div className="border rounded-lg overflow-hidden">
          <object
            data={order.receipt_url}
            type="application/pdf"
            width="100%"
            height="800px"
            className="w-full"
          >
            <div className="p-8 text-center">
              <p className="mb-4">
                Your browser does not support embedded PDFs.
              </p>
              <a
                href={order.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open PDF in New Tab
                </Button>
              </a>
            </div>
          </object>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Receipt Not Generated</h2>
          <p className="text-muted-foreground">
            This receipt has not been generated yet. Please go back to the order
            details page and click "Generate Receipt".
          </p>
        </div>
      )}
    </div>
  );
}
