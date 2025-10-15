import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// Register custom fonts
try {
  // Use absolute URL for font loading in PDF generation
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://www.ishanparihar.com"
      : "http://localhost:3000";

  Font.register({
    family: "Agraham",
    src: `${baseUrl}/fonts/agraham/Agraham.otf`,
  });
  console.log("Agraham font registered successfully");
} catch (error) {
  console.warn(
    "Failed to register Agraham font, falling back to default fonts:",
    error,
  );
}

// Brand colors from the website theme
const brandColors = {
  primary: "#111111",
  secondary: "#666666",
  tertiary: "#999999",
  accent: "#0066CC",
  background: "#FFFFFF",
  border: "#E5E5E5",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

// Enhanced styles with theme-based styling
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: brandColors.background,
    padding: 25,
    fontSize: 9,
    lineHeight: 1.3,
  },

  // Header section with brand identity
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: brandColors.accent,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandSection: {
    flex: 1,
  },
  logoSection: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: brandColors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 1.0,
    // fontFamily: 'Agraham', // Temporarily disabled until font loading is fixed
  },
  brandTagline: {
    fontSize: 11,
    color: brandColors.secondary,
    marginBottom: 12,
    lineHeight: 1.3,
  },
  contactInfo: {
    fontSize: 9,
    color: brandColors.tertiary,
    lineHeight: 1.3,
  },
  receiptMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: brandColors.accent,
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 1,
  },

  // Section styling
  section: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: brandColors.accent,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    color: brandColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Data row styling
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 2,
  },
  dataLabel: {
    fontSize: 10,
    color: brandColors.secondary,
    flex: 1,
  },
  dataValue: {
    fontSize: 10,
    color: brandColors.primary,
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
  },

  // Payment summary styling
  summarySection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: brandColors.secondary,
  },
  summaryValue: {
    fontSize: 11,
    color: brandColors.primary,
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: brandColors.accent,
  },
  totalLabel: {
    fontSize: 14,
    color: brandColors.primary,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    color: brandColors.accent,
    fontWeight: "bold",
  },

  // Two column layout for compact design
  twoColumnSection: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 10,
  },

  leftColumn: {
    flex: 1,
    padding: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: brandColors.accent,
  },

  rightColumn: {
    flex: 1,
    padding: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: brandColors.accent,
  },

  compactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  compactLabel: {
    fontSize: 8,
    color: brandColors.secondary,
    fontWeight: "bold",
    flex: 1,
  },

  compactValue: {
    fontSize: 8,
    color: brandColors.primary,
    textAlign: "right",
    flex: 1,
  },

  // Footer styling
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: brandColors.border,
    textAlign: "center",
  },
  footerBrand: {
    fontSize: 10,
    color: brandColors.accent,
    fontWeight: "bold",
    marginBottom: 8,
  },
  footerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: brandColors.border,
  },
});

export async function generateSimpleReceiptPDF(order: any): Promise<Buffer> {
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
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  console.log("Creating simple receipt document...");

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
          { style: styles.headerTop },
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
              "Email: ishan.parihar.official@gmail.com\nWebsite: www.ishanparihar.com\nPhone: +91-9205112559",
            ),
          ),
          React.createElement(
            View,
            { style: styles.logoSection },
            React.createElement(
              View,
              {
                style: {
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              React.createElement(Image, {
                style: {
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                },
                src: `${
                  process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : process.env.NODE_ENV === "production"
                      ? "https://www.ishanparihar.com"
                      : "http://localhost:3000"
                }/Logo.jpg`,
              }),
            ),
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
                color: brandColors.primary,
                fontWeight: "bold",
              },
            },
            formatDate(new Date().toISOString()),
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

      // Combined Order & Customer Information Section
      React.createElement(
        View,
        { style: styles.twoColumnSection },
        // Left Column - Order Information
        React.createElement(
          View,
          { style: styles.leftColumn },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "ORDER INFORMATION",
          ),
          React.createElement(
            View,
            { style: styles.compactRow },
            React.createElement(
              Text,
              { style: styles.compactLabel },
              "Receipt #:",
            ),
            React.createElement(
              Text,
              { style: styles.compactValue },
              order.order_number || "N/A",
            ),
          ),
          React.createElement(
            View,
            { style: styles.compactRow },
            React.createElement(
              Text,
              { style: styles.compactLabel },
              "Order ID:",
            ),
            React.createElement(
              Text,
              { style: styles.compactValue },
              order.id ? order.id.substring(0, 8) + "..." : "N/A",
            ),
          ),
          React.createElement(
            View,
            { style: styles.compactRow },
            React.createElement(Text, { style: styles.compactLabel }, "Date:"),
            React.createElement(
              Text,
              { style: styles.compactValue },
              formatDate(order.created_at),
            ),
          ),
          React.createElement(
            View,
            { style: styles.compactRow },
            React.createElement(
              Text,
              { style: styles.compactLabel },
              "Status:",
            ),
            React.createElement(
              Text,
              {
                style: {
                  ...styles.compactValue,
                  color:
                    order.status === "paid" || order.status === "completed"
                      ? brandColors.success
                      : brandColors.secondary,
                  fontWeight: "bold",
                },
              },
              order.status ? order.status.toUpperCase() : "UNKNOWN",
            ),
          ),
        ),
        // Right Column - Customer Information
        React.createElement(
          View,
          { style: styles.rightColumn },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "CUSTOMER INFORMATION",
          ),
          React.createElement(
            View,
            { style: styles.compactRow },
            React.createElement(Text, { style: styles.compactLabel }, "Name:"),
            React.createElement(
              Text,
              { style: styles.compactValue },
              order.customer_name || "Not Provided",
            ),
          ),
          React.createElement(
            View,
            { style: styles.compactRow },
            React.createElement(Text, { style: styles.compactLabel }, "Email:"),
            React.createElement(
              Text,
              { style: styles.compactValue },
              order.customer_email || "N/A",
            ),
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
                  marginTop: 8,
                  padding: 10,
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
                    fontWeight: "bold",
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
                order.service.description.length > 400
                  ? order.service.description.substring(0, 400) + "..."
                  : order.service.description,
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
              marginBottom: 8,
              color: brandColors.accent,
            },
          },
          "PAYMENT SUMMARY",
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
                    { style: { ...styles.dataValue, fontSize: 8 } },
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
          { style: { ...styles.footerBrand, marginBottom: 4 } },
          "Thank you for choosing our professional services!",
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: 8,
              color: brandColors.tertiary,
              marginBottom: 6,
            },
          },
          "For support: ishan.parihar.official@gmail.com",
        ),
        React.createElement(
          View,
          { style: styles.footerMeta },
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
    console.log("Rendering simple PDF...");
    const pdfBuffer = await renderToBuffer(receiptDocument);
    console.log(
      "Simple PDF rendered successfully, buffer size:",
      pdfBuffer.length,
    );
    return pdfBuffer;
  } catch (error) {
    console.error("Simple PDF rendering error:", error);
    throw new Error(
      `Failed to render simple PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
