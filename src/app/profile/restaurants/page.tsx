import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import RestaurantListContent from "@/components/profile/admin/RestaurantListContent";

export const metadata: Metadata = {
  title: "Restaurant List",
  description: "Manage restaurant listings on Bayanihan.com.",
  robots: { index: false, follow: false },
};

export default function AdminRestaurantListPage() {
  return (
    <AdminPageShell title="Restaurant List">
      <RestaurantListContent />
    </AdminPageShell>
  );
}
