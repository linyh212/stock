import Fastify, { FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import { startCollector } from "./collector";
import { WebSocket } from "ws";

const app = Fastify();
app.register(websocket);
const clients = new Set<WebSocket>();

function broadcast(data: unknown) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

app.get("/ws", { websocket: true }, (connection) => {
  const socket = connection.socket;
  clients.add(socket);
  console.log("client connected:", clients.size);
  socket.on("message", (msg) => {
    console.log("recv:", msg.toString());
  });
  socket.on("close", () => {
    clients.delete(socket);
    console.log("client disconnected:", clients.size);
  });
});

app.get("/api/quote/:symbol", (req: FastifyRequest<{ Params: { symbol: string } }>) => {
  const { symbol } = req.params;
  return {
    symbol,
    price: 1050 + Math.random() * 10,
    time: Date.now(),
  };
});

app.get("/", async () => {
  return {
    status: "ok",
    service: "stock-backend",
    time: Date.now(),
  };
});

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Server listening on port 3000");
  startCollector(broadcast);
});