import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import OrganizerStatisticsContent from "@/components/profile/admin/OrganizerStatisticsContent";

export const metadata: Metadata = {
  title: "Organizer Statistics",
  description: "Per-organizer performance and analytics.",
  robots: { index: false, follow: false },
};

export default function OrganizerStatisticsPage() {
  return (
    <AdminPageShell title="Organizer Statistics">
      <OrganizerStatisticsContent />
    </AdminPageShell>
  );
}
