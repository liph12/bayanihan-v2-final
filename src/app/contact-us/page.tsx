import type { Metadata } from "next";
import ContactContent from "@/components/contact-us/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Bayanihan.com. Reach our team for support, partnerships, or to promote your Filipino events, festivals, and restaurants worldwide.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact Bayanihan.com",
    description:
      "Get in touch with the Bayanihan team for support, partnerships, or to promote your Filipino events and restaurants.",
    url: "/contact-us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Bayanihan.com",
    description:
      "Get in touch with the Bayanihan team for support, partnerships, or to promote your Filipino events and restaurants.",
  },
};

export default function ContactUsPage() {
  return <ContactContent />;
}
