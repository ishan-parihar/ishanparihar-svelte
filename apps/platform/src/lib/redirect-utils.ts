/**
 * Utility functions for handling redirects in authentication flows
 */

/**
 * Processes the redirect parameter from the URL
 * Handles special cases like 'back' to return to the previous page
 *
 * @param redirectParam The redirect parameter from the URL
 * @returns The processed redirect URL
 */
export function processRedirectParam(redirectParam: string | null): string {
  // If no redirect parameter is provided, default to account page
  if (!redirectParam) {
    return "/account";
  }

  // Handle special 'back' redirect parameter
  if (redirectParam === "back") {
    // Get the referrer URL if available
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    // If referrer exists and is from the same origin, extract the path
    if (referrer && referrer.startsWith(window.location.origin)) {
      return new URL(referrer).pathname + new URL(referrer).search;
    }

    // If no valid referrer, default to home page
    return "/";
  }

  // Return the redirect parameter as is
  return redirectParam;
}

/**
 * Gets the current URL path for use in redirect parameters
 *
 * @returns The current URL path
 */
export function getCurrentUrlPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname + window.location.search;
}
