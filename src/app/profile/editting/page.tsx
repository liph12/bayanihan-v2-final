import type { Metadata } from "next";
import EditProfilePageShell from "@/components/profile/editting/EditProfilePageShell";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Edit your Bayanihan.com profile.",
  robots: { index: false, follow: false },
};

export default function EditProfilePage() {
  return <EditProfilePageShell />;
}
