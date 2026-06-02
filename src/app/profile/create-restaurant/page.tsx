import type { Metadata } from "next";
import CreateRestaurantPageShell from "@/components/profile/create/CreateRestaurantPageShell";

export const metadata: Metadata = {
  title: "Create Restaurant",
  description: "List your Filipino restaurant on Bayanihan.com.",
  robots: { index: false, follow: false },
};

export default function CreateRestaurantPage() {
  return <CreateRestaurantPageShell />;
}
