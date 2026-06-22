import type { MiddlewareResponseHandler } from "astro";

export const onRequest: MiddlewareResponseHandler = async (context, next) => {
  // Intercept requests to /ws for WebSocket proxying
  if (context.request.url.endsWith("/ws")) {
    // The 'upgrade' header is sent when a client wants to switch to WebSocket.
    if (context.request.headers.get("upgrade") === "websocket") {
      // In a real app, you'd proxy this to your API service.
      // For Astro's dev server, this is complex. We'll handle this in the Astro config.
    }
  }
  return next();
};