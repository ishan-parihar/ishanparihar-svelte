import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// Register custom fonts for branding
try {
  Font.register({
    family: "Inter",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2",
        fontWeight: 700,
      },
    ],
  });
} catch (error) {
  console.warn(
    "Failed to register Inter font, falling back to default fonts:",
    error,
  );
}

// Brand colors from the website
const brandColors = {
  primary: "#111111",
  accent: "#0FA4AF",
  accentHover: "#0D8A94",
  secondary: "#6B6B6B",
  tertiary: "#8A8A8A",
  background: "#FFFFFF",
  surface: "#F8F8F0",
  border: "#D8D8CE",
  borderLight: "#E0E0D6",
};

// Professional PDF styles with brand identity
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: brandColors.background,
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Header section with brand identity
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: 3,
    borderBottomColor: brandColors.accent,
  },
  brandSection: {
    flexDirection: "column",
    flex: 1,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 700,
    color: brandColors.primary,
    marginBottom: 8,
    fontFamily: "Inter",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: brandColors.secondary,
    marginBottom: 12,
    fontWeight: 500,
  },
  contactInfo: {
    fontSize: 9,
    color: brandColors.tertiary,
    lineHeight: 1.4,
  },
  receiptMeta: {
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  },

  // Receipt title
  receiptTitle: {
    fontSize: 36,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 32,
    color: brandColors.accent,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // Section styling with enhanced visual hierarchy
  section: {
    marginBottom: 28,
    backgroundColor: brandColors.surface,
    padding: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: brandColors.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 16,
    color: brandColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.border,
    paddingBottom: 8,
  },

  // Enhanced two-column grid for data
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dataLabel: {
    fontSize: 11,
    color: brandColors.secondary,
    fontWeight: 600,
    flex: 1.2,
    textTransform: "capitalize",
  },
  dataValue: {
    fontSize: 11,
    color: brandColors.primary,
    fontWeight: 500,
    flex: 1.8,
    textAlign: "right",
  },

  // Service details table
  serviceTable: {
    marginTop: 12,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: brandColors.accent,
    padding: 12,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 600,
    color: brandColors.background,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: brandColors.background,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.borderLight,
  },
  tableCell: {
    fontSize: 10,
    color: brandColors.primary,
    flex: 1,
    textAlign: "center",
  },

  // Payment summary section
  summarySection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: brandColors.background,
    borderWidth: 2,
    borderColor: brandColors.accent,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: brandColors.secondary,
    fontWeight: 400,
  },
  summaryValue: {
    fontSize: 11,
    color: brandColors.primary,
    fontWeight: 600,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: brandColors.accent,
  },
  totalLabel: {
    fontSize: 14,
    color: brandColors.primary,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 16,
    color: brandColors.accent,
    fontWeight: 700,
  },

  // Footer
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: brandColors.border,
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: brandColors.tertiary,
    lineHeight: 1.4,
  },
  footerBrand: {
    fontSize: 10,
    color: brandColors.accent,
    fontWeight: 600,
    marginTop: 8,
  },
});

export async function generateReceiptPDF(order: any): Promise<Buffer> {
  // Validate required order data
  if (!order || !order.id) {
    throw new Error("Invalid order data: missing order ID");
  }

  const formatCurrency = (amount: number, currency: string = "INR") => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "N/A";
    }
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const receiptDocument = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Professional Header with Brand Identity
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          { style: styles.brandSection },
          React.createElement(
            Text,
            { style: styles.brandName },
            "Ishan Parihar",
          ),
          React.createElement(
            Text,
            { style: styles.brandTagline },
            "Professional Services & Consulting",
          ),
          React.createElement(
            Text,
            { style: styles.contactInfo },
            "Email: contact@ishanparihar.com\nWebsite: www.ishanparihar.com\nPhone: +91 (555) 123-4567",
          ),
        ),
        React.createElement(
          View,
          { style: styles.receiptMeta },
          React.createElement(
            Text,
            {
              style: {
                fontSize: 11,
                color: brandColors.secondary,
                marginBottom: 6,
                fontWeight: 600,
              },
            },
            "RECEIPT GENERATED",
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 11,
                color: brandColors.primary,
                fontWeight: 700,
                marginBottom: 8,
              },
            },
            formatDateTime(new Date().toISOString()),
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 9,
                color: brandColors.tertiary,
                fontWeight: 400,
              },
            },
            "Official Receipt Document",
          ),
        ),
      ),

      // Receipt Title
      React.createElement(Text, { style: styles.receiptTitle }, "RECEIPT"),
      // Order Information Section
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Order Information",
        ),
        React.createElement(
          View,
          { style: styles.dataRow },
          React.createElement(
            Text,
            { style: styles.dataLabel },
            "Receipt Number:",
          ),
          React.createElement(
            Text,
            { style: styles.dataValue },
            order.order_number || "N/A",
          ),
        ),
        React.createElement(
          View,
          { style: styles.dataRow },
          React.createElement(Text, { style: styles.dataLabel }, "Order ID:"),
          React.createElement(
            Text,
            { style: styles.dataValue },
            order.id ? order.id.substring(0, 8) + "..." : "N/A",
          ),
        ),
        React.createElement(
          View,
          { style: styles.dataRow },
          React.createElement(Text, { style: styles.dataLabel }, "Order Date:"),
          React.createElement(
            Text,
            { style: styles.dataValue },
            formatDate(order.created_at),
          ),
        ),
        React.createElement(
          View,
          { style: styles.dataRow },
          React.createElement(Text, { style: styles.dataLabel }, "Status:"),
          React.createElement(
            Text,
            {
              style: {
                ...styles.dataValue,
                color:
                  order.status === "paid" || order.status === "completed"
                    ? brandColors.accent
                    : brandColors.secondary,
                fontWeight: 600,
              },
            },
            order.status ? order.status.toUpperCase() : "UNKNOWN",
          ),
        ),
      ),
      // Customer Information Section
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Customer Information",
        ),
        React.createElement(
          View,
          { style: styles.dataRow },
          React.createElement(
            Text,
            { style: styles.dataLabel },
            "Customer Name:",
          ),
          React.createElement(
            Text,
            { style: styles.dataValue },
            order.customer_name || "Not Provided",
          ),
        ),
        React.createElement(
          View,
          { style: styles.dataRow },
          React.createElement(
            Text,
            { style: styles.dataLabel },
            "Email Address:",
          ),
          React.createElement(
            Text,
            { style: styles.dataValue },
            order.customer_email,
          ),
        ),
        order.customer?.id &&
          React.createElement(
            View,
            { style: styles.dataRow },
            React.createElement(
              Text,
              { style: styles.dataLabel },
              "Customer ID:",
            ),
            React.createElement(
              Text,
              { style: styles.dataValue },
              order.customer.id.substring(0, 8) + "...",
            ),
          ),
      ),
      // Service Details Section
      order.service &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Service Details",
          ),
          React.createElement(
            View,
            { style: styles.dataRow },
            React.createElement(
              Text,
              { style: styles.dataLabel },
              "Service Name:",
            ),
            React.createElement(
              Text,
              { style: styles.dataValue },
              order.service?.title || "N/A",
            ),
          ),
          React.createElement(
            View,
            { style: styles.dataRow },
            React.createElement(
              Text,
              { style: styles.dataLabel },
              "Service Type:",
            ),
            React.createElement(
              Text,
              { style: styles.dataValue },
              order.service?.service_type
                ? order.service.service_type.charAt(0).toUpperCase() +
                    order.service.service_type.slice(1)
                : "N/A",
            ),
          ),
          order.pricing_tier &&
            React.createElement(
              View,
              { style: styles.dataRow },
              React.createElement(
                Text,
                { style: styles.dataLabel },
                "Pricing Tier:",
              ),
              React.createElement(
                Text,
                { style: styles.dataValue },
                order.pricing_tier.tier_name,
              ),
            ),
          order.service.description &&
            React.createElement(
              View,
              {
                style: {
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: brandColors.background,
                  borderRadius: 4,
                },
              },
              React.createElement(
                Text,
                {
                  style: {
                    fontSize: 9,
                    color: brandColors.secondary,
                    marginBottom: 4,
                    fontWeight: 600,
                  },
                },
                "Description:",
              ),
              React.createElement(
                Text,
                {
                  style: {
                    fontSize: 9,
                    color: brandColors.primary,
                    lineHeight: 1.4,
                  },
                },
                order.service.description,
              ),
            ),
        ),

      // Itemized Service Table
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Service Breakdown",
        ),
        React.createElement(
          View,
          { style: styles.serviceTable },
          React.createElement(
            View,
            { style: styles.tableHeader },
            React.createElement(
              Text,
              {
                style: {
                  ...styles.tableHeaderCell,
                  flex: 2,
                  textAlign: "left",
                },
              },
              "Description",
            ),
            React.createElement(Text, { style: styles.tableHeaderCell }, "Qty"),
            React.createElement(
              Text,
              { style: styles.tableHeaderCell },
              "Unit Price",
            ),
            React.createElement(
              Text,
              { style: styles.tableHeaderCell },
              "Total",
            ),
          ),
          React.createElement(
            View,
            { style: styles.tableRow },
            React.createElement(
              Text,
              { style: { ...styles.tableCell, flex: 2, textAlign: "left" } },
              `${order.service?.title || "Service"}${order.pricing_tier ? ` - ${order.pricing_tier.tier_name}` : ""}`,
            ),
            React.createElement(Text, { style: styles.tableCell }, "1"),
            React.createElement(
              Text,
              { style: styles.tableCell },
              formatCurrency(
                order.pricing_tier?.price || order.total_amount || 0,
                order.currency || "INR",
              ),
            ),
            React.createElement(
              Text,
              { style: { ...styles.tableCell, fontWeight: 600 } },
              formatCurrency(
                order.pricing_tier?.price || order.total_amount || 0,
                order.currency || "INR",
              ),
            ),
          ),
        ),
      ),
      // Payment Summary Section
      React.createElement(
        View,
        { style: styles.summarySection },
        React.createElement(
          Text,
          {
            style: {
              ...styles.sectionTitle,
              marginBottom: 16,
              color: brandColors.accent,
            },
          },
          "Payment Summary",
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            "Subtotal:",
          ),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            formatCurrency(order.total_amount || 0, order.currency || "INR"),
          ),
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            "Taxes & Fees:",
          ),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            formatCurrency(0, order.currency || "INR"),
          ),
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            "Discount:",
          ),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            formatCurrency(0, order.currency || "INR"),
          ),
        ),
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(
            Text,
            { style: styles.totalLabel },
            "Total Amount:",
          ),
          React.createElement(
            Text,
            { style: styles.totalValue },
            formatCurrency(order.total_amount || 0, order.currency || "INR"),
          ),
        ),
      ),

      // Payment Information (if available)
      order.payments &&
        order.payments.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Payment Information",
          ),
          ...order.payments
            .map((payment: any, index: number) => [
              React.createElement(
                View,
                { style: styles.dataRow, key: `payment-method-${index}` },
                React.createElement(
                  Text,
                  { style: styles.dataLabel },
                  "Payment Method:",
                ),
                React.createElement(
                  Text,
                  { style: styles.dataValue },
                  payment.payment_method || "Online Payment",
                ),
              ),
              React.createElement(
                View,
                { style: styles.dataRow, key: `payment-amount-${index}` },
                React.createElement(
                  Text,
                  { style: styles.dataLabel },
                  "Amount Paid:",
                ),
                React.createElement(
                  Text,
                  { style: styles.dataValue },
                  formatCurrency(payment.amount || 0, order.currency || "INR"),
                ),
              ),
              React.createElement(
                View,
                { style: styles.dataRow, key: `payment-date-${index}` },
                React.createElement(
                  Text,
                  { style: styles.dataLabel },
                  "Payment Date:",
                ),
                React.createElement(
                  Text,
                  { style: styles.dataValue },
                  formatDate(payment.created_at),
                ),
              ),
              payment.razorpay_payment_id &&
                React.createElement(
                  View,
                  { style: styles.dataRow, key: `payment-id-${index}` },
                  React.createElement(
                    Text,
                    { style: styles.dataLabel },
                    "Transaction ID:",
                  ),
                  React.createElement(
                    Text,
                    { style: { ...styles.dataValue, fontFamily: "Courier" } },
                    payment.razorpay_payment_id,
                  ),
                ),
            ])
            .flat(),
        ),
      // Professional Footer with Enhanced Branding
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          `Thank you for choosing our professional services! This receipt was generated on ${formatDateTime(new Date().toISOString())} and serves as your official proof of purchase.\n\nFor any questions regarding this receipt or your order, please contact us:\nEmail: contact@ishanparihar.com | Website: www.ishanparihar.com | Phone: +91 (555) 123-4567\n\nThis is an official receipt for your records. Please retain this document for your files and future reference.`,
        ),
        React.createElement(
          View,
          {
            style: {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: brandColors.border,
            },
          },
          React.createElement(
            Text,
            { style: styles.footerBrand },
            "Ishan Parihar - Professional Services & Consulting",
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 8,
                color: brandColors.tertiary,
                fontWeight: 400,
              },
            },
            `Document ID: ${order.id ? order.id.substring(0, 8).toUpperCase() : "N/A"}`,
          ),
        ),
      ),
    ),
  );

  try {
    const pdfBuffer = await renderToBuffer(receiptDocument);
    return pdfBuffer;
  } catch (error) {
    console.error("PDF rendering error:", error);
    throw new Error(
      `Failed to render PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
