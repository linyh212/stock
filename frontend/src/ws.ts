import { getWsUrl } from "./config";
import type { WSMessage } from "./types";

type SubscribableType = Exclude<WSMessage["type"], "ping">;
type MessageData<T extends SubscribableType> = Extract<
  WSMessage,
  { type: T }
>["data"];

const listeners = new Map<SubscribableType, ((data: any) => void)[]>();
let ws: WebSocket | null = null;

export function connectWS() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  const wsUrl = getWsUrl();
  console.log(`Connecting to WebSocket at ${wsUrl}...`);
  ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    console.log("WebSocket connected");
  };
  ws.onmessage = (event) => {
    try {
      const message: WSMessage = JSON.parse(event.data);
      if (message.type === "ping") return;
      listeners
        .get(message.type)
        ?.forEach((callback) => callback(message.data));
    } catch (error) {
      console.error("Error parsing or handling WebSocket message:", error);
    }
  };
  ws.onclose = () => {
    console.log("WebSocket disconnected. Reconnecting in 1 second...");
    ws = null;
    setTimeout(connectWS, 1000);
  };
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws?.close();
  };
}

export function subscribe<T extends SubscribableType>(type: T, callback: (data: MessageData<T>) => void,): () => void {
  if (!listeners.has(type)) listeners.set(type, []);
  listeners.get(type)!.push(callback);
  return () => {
    const typeListeners = listeners.get(type);
    if (!typeListeners) return;
    const index = typeListeners.indexOf(callback);
    if (index > -1) typeListeners.splice(index, 1);
  };
}
