import { createClient } from "redis";

type TickData = {
  symbol: string;
  price: number;
  volume: number;
  ts: number;
};

type Candle = {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  start: number;
  end: number;
};

const buckets = new Map<string, Candle>();

const CANDLE_INTERVAL_MS = 60000;

function getBucketKey(symbol: string, ts: number, interval: number): string {
  const bucketStart = Math.floor(ts / interval) * interval;
  return `${symbol}:${bucketStart}`;
}

function updateCandle(tick: TickData) {
  const key = getBucketKey(tick.symbol, tick.ts, CANDLE_INTERVAL_MS);
  let candle = buckets.get(key);
  if (!candle) {
    const bucketStart = Math.floor(tick.ts / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
    candle = {
      symbol: tick.symbol,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
      volume: 0,
      start: bucketStart,
      end: bucketStart + CANDLE_INTERVAL_MS,
    };
    buckets.set(key, candle);
  }
  candle.high = Math.max(candle.high, tick.price);
  candle.low = Math.min(candle.low, tick.price);
  candle.close = tick.price;
  candle.volume += tick.volume;
}

async function start() {
  console.log("Candle builder starting...");
  const redis = createClient({ url: "redis://redis:6379" });
  await redis.connect();
  console.log("Candle builder connected to Redis.");

  const sub = redis.duplicate();
  await sub.connect();

  let lastId = "0-0";
  console.log("Candle builder listening for ticks...");

  setInterval(async () => {
    const results = await redis.xRead(
      { key: "ticks_stream", id: lastId },
      { COUNT: 100, BLOCK: 5000 }
    );

    if (results) {
      for (const stream of results) {
        for (const message of stream.messages) {
          const tick: TickData = {
            symbol: message.message.symbol,
            price: Number(message.message.price),
            volume: Number(message.message.volume),
            ts: Number(message.message.ts),
          };
          updateCandle(tick);
          lastId = message.id;
        }
      }
    }
  });

  setInterval(async () => {
    const now = Date.now();
    for (const [key, candle] of buckets.entries()) {
      if (candle.end < now) {
        const candleStr = JSON.stringify(candle);
        await redis.xAdd("candles_stream", "*", { data: candleStr });
        await redis.publish("candle_realtime", candleStr);
        console.log(`Published candle for ${candle.symbol} @ ${new Date(candle.start).toLocaleTimeString()}`);
        buckets.delete(key);
      }
    }
  }, 5000);
}

start().catch(console.error);
