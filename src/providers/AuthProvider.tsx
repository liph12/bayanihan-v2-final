"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { UserData } from "@/types";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Prototype auth: localStorage-backed (matches the existing React app).
// For production SSR, swap for cookie-based auth so server components can
// read the session via next/headers without a client hydration flash.

export interface SubDomainData {
  type?: string;
  subDomain?: { type?: string };
  [key: string]: unknown;
}

export interface UserPatch {
  [key: string]: unknown;
  details?: Record<string, unknown>;
}

export interface AuthContextValue {
  userData: UserData | null;
  authToken: string | null;
  authenticated: boolean;
  /** false until we've read localStorage on mount — use this to avoid flash */
  ready: boolean;
  isSubDomain: boolean;
  subDomainData: SubDomainData | null;
  login: (authToken: string, user: UserData) => void;
  /** Merge a partial update into the current user. No-op if not signed in.
   * Always preserves existing fields — used after profile edits so the top
   * nav / sidebar refresh without ever blanking the user record. */
  patchUser: (partial: UserPatch) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  userData: null,
  authToken: null,
  authenticated: false,
  ready: false,
  isSubDomain: false,
  subDomainData: null,
  login: () => {},
  patchUser: () => {},
  logout: () => {},
});

export function useAuthProvider(): AuthContextValue {
  return useContext(AuthContext);
}

const TOKEN_KEY = "authToken";
const USER_KEY = "userData";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const tok = window.localStorage.getItem(TOKEN_KEY);
      const raw = window.localStorage.getItem(USER_KEY);
      if (tok) setAuthToken(tok);
      if (raw) {
        try {
          setUserData(JSON.parse(raw) as UserData);
        } catch {
          /* corrupt — ignore */
        }
      }
    } finally {
      setReady(true);
    }
  }, []);

  const login = useCallback((token: string, user: UserData) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuthToken(token);
    setUserData(user);
  }, []);

  const patchUser = useCallback((partial: UserPatch) => {
    setUserData((prev) => {
      // Refuse to create a user out of thin air. If we somehow lost the
      // session, do not let a partial update create a half-formed record.
      if (!prev) return prev;
      const prevDetails =
        (prev as UserData & { details?: Record<string, unknown> }).details ?? {};
      const merged: UserData = {
        ...prev,
        ...partial,
        details: { ...prevDetails, ...(partial.details ?? {}) },
      };
      try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(merged));
      } catch {
        /* localStorage full / serialization issue — keep in-memory state */
      }
      return merged;
    });
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setUserData(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      userData,
      authToken,
      authenticated: Boolean(authToken && userData),
      ready,
      // TODO: real subdomain detection via middleware + headers().
      isSubDomain: false,
      subDomainData: null,
      login,
      patchUser,
      logout,
    }),
    [userData, authToken, ready, login, patchUser, logout]
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}
