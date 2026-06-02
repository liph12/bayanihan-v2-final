import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import RegistrationForm from "@/components/auth/RegistrationForm";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create your Bayanihan.com account. Promote Filipino events or list your Filipino restaurant — free for organizers and restaurant owners.",
  robots: { index: false, follow: true },
};

export default function RegistrationPage() {
  return (
    <AuthLayout>
      <RegistrationForm />
    </AuthLayout>
  );
}
