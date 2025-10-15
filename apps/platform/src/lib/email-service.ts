/**
 * Email Service for Support Notifications
 * This is a basic implementation that can be extended with actual email providers
 * like SendGrid, AWS SES, Nodemailer, etc.
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  name?: string;
  subject: string;
  message: string;
  type:
    | "ticket_created"
    | "ticket_updated"
    | "chat_started"
    | "chat_message"
    | "general";
  metadata?: Record<string, any>;
}

/**
 * Generate email templates based on notification type
 */
function generateEmailTemplate(data: EmailData): EmailTemplate {
  const { name = "User", subject, message, type, metadata } = data;

  let emailSubject = subject;
  let emailHtml = "";
  let emailText = message;

  switch (type) {
    case "ticket_created":
      emailSubject = `New Support Ticket: ${metadata?.ticketNumber || "N/A"}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Support Ticket Created</h2>
          <p>Hello ${name},</p>
          <p>A new support ticket has been created:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Ticket #:</strong> ${metadata?.ticketNumber || "N/A"}<br>
            <strong>Subject:</strong> ${metadata?.ticketSubject || "N/A"}<br>
            <strong>Priority:</strong> ${metadata?.priority || "N/A"}<br>
            <strong>Customer:</strong> ${metadata?.customerEmail || "N/A"}
          </div>
          <p>${message}</p>
          <p>Please log in to the admin dashboard to view and respond to this ticket.</p>
          <p>Best regards,<br>Support Team</p>
        </div>
      `;
      emailText = `New Support Ticket Created\n\nHello ${name},\n\nA new support ticket has been created:\n\nTicket #: ${metadata?.ticketNumber || "N/A"}\nSubject: ${metadata?.ticketSubject || "N/A"}\nPriority: ${metadata?.priority || "N/A"}\nCustomer: ${metadata?.customerEmail || "N/A"}\n\n${message}\n\nPlease log in to the admin dashboard to view and respond to this ticket.\n\nBest regards,\nSupport Team`;
      break;

    case "chat_started":
      emailSubject = `New Chat Session Started`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Chat Session Started</h2>
          <p>Hello ${name},</p>
          <p>A new chat session has been started:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Customer:</strong> ${metadata?.customerName || metadata?.customerEmail || "N/A"}<br>
            <strong>Session ID:</strong> ${metadata?.sessionId || "N/A"}<br>
            <strong>Started:</strong> ${metadata?.startedAt || "Just now"}
          </div>
          <p>${message}</p>
          <p>Please log in to the admin dashboard to join this chat session.</p>
          <p>Best regards,<br>Support Team</p>
        </div>
      `;
      emailText = `New Chat Session Started\n\nHello ${name},\n\nA new chat session has been started:\n\nCustomer: ${metadata?.customerName || metadata?.customerEmail || "N/A"}\nSession ID: ${metadata?.sessionId || "N/A"}\nStarted: ${metadata?.startedAt || "Just now"}\n\n${message}\n\nPlease log in to the admin dashboard to join this chat session.\n\nBest regards,\nSupport Team`;
      break;

    default:
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <p>Hello ${name},</p>
          <p>${message}</p>
          <p>Best regards,<br>Support Team</p>
        </div>
      `;
      emailText = `${subject}\n\nHello ${name},\n\n${message}\n\nBest regards,\nSupport Team`;
  }

  return {
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
  };
}

/**
 * Send email notification
 * This is a placeholder implementation - replace with actual email service
 */
export async function sendEmailNotification(data: EmailData): Promise<boolean> {
  try {
    const template = generateEmailTemplate(data);

    // TODO: Replace this with actual email service implementation
    // Examples:
    // - SendGrid: await sgMail.send({ to: data.to, ...template })
    // - AWS SES: await ses.sendEmail({ Destination: { ToAddresses: [data.to] }, ...template })
    // - Nodemailer: await transporter.sendMail({ to: data.to, ...template })

    console.log("📧 Email Notification (Development Mode):");
    console.log("To:", data.to);
    console.log("Subject:", template.subject);
    console.log("Message:", template.text);
    console.log("---");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In development, always return true
    // In production, return the actual result from your email service
    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    return false;
  }
}

/**
 * Send support ticket notification email
 */
export async function sendTicketNotification(
  adminEmail: string,
  adminName: string,
  ticketData: {
    ticketNumber: string;
    subject: string;
    priority: string;
    customerEmail: string;
    description: string;
  },
): Promise<boolean> {
  return sendEmailNotification({
    to: adminEmail,
    name: adminName,
    subject: `New Support Ticket: ${ticketData.ticketNumber}`,
    message: `A new support ticket has been created and requires your attention.`,
    type: "ticket_created",
    metadata: {
      ticketNumber: ticketData.ticketNumber,
      ticketSubject: ticketData.subject,
      priority: ticketData.priority,
      customerEmail: ticketData.customerEmail,
    },
  });
}

/**
 * Send chat session notification email
 */
export async function sendChatNotification(
  adminEmail: string,
  adminName: string,
  chatData: {
    sessionId: string;
    customerName?: string;
    customerEmail: string;
    startedAt: string;
  },
): Promise<boolean> {
  return sendEmailNotification({
    to: adminEmail,
    name: adminName,
    subject: "New Chat Session Started",
    message: `A customer has started a new chat session and is waiting for assistance.`,
    type: "chat_started",
    metadata: {
      sessionId: chatData.sessionId,
      customerName: chatData.customerName,
      customerEmail: chatData.customerEmail,
      startedAt: chatData.startedAt,
    },
  });
}

/**
 * Configuration for email service
 * Add your email service configuration here
 */
export const emailConfig = {
  // Example for SendGrid
  // apiKey: process.env.SENDGRID_API_KEY,
  // fromEmail: process.env.FROM_EMAIL || 'support@yoursite.com',
  // fromName: process.env.FROM_NAME || 'Support Team',

  // Example for AWS SES
  // region: process.env.AWS_REGION || 'us-east-1',
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  // Development settings
  enabled: process.env.NODE_ENV === "production",
  logEmails: process.env.NODE_ENV === "development",
};
