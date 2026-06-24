import dotenv from "dotenv";
import Fastify, { FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import { startCollector } from "./collector";
import { registerWS } from "./ws";
import { getCandles } from "./klineBuilder";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(websocket);

app.get(
  "/ws",
  { websocket: true },
  (connection, req) => { registerWS(connection); }
);

app.get("/", async () => { return { ok: true }; });

app.get(
  "/api/quote/:symbol", (req: FastifyRequest<{ Params: { symbol: string }; }>) => {
    return {
      symbol: req.params.symbol,
      price: 1050 + Math.random() * 10,
      time: Date.now(),
    };
  }
);

app.get("/api/kline/:symbol", async (req: FastifyRequest<{ Params: { symbol: string }; }>) => {
    const { symbol } = req.params;
    return getCandles(symbol).map((c) => ({
      time: c.time / 1000,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
  }
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