import type { Metadata } from "next";
import UserRestaurantsPageShell from "@/components/profile/my-restaurants/UserRestaurantsPageShell";

export const metadata: Metadata = {
  title: "Your Restaurants",
  description: "Manage your restaurant listings on Bayanihan.com.",
  robots: { index: false, follow: false },
};

export default function UserRestaurantsPage() {
  return <UserRestaurantsPageShell />;
}
