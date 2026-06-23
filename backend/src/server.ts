import dotenv from "dotenv";
import Fastify, { FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import { startCollector } from "./collector";
import { registerWS } from "./ws";

dotenv.config();

const app = Fastify();

app.register(websocket);

app.get("/ws", { websocket: true }, (connection) => {
  registerWS(connection);
});

app.get("/", async () => {
  return { ok: true };
});

app.get(
  "/api/quote/:symbol",
  (req: FastifyRequest<{ Params: { symbol: string } }>) => {
  return {
    symbol: req.params.symbol,
    price: 1050 + Math.random() * 10,
    time: Date.now(),
  };
});

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Server listening on port 3000");
  startCollector();
});