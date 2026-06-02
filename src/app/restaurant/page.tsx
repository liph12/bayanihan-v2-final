import type { Metadata } from "next";
import { serverGet } from "@/lib/serverFetch";
import RestaurantListContent from "@/components/restaurant/RestaurantListContent";
import type { Restaurant } from "@/types";

interface RestaurantsResponse {
  data?: { restaurant?: Restaurant[] } | Restaurant[];
  restaurant?: Restaurant[];
}

export const metadata: Metadata = {
  title: "Filipino Restaurants Worldwide",
  description:
    "Discover authentic Filipino restaurants around the world. Browse by country, search by name or city, and find the flavors of home wherever you are.",
  alternates: { canonical: "/restaurant" },
  openGraph: {
    title: "Filipino Restaurants Worldwide",
    description:
      "Discover authentic Filipino restaurants around the world.",
    url: "/restaurant",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filipino Restaurants Worldwide",
    description: "Discover authentic Filipino restaurants around the world.",
  },
};

async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const data = await serverGet<RestaurantsResponse | Restaurant[]>(
      "restaurants",
      { revalidate: 60 }
    );
    if (Array.isArray(data)) return data;
    const d = data as RestaurantsResponse;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray((d?.data as { restaurant?: Restaurant[] })?.restaurant))
      return (d.data as { restaurant: Restaurant[] }).restaurant;
    if (Array.isArray(d?.restaurant)) return d.restaurant!;
    return [];
  } catch {
    return [];
  }
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();
  return <RestaurantListContent initialRestaurants={restaurants} />;
}
