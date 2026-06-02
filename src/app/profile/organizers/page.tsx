import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import OrganizerListContent from "@/components/profile/admin/OrganizerListContent";

export const metadata: Metadata = {
  title: "Organizer List",
  description: "Manage event organizers on Bayanihan.com.",
  robots: { index: false, follow: false },
};

export default function OrganizerListPage() {
  return (
    <AdminPageShell title="Organizer List">
      <OrganizerListContent />
    </AdminPageShell>
  );
}
