import dotenv from "dotenv";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import { getLatestTick, startCollector } from "./collector";
import { registerWS } from "./ws";
import { getCandles } from "./klineBuilder";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(websocket);

app.addHook("onSend", async (_req, reply, payload) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  return payload;
});

app.options("*", async (_req, reply) => {
  return reply.code(204).send();
});

app.get("/ws", { websocket: true }, (connection, req) => {
  registerWS(connection);
});

app.get("/", async () => {
  return { ok: true };
});

app.get(
  "/api/quote/:symbol",
  (
    req: FastifyRequest<{ Params: { symbol: string } }>,
    reply: FastifyReply,
  ) => {
    const tick = getLatestTick(req.params.symbol);
    if (!tick) {
      return reply.code(404).send({ error: "quote not ready" });
    }

    return tick;
  },
);

app.get(
  "/api/kline/:symbol",
  async (req: FastifyRequest<{ Params: { symbol: string } }>) => {
    const { symbol } = req.params;
    return getCandles(symbol).map((c) => ({
      time: c.time / 1000,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));
  },
);

const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });
    console.log("Server listening on port 3000");
    startCollector();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
