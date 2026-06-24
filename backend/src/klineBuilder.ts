import { Candle, Tick } from "./types";

const candles = new Map<string, Candle>();

function minuteBucket(ts: number) {
  return Math.floor(ts / 60000) * 60000;
}

export function updateKline(tick: Tick): Candle {
  const bucket = minuteBucket(
    tick.timestamp
  );
  const key = `${tick.symbol}-${bucket}`;
  let candle = candles.get(key);
  if (!candle) {
    candle = {
      symbol: tick.symbol,
      interval: "1m",
      time: bucket,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
      volume: tick.volume
    };
    candles.set(key, candle);
    return candle;
  }
  candle.high = Math.max(
    candle.high,
    tick.price
  );
  candle.low = Math.min(
    candle.low,
    tick.price
  );
  candle.close = tick.price;
  candle.volume += tick.volume;
  return candle;
}
export function getCandles(symbol: string) {
  return Array
    .from(candles.values())
    .filter((c) => c.symbol === symbol)
    .sort((a, b) => a.time - b.time);
}