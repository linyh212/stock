import type { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import { createFugleWS } from "./fugleClient";

type Quote = {
  symbol: string;
  price: number;
  volume: number;
  time: number;
};

const clients = new Set<WebSocket>();

export function registerWS(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (connection) => {
    const socket = connection.socket as WebSocket;
    clients.add(socket);
    console.log("[WS] client connected:", clients.size);
    socket.on("message", (msg: Buffer) => {
      console.log("[WS] recv:", msg.toString());
    });
    socket.on("close", () => {
      clients.delete(socket);
      console.log("[WS] client disconnected:", clients.size);
    });
    socket.on("error", (err: any) => {
      console.log("[WS] error:", err);
      clients.delete(socket);
    });
  });
}

export function broadcastQuote(data: Quote) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    } catch (err) {
      clients.delete(client);
    }
  }
}