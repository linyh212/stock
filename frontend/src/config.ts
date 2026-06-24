const BACKEND_PORT = "3000";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function browserBackendOrigin() {
  if (typeof window === "undefined") return "http://localhost:3000";

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:${BACKEND_PORT}`;
}

export function getApiUrl(path: string) {
  const baseUrl = import.meta.env.PUBLIC_API_URL
    ? trimTrailingSlash(import.meta.env.PUBLIC_API_URL)
    : browserBackendOrigin();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export function getWsUrl() {
  if (import.meta.env.PUBLIC_WS_URL) return import.meta.env.PUBLIC_WS_URL;
  if (typeof window === "undefined") return "ws://localhost:3000/ws";

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:${BACKEND_PORT}/ws`;
}
