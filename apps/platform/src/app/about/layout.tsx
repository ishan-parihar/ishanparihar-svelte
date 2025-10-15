import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Framework | Ishan Parihar",
  description:
    "Discover the Framework for Integrated Living - a unique approach to conscious evolution that bridges material success and spiritual depth through timeless wisdom and cutting-edge developmental models.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
