export const ws = new WebSocket("ws://localhost:3000/ws");

export const subscribe = (cb: (data: any) => void) => {
  ws.onmessage = (event) => {
    cb(JSON.parse(event.data));
  };
};