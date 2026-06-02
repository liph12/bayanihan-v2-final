import type { Metadata } from "next";
import ProfileContent from "@/components/profile/ProfileContent";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Bayanihan.com profile.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileContent />;
}
