import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import EventValidationContent from "@/components/profile/admin/EventValidationContent";

export const metadata: Metadata = {
  title: "Event Validation",
  description: "Review and validate pending events.",
  robots: { index: false, follow: false },
};

export default function EventValidationPage() {
  return (
    <AdminPageShell title="Event Validation">
      <EventValidationContent />
    </AdminPageShell>
  );
}
