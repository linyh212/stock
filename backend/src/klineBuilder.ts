import { Candle, Tick } from "./types";
const candlesBySymbol = new Map<string, Candle[]>();
const MAX_CANDLES_PER_SYMBOL = 400;

function minuteBucket(ts: number) {
  return Math.floor(ts / 60000) * 60000;
}

export function updateKline(tick: Tick): Candle {
  const bucket = minuteBucket(tick.timestamp);
  let symbolCandles = candlesBySymbol.get(tick.symbol);
  if (!symbolCandles) {
    symbolCandles = [];
    candlesBySymbol.set(tick.symbol, symbolCandles);
  }
  let candle =
    symbolCandles.length > 0
      ? symbolCandles[symbolCandles.length - 1]
      : undefined;
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
    symbolCandles.push(candle);
    if (symbolCandles.length > MAX_CANDLES_PER_SYMBOL) {
      symbolCandles.splice(0, symbolCandles.length - MAX_CANDLES_PER_SYMBOL);
    }
  } else {
    candle.high = Math.max(candle.high, tick.price);
    candle.low = Math.min(candle.low, tick.price);
    candle.close = tick.price;
    candle.volume += tick.volume;
  }
  return candle;
}

export function getCandles(symbol: string) {
  const symbolCandles = candlesBySymbol.get(symbol) || [];
  return symbolCandles.slice(-300);
}
