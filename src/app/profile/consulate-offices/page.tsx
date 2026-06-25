import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import ConsulateOfficeManager from "@/components/profile/admin/ConsulateOfficeManager";

export const metadata: Metadata = {
  title: "Consulate Offices",
  description: "Manage the Filipino consulate & embassy directory.",
  robots: { index: false, follow: false },
};

export default function AdminConsulateOfficesPage() {
  return (
    <AdminPageShell title="Consulate Offices">
      <ConsulateOfficeManager />
    </AdminPageShell>
  );
}
