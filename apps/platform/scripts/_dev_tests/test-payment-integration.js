/**
 * Payment Integration Test Script
 *
 * This script tests the RazorPay payment integration to ensure everything works correctly.
 * Run this script after setting up your environment variables and database.
 *
 * Usage:
 * node scripts/test-payment-integration.js
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = resolve(__dirname, "../.env.local");
config({ path: envPath });

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  testService: {
    serviceId: "test-service-id", // Replace with actual service ID
    customerEmail: "test@example.com",
    customerName: "Test Customer",
    customerPhone: "+919999999999",
  },
};

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Test environment variables
function testEnvironmentVariables() {
  info("Testing environment variables...");

  const requiredVars = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const optionalVars = ["RAZORPAY_WEBHOOK_SECRET", "WEBHOOK_RETRY_TOKEN"];

  let allRequired = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      success(`${varName} is set`);
    } else {
      error(`${varName} is missing`);
      allRequired = false;
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      success(`${varName} is set (optional)`);
    } else {
      warning(`${varName} is not set (optional)`);
    }
  }

  if (!allRequired) {
    error(
      "Some required environment variables are missing. Please check your .env.local file.",
    );
    process.exit(1);
  }

  success("All required environment variables are set");
}

// Test API endpoints
async function testApiEndpoints() {
  info("Testing API endpoints...");

  const endpoints = [
    "/api/payments/create-order",
    "/api/payments/verify",
    "/api/payments/webhook",
    "/api/services",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint}`, {
        method: "GET",
      });

      if (response.status === 404) {
        error(`Endpoint ${endpoint} not found (404)`);
      } else if (response.status >= 500) {
        error(`Endpoint ${endpoint} has server error (${response.status})`);
      } else {
        success(`Endpoint ${endpoint} is accessible (${response.status})`);
      }
    } catch (err) {
      error(`Failed to reach endpoint ${endpoint}: ${err.message}`);
    }
  }
}

// Test database connection
async function testDatabaseConnection() {
  info("Testing database connection...");

  try {
    // Test if we can connect to Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (response.ok) {
      success("Database connection successful");
    } else {
      error(`Database connection failed: ${response.status}`);
    }
  } catch (err) {
    error(`Database connection error: ${err.message}`);
  }
}

// Test payment order creation
async function testPaymentOrderCreation() {
  info("Testing payment order creation...");

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/api/payments/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: TEST_CONFIG.testService.serviceId,
          customerEmail: TEST_CONFIG.testService.customerEmail,
          customerName: TEST_CONFIG.testService.customerName,
          customerPhone: TEST_CONFIG.testService.customerPhone,
          notes: "Test order creation",
        }),
      },
    );

    const result = await response.json();

    if (response.ok && result.success) {
      success("Payment order creation test passed");
      info(`Order ID: ${result.order?.id}`);
      info(`RazorPay Order ID: ${result.order?.razorpayOrderId}`);
      return result.order;
    } else {
      error(
        `Payment order creation failed: ${result.error || "Unknown error"}`,
      );
      return null;
    }
  } catch (err) {
    error(`Payment order creation test error: ${err.message}`);
    return null;
  }
}

// Test webhook endpoint
async function testWebhookEndpoint() {
  info("Testing webhook endpoint...");

  const testPayload = {
    entity: "event",
    account_id: "acc_test123",
    event: "payment.captured",
    contains: ["payment"],
    payload: {
      payment: {
        entity: {
          id: "pay_test123",
          order_id: "order_test123",
          amount: 50000,
          currency: "INR",
          status: "captured",
          method: "card",
        },
      },
    },
    created_at: Math.floor(Date.now() / 1000),
  };

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/api/payments/webhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "test_signature", // This will fail signature verification
        },
        body: JSON.stringify(testPayload),
      },
    );

    // We expect this to fail due to invalid signature
    if (response.status === 401) {
      success("Webhook endpoint correctly rejects invalid signatures");
    } else {
      warning(
        `Webhook endpoint returned unexpected status: ${response.status}`,
      );
    }
  } catch (err) {
    error(`Webhook endpoint test error: ${err.message}`);
  }
}

// Test RazorPay SDK loading
async function testRazorPaySDK() {
  info("Testing RazorPay SDK availability...");

  try {
    const response = await fetch(
      "https://checkout.razorpay.com/v1/checkout.js",
    );

    if (response.ok) {
      success("RazorPay SDK is accessible");
    } else {
      error("RazorPay SDK is not accessible");
    }
  } catch (err) {
    error(`RazorPay SDK test error: ${err.message}`);
  }
}

// Main test function
async function runTests() {
  log("\n🧪 Starting Payment Integration Tests\n", colors.blue);

  try {
    // Test 1: Environment Variables
    testEnvironmentVariables();
    log("");

    // Test 2: Database Connection
    await testDatabaseConnection();
    log("");

    // Test 3: API Endpoints
    await testApiEndpoints();
    log("");

    // Test 4: RazorPay SDK
    await testRazorPaySDK();
    log("");

    // Test 5: Payment Order Creation
    const testOrder = await testPaymentOrderCreation();
    log("");

    // Test 6: Webhook Endpoint
    await testWebhookEndpoint();
    log("");

    success("🎉 Payment integration tests completed!");

    if (testOrder) {
      info("\n📋 Next Steps:");
      info("1. Test the payment flow manually in your browser");
      info("2. Set up RazorPay webhooks in the dashboard");
      info("3. Test with real payment methods in test mode");
      info("4. Verify email notifications are working");
      info("5. Test order fulfillment process");
    }
  } catch (err) {
    error(`Test execution failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the tests
runTests().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
