import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#000000",
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: "#666666",
    textAlign: "right",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#000000",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    borderBottom: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#666666",
    fontWeight: "bold",
  },
  value: {
    fontSize: 10,
    color: "#000000",
  },
  itemsTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderBottom: 1,
    borderBottomColor: "#CCCCCC",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: 1,
    borderBottomColor: "#EEEEEE",
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: 2,
    borderTopColor: "#000000",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: "#CCCCCC",
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
  },
});

interface ReceiptTemplateProps {
  order: {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
    currency: string;
    status: string;
    customer_name?: string;
    customer_email: string;
    service?: {
      title: string;
      service_type: string;
      description?: string;
    };
    pricing_tier?: {
      tier_name: string;
      price: number;
      features?: string[];
    };
    payments?: Array<{
      amount: number;
      payment_method: string;
      razorpay_payment_id?: string;
      created_at: string;
    }>;
  };
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ order }) => {
  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Ishan Parihar</Text>
            <Text style={styles.companyDetails}>
              Professional Services{"\n"}
              Email: contact@ishanparihar.com{"\n"}
              Website: www.ishanparihar.com
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>RECEIPT</Text>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt Number:</Text>
            <Text style={styles.value}>{order.order_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{order.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{order.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.customer_name || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.customer_email}</Text>
          </View>
        </View>

        {/* Service Details */}
        {order.service && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Service:</Text>
              <Text style={styles.value}>{order.service.title}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{order.service.service_type}</Text>
            </View>
            {order.pricing_tier && (
              <View style={styles.row}>
                <Text style={styles.label}>Pricing Tier:</Text>
                <Text style={styles.value}>{order.pricing_tier.tier_name}</Text>
              </View>
            )}
          </View>
        )}

        {/* Itemized Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itemized Breakdown</Text>
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Description</Text>
              <Text style={styles.tableCellHeader}>Quantity</Text>
              <Text style={styles.tableCellHeader}>Unit Price</Text>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {order.service?.title || "Service"} -{" "}
                {order.pricing_tier?.tier_name || "Standard"}
              </Text>
              <Text style={styles.tableCell}>1</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(
                  order.pricing_tier?.price || order.total_amount,
                  order.currency,
                )}
              </Text>
              <Text style={styles.tableCell}>
                {formatCurrency(
                  order.pricing_tier?.price || order.total_amount,
                  order.currency,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        {order.payments && order.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            {order.payments.map((payment, index) => (
              <View key={index}>
                <View style={styles.row}>
                  <Text style={styles.label}>Payment Method:</Text>
                  <Text style={styles.value}>{payment.payment_method}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Amount Paid:</Text>
                  <Text style={styles.value}>
                    {formatCurrency(payment.amount, order.currency)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Payment Date:</Text>
                  <Text style={styles.value}>
                    {formatDate(payment.created_at)}
                  </Text>
                </View>
                {payment.razorpay_payment_id && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Transaction ID:</Text>
                    <Text style={styles.value}>
                      {payment.razorpay_payment_id}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.total_amount, order.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>₹0.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(order.total_amount, order.currency)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for your business! This receipt was generated on{" "}
            {formatDate(new Date().toISOString())}.{"\n"}For any questions
            regarding this receipt, please contact us at
            contact@ishanparihar.com.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
