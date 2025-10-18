import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Public environment variables
export const PUBLIC_ENV = {
  SUPABASE_URL: PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: PUBLIC_SUPABASE_ANON_KEY || '',
  
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  ANALYTICS_ID: process.env.ANALYTICS_ID || '',
  
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
};

// Private environment variables
export const PRIVATE_ENV = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  ANALYTICS_ID: process.env.ANALYTICS_ID || '',
  
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
};

// Validation
export function validateEnvironment() {
  const errors: string[] = [];
  
  if (!PUBLIC_ENV.SUPABASE_URL) errors.push('SUPABASE_URL is required');
  if (!PUBLIC_ENV.SUPABASE_ANON_KEY) errors.push('SUPABASE_ANON_KEY is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}