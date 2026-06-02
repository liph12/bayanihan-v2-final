import Axios from "axios";

// We route every client-side API call through Next.js's `/api-proxy/` route
// (see src/app/api-proxy/[...path]/route.ts). The proxy strips the
// Referer / Origin headers before forwarding to the real API host, so
// Laravel Sanctum doesn't promote our requests to "stateful" mode and
// demand a CSRF token — which we can't supply across origins because the
// XSRF-TOKEN cookie is set with SameSite=Lax.
//
// From the browser's perspective everything is same-origin, no CORS, no
// CSRF dance — just bearer-token auth like the Vite app uses.
//
// Server components / server-side data fetching use `serverFetch.ts`
// which hits the real API directly (no CORS or cookies in server-to-server
// requests, so the workaround isn't needed there).

const AxiosInstance = Axios.create({
  baseURL: "/api-proxy/",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Attach the auth token from localStorage on every client-side request.
// This runs in the browser only — server components use serverFetch.ts.
AxiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("authToken");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

export default AxiosInstance;
