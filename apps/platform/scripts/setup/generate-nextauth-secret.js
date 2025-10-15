/**
 * Generate NextAuth Secret
 *
 * This script generates a secure random string to use as the NEXTAUTH_SECRET
 * environment variable for NextAuth.js.
 *
 * Usage:
 * node scripts/generate-nextauth-secret.js
 */

import crypto from "crypto";

// Generate a secure random string (32 bytes = 64 hex characters)
const generateSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};

const secret = generateSecret();

console.log("=".repeat(80));
console.log("NEXTAUTH SECRET GENERATOR");
console.log("=".repeat(80));
console.log("\nGenerated NEXTAUTH_SECRET:");
console.log("\n" + secret + "\n");
console.log("Add this to your Vercel environment variables:");
console.log("NEXTAUTH_SECRET=" + secret);
console.log("\nMake sure to also set these required environment variables:");
console.log("- NEXTAUTH_URL (e.g., https://your-domain.vercel.app)");
console.log("- SUPABASE_URL");
console.log("- SUPABASE_SERVICE_ROLE_KEY");
console.log("- GOOGLE_CLIENT_ID (if using Google OAuth)");
console.log("- GOOGLE_CLIENT_SECRET (if using Google OAuth)");
console.log("=".repeat(80));
