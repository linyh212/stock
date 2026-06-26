import dotenv from "dotenv";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import { getDailyInfo, getLatestOrderBook, getLatestTick, startCollector, } from "./collector";
import { registerWS } from "./ws";
import { getCandles, serializeCandle } from "./klineBuilder";

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

app.get("/api/quote", (req: FastifyRequest, reply: FastifyReply) => {
  const tick = getLatestTick();
  if (!tick)
    return reply.code(404).send({ error: "quote not ready" });
  const info = getDailyInfo();
  return {
    symbol: tick.symbol,
    price: tick.price,
    volume: info.volume,
    time: Date.now(),
  };
});

app.get("/api/kline", async (req: FastifyRequest) => {
  const candles = getCandles();
  const info = getDailyInfo();
  return candles.map((candle, index) =>
    serializeCandle(
      candle,
      index === candles.length - 1 && info ? info.volume : candle.volume,
    ),
  );
});

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
