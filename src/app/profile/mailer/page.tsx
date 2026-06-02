import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import MailerContent from "@/components/profile/admin/MailerContent";

export const metadata: Metadata = {
  title: "Mailer",
  description: "Send email campaigns and announcements.",
  robots: { index: false, follow: false },
};

export default function MailerPage() {
  return (
    <AdminPageShell title="Mailer">
      <MailerContent />
    </AdminPageShell>
  );
}
