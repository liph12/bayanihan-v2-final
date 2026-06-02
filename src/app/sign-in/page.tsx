import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Bayanihan.com account to manage your Filipino events, restaurants, and profile.",
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
