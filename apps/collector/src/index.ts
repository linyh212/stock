import { createClient } from "redis";
import type { TickData } from "../../../packages/types/src/tick";

const redis = createClient({
  url: "redis://redis:6379",
});

async function start() {
  await redis.connect();
  console.log("Collector Started (Redis Stream Mode)");

  setInterval(async () => {
    const tick: TickData = {
      symbol: "2330",
      price: Number((1080 + Math.random() * 10).toFixed(2)),
      volume: Math.floor(Math.random() * 2000),
      ts: Date.now(),
    };
    console.log("Stream Tick:", tick);
    await redis.xAdd(
      "ticks_stream",
      "*",
      {
        symbol: tick.symbol,
        price: tick.price.toString(),
        volume: tick.volume.toString(),
        ts: tick.ts.toString(),
      }
    );
    await redis.publish("tick_realtime", JSON.stringify(tick));
  }, 500);
}

start().catch(console.error);