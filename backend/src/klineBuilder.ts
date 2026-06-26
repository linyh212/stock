import { Candle, Tick } from "./types";
const candles: Candle[] = [];
const MAX_CANDLES = 400;

function minuteBucket(ts: number) {
  return Math.floor(ts / 60000) * 60000;
}

export function updateKline(tick: Tick): Candle {
  const bucket = minuteBucket(tick.timestamp);
  let candle = candles.length > 0 ? candles[candles.length - 1] : undefined;
  if (!candle || candle.time !== bucket) {
    candle = {
      symbol: tick.symbol,
      interval: "1m",
      time: bucket,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
      volume: tick.volume,
    };
    candles.push(candle);
    if (candles.length > MAX_CANDLES)
      candles.splice(0, candles.length - MAX_CANDLES);
  } else {
    candle.high = Math.max(candle.high, tick.price);
    candle.low = Math.min(candle.low, tick.price);
    candle.close = tick.price;
    candle.volume += tick.volume;
  }
  return candle;
}

export function updateCandlePrice(price: number): Candle | null {
  if (candles.length === 0) return null;
  const candle = candles[candles.length - 1];
  candle.high = Math.max(candle.high, price);
  candle.low = Math.min(candle.low, price);
  candle.close = price;
  return candle;
}

export function getCandles() {
  return candles.slice(-300);
}

export function serializeCandle(
  candle: Candle,
  volume = candle.volume,
): Candle {
  return {
    ...candle,
    time: Math.floor(candle.time / 1000),
    volume,
  };
}
