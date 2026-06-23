import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { startCollector } from "./collector";
const app = Fastify();
app.register(websocket);
const clients = new Set<any>();

app.get("/ws", { websocket: true }, (connection) => {
  const socket = connection.socket;
  console.log("[CLIENT CONNECTED]");
  clients.add(socket);
  socket.on("close", () => {
    console.log("[CLIENT DISCONNECTED]");
    clients.delete(socket);
  });
});

function publish(data: any) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === 1)
      ws.send(msg);
  }
}

app.get("/", async () => {
  return { ok: true };
});

app.get("/api/quote/:symbol", (req: any) => {
  return {
    symbol: req.params.symbol,
    price: 1050 + Math.random() * 10,
    time: Date.now(),
  };
});

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Server listening on port 3000");
  startCollector(publish);
});