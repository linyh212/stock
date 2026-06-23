export const ws = new WebSocket("ws://backend:3000/ws");

export const subscribe = (cb: (data: any) => void) => {
  ws.onmessage = (event) => {
    cb(JSON.parse(event.data));
  };
};

ws.onopen = () => {
  console.log("WS CONNECTED");
};

ws.onmessage = (msg) => {
  console.log("WS MSG:", msg.data);
};