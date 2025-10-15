import React from "react";
import { Metadata } from "next";
import { HomePageClient } from "@/components/home-page-client";
import { getFeaturedTestimonials } from "@/queries/testimonialsQueriesServer";
import { ServiceTestimonial } from "@/lib/supabase";

export const metadata: Metadata = {
  metadataBase: new URL("https://ishanparihar.com"),
  title: {
    default: "Ishan Parihar | Spiritual Guide & Personal Growth Expert",
    template: "%s | Ishan Parihar",
  },
  description:
    "Transform your life through conscious evolution, spiritual guidance, and personal growth. Expert guidance for self-discovery, healing, and spiritual expansion.",
  keywords: [
    "spiritual guide",
    "personal growth",
    "self-discovery",
    "consciousness",
    "healing",
    "transformation",
    "spiritual awakening",
    "personal development",
    "mindfulness",
    "meditation",
    "integral theory",
    "law of one",
    "conscious evolution",
  ],
  authors: [{ name: "Ishan Parihar" }],
  creator: "Ishan Parihar",
  publisher: "Ishan Parihar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ishanparihar.com",
    siteName: "Ishan Parihar",
    title: "Ishan Parihar | Spiritual Guide & Personal Growth Expert",
    description:
      "Transform your life through conscious evolution, spiritual guidance, and personal growth.",
    images: [
      {
        url: "https://ext.same-assets.com/3349622857/2395372717.png",
        width: 1200,
        height: 630,
        alt: "Ishan Parihar - Spiritual Guide & Personal Growth Expert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishan Parihar | Spiritual Guide & Personal Growth Expert",
    description:
      "Transform your life through conscious evolution, spiritual guidance, and personal growth.",
    creator: "@integralishan",
    images: ["https://ext.same-assets.com/3349622857/2395372717.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
};

export default async function Home() {
  // Fetch featured testimonials
  let testimonials: ServiceTestimonial[] = [];
  
  try {
    testimonials = await getFeaturedTestimonials();
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    // Continue with empty array if fetch fails
  }

  return (
    <div className="min-h-screen">
      <HomePageClient testimonials={testimonials} />
    </div>
  );
}