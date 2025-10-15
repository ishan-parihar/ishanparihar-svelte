import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Framework | Ishan Parihar",
  description:
    "Explore our comprehensive framework for consciousness development, integrating Integral Theory and Law of One principles for transformative growth.",
  keywords: [
    "consciousness framework",
    "integral theory",
    "law of one",
    "spiritual development",
    "personal transformation",
  ],
  openGraph: {
    title: "Framework | Ishan Parihar",
    description:
      "Explore our comprehensive framework for consciousness development, integrating Integral Theory and Law of One principles for transformative growth.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Framework | Ishan Parihar",
    description:
      "Explore our comprehensive framework for consciousness development, integrating Integral Theory and Law of One principles for transformative growth.",
  },
};

export default function FrameworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
