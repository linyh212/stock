import Fastify from "fastify";
import websocket from "@fastify/websocket";
import type WebSocket from "ws";
import { createClient } from "redis";

const app = Fastify({ logger: true });
await app.register(websocket);

const redis = createClient({ url: "redis://redis:6379" });
redis.on("error", (err) => console.error("Redis Error:", err));

await redis.connect();

const sub = redis.duplicate();
sub.on("error", (err) => console.error("Redis Sub Error:", err));
await sub.connect();

console.log("Redis Connected");

const clients = new Set<WebSocket>();

function safeSend(ws: WebSocket, data: any) {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify(data));
}

app.get("/", async () => {
  return {
    status: "ok",
    clients: clients.size,
  };
});

app.get("/ws", { websocket: true }, (conn) => {
  const ws = conn.socket;
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
  ws.on("error", () => clients.delete(ws));
});

function broadcast(payload: any) {
  for (const client of clients) {
    safeSend(client, payload);
  }
}

await sub.subscribe("tick_realtime", (msg) => {
  try {
    broadcast({
      type: "tick",
      data: JSON.parse(msg),
    });
  } catch (e) {
    console.error("tick parse error", e);
  }
});

await sub.subscribe("candle_realtime", (msg) => {
  try {
    broadcast({
      type: "candle",
      data: JSON.parse(msg),
    });
  } catch (e) {
    console.error("candle parse error", e);
  }
});

app.get("/candles/:symbol", async (req) => {
  const symbol = (req.params as any).symbol;
  const data = await redis.xRange("candles_stream", "-", "+");
  const candles = data
    .map((x) => {
      try {
        return JSON.parse(x.message.data);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((c: any) => c.symbol === symbol)
    .slice(-200);
  return {
    symbol,
    candles,
  };
});

await app.listen({ host: "0.0.0.0", port: 3000 });
console.log("API Started :3000");