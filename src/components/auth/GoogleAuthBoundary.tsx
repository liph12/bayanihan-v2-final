"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Loads Google Identity Services (accounts.google.com/gsi/client). Scoped to
// the sign-in page only — it used to wrap the whole app, so the GSI script
// loaded and ran on every page (including the homepage), hurting load
// performance even though only the sign-in form uses Google login.
export default function GoogleAuthBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
