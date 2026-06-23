const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";

export const ws = new WebSocket(WS_URL);

ws.onopen = () => console.log("WS OPEN");

ws.onmessage = (event) => {
  console.log("WS MESSAGE", JSON.parse(event.data));
};

ws.onerror = (e) => console.error("WS ERROR", e);

ws.onclose = () => console.log("WS CLOSED");

export default ws;