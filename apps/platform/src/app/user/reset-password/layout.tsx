import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | User Account",
  description: "Create a new password for your account",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
