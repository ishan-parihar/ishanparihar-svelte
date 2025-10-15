import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ReactNode } from "react";
import { NextThemeProvider } from "@/providers/NextThemeProvider";

import ClientBody from "@/components/ClientBody";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { HeaderServerCardNav } from "@/components/layout/HeaderServerCardNav";
import AnimatedFooter from "@/components/ui/animated-footer-site";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthModalTrigger } from "@/components/auth/AuthModalTrigger";
import AuthSupabaseBridgeWrapper from "@/components/auth/AuthSupabaseBridgeWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { TRPCProvider } from "@/providers/trpc-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { FloatingChatBubble } from "@/components/customer/support/floating-chat-bubble";
import { Toaster } from "@/components/ui/sonner";
import { SpamFlaggedBanner } from "@/components/auth/SpamFlaggedBanner";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Integrative Clarity Font Configuration
// Inter for clean, modern UI text and body content
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Playfair Display for elegant headings and display text
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "Ishan Parihar - Spiritual Guide & Consciousness Coach",
  description:
    "Ishan Parihar offers spiritual guidance, meditation coaching, and consciousness exploration to help individuals and communities through their transformative journeys.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0ea5e9", // Set theme color to primary-500 sky blue
};

// Import the client component wrapper for SpeedInsights
import SpeedInsightsWrapper from "@/components/SpeedInsightsWrapper";

// Import performance monitoring wrapper (development only)
import { PerformanceWrapper } from "@/components/performance/PerformanceWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  // Platform navigation links
  const platformNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/assessments", label: "Assessments" },
    { href: "/framework", label: "Framework" },
    { href: "/offerings", label: "Offerings" },
  ];

  // Footer now uses internal business-focused organization

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable} scroll-smooth snap-y snap-mandatory`}
    >
      <head>
        {/* Preload Agraham font for better performance */}
        <link
          rel="preload"
          href="/fonts/agraham/Agraham.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        {/* Theme-responsive styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            /* Font definitions - integrative clarity */
            --font-primary: var(--font-inter);
            --font-ui: var(--font-inter);
            --font-body: var(--font-inter);
            --font-headings: var(--font-playfair-display);
            --font-logo: var(--font-playfair-display);
          }

          /* Remove global header padding - let individual pages handle their own spacing */

          /* Agraham font for logo */
          @font-face {
            font-family: 'Agraham';
            src: url('/fonts/agraham/Agraham.otf') format('opentype');
            font-display: swap;
            font-weight: normal;
            font-style: normal;
          }

          html {
            color-scheme: light dark;
          }
        `,
          }}
        />
      </head>
      <body
        className={`font-primary ${inter.variable} ${playfairDisplay.variable}`}
      >
        <NextThemeProvider>
          <QueryProvider>
            <TRPCProvider>
              <SessionProvider>
              <LoadingProvider>
                <CurrencyProvider>
                  <SessionProviderWrapper>
                    <AuthModalProvider>
                      <ClientBody>
                        {/* Global overlay header - positioned outside main layout flow */}
                        <HeaderServerCardNav navLinks={platformNavLinks} showAuthButtons={true} />

                        <div className="overflow-hidden">
                          <SpamFlaggedBanner />
                          <main className="overflow-hidden">{children}</main>
                          <AuthModal />
                          <AuthModalTrigger />
                          <AuthSupabaseBridgeWrapper />
                          <FloatingChatBubble />
                        </div>
                        
                        {/* Global footer - visible on all pages */}
                        <AnimatedFooter />
                      </ClientBody>
                    </AuthModalProvider>
                  </SessionProviderWrapper>
                </CurrencyProvider>
              </LoadingProvider>
              </SessionProvider>
            </TRPCProvider>
          </QueryProvider>
          <Toaster />
        </NextThemeProvider>
        {/* Client component wrapper for Vercel Speed Insights with error handling */}
        <SpeedInsightsWrapper />
        {/* Performance monitoring in development */}
        <PerformanceWrapper />
      </body>
    </html>
  );
}
