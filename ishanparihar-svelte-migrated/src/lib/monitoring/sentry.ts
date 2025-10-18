import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_ENV } from '$lib/env';

if (PUBLIC_ENV.SENTRY_DSN) {
  Sentry.init({
    dsn: PUBLIC_ENV.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ]
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (PUBLIC_ENV.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error, context);
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (PUBLIC_ENV.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

// Export the Sentry instance for direct use
export { Sentry };