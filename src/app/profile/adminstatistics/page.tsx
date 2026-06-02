import type { Metadata } from "next";
import AdminPageShell from "@/components/profile/admin/AdminPageShell";
import StatisticsContent from "@/components/profile/admin/StatisticsContent";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Platform-wide statistics and admin insights.",
  robots: { index: false, follow: false },
};

export default function AdminStatisticsPage() {
  return (
    <AdminPageShell title="Statistics">
      <StatisticsContent />
    </AdminPageShell>
  );
}
