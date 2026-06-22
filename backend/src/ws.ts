import type { FastifyInstance } from "fastify";

type Quote = {
  symbol: string;
  price: number;
  volume: number;
  time: number;
};

let clients = new Set<any>();

export function registerWS(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (connection) => {
    const socket = connection.socket;
    clients.add(socket);
    console.log("client connected:", clients.size);
    socket.on("message", (msg: any) => {
      console.log("recv:", msg.toString());
    });
    socket.on("close", () => {
      clients.delete(socket);
      console.log("client disconnected:", clients.size);
    });
  });
}

export function broadcastQuote(data: Quote) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

export function startMockFeed() {
  let price = 1000;
  setInterval(() => {
    price += (Math.random() - 0.5) * 3;
    broadcastQuote({
      symbol: "2330",
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000),
      time: Date.now(),
    });
  }, 1000);
}