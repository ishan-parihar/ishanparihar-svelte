/**
 * Check Environment Variables
 *
 * This script checks if all required environment variables are set.
 * It's useful for verifying your setup before deployment.
 *
 * Usage:
 * node scripts/check-env-vars.js
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load environment variables from .env.local if it exists
const envPath = resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  config({ path: envPath });
  console.log("Loaded environment variables from .env.local");
} else {
  console.log("No .env.local file found, using process environment variables");
}

// Define required environment variables
const requiredVars = [
  {
    name: "NEXTAUTH_SECRET",
    description: "Secret key for NextAuth.js session encryption",
  },
  { name: "NEXTAUTH_URL", description: "Full URL of your deployed site" },
  { name: "SUPABASE_URL", description: "URL of your Supabase project" },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Service role key for Supabase",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Public URL of your Supabase project",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Anonymous key for Supabase",
  },
];

// Define optional environment variables
const optionalVars = [
  { name: "GOOGLE_CLIENT_ID", description: "Google OAuth client ID" },
  { name: "GOOGLE_CLIENT_SECRET", description: "Google OAuth client secret" },
  {
    name: "RAZORPAY_KEY_ID",
    description: "RazorPay API Key ID for payment processing",
  },
  {
    name: "RAZORPAY_KEY_SECRET",
    description: "RazorPay API Key Secret for payment processing",
  },
  {
    name: "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    description: "Public RazorPay Key ID for client-side integration",
  },
  {
    name: "RAZORPAY_WEBHOOK_SECRET",
    description: "RazorPay webhook secret for signature verification",
  },
];

console.log("=".repeat(80));
console.log("ENVIRONMENT VARIABLES CHECK");
console.log("=".repeat(80));

// Check required variables
let missingRequired = false;
console.log("\nRequired Environment Variables:");
console.log("-".repeat(40));

for (const variable of requiredVars) {
  const value = process.env[variable.name];
  const status = value ? "✅ Set" : "❌ MISSING";
  console.log(`${variable.name}: ${status}`);
  console.log(`  Description: ${variable.description}`);

  if (!value) {
    missingRequired = true;
  }
}

// Check optional variables
console.log("\nOptional Environment Variables:");
console.log("-".repeat(40));

for (const variable of optionalVars) {
  const value = process.env[variable.name];
  const status = value ? "✅ Set" : "⚠️ Not set";
  console.log(`${variable.name}: ${status}`);
  console.log(`  Description: ${variable.description}`);
}

// Summary
console.log("\n=".repeat(80));
if (missingRequired) {
  console.log("❌ MISSING REQUIRED ENVIRONMENT VARIABLES");
  console.log(
    "Please set all required environment variables before deployment.",
  );
  console.log("See VERCEL_DEPLOYMENT_GUIDE.md for more information.");
  process.exit(1);
} else {
  console.log("✅ All required environment variables are set.");
  console.log("Your environment is properly configured for deployment.");
}
console.log("=".repeat(80));
