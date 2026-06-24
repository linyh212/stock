let ws: WebSocket;
const listeners: ((data: any) => void)[] = [];

export function connectWS() {
  const url = window.location.hostname === "localhost"? "ws://localhost:3000/ws" : `ws://${window.location.host}/ws`;
  ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("WS CONNECTED");
  };
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((cb) => cb(data));
    } catch (e) {
      console.error("WS parse error:", e);
    }
  };
  ws.onclose = () => {
    console.log("WS DISCONNECTED, retrying...");
    setTimeout(connectWS, 2000);
  };
}

export function subscribe(cb: (data: any) => void) {
  listeners.push(cb);
}