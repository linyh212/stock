import { createFugleWS, FugleTickData } from "./fugleClient";
import { serializeCandle, updateKline, updateCandlePrice } from "./klineBuilder";
import { OrderBook, Quote, Tick } from "./types";
import { broadcast } from "./ws";

let latestTick: Tick | null = null;
let latestOrderBook: OrderBook | null = null;
let dailyInfo: { volume: number; day: string } | null = null;

const SYMBOL = "2330";

function getTodayDayString() {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyInfo() {
  const today = getTodayDayString();
  if (!dailyInfo || dailyInfo.day !== today)
    dailyInfo = { volume: 0, day: today };
  return dailyInfo;
}
function normalizeTime(t: number): number {
  if (t > 1e17) return Math.floor(t / 1_000_000);
  if (t > 1e14) return Math.floor(t / 1_000);
  if (t > 1e11) return Math.floor(t);
  return Math.floor(t * 1000);
}

export function startCollector() {
  createFugleWS(SYMBOL, (tick: FugleTickData) => {
    console.log("[FUGLE TICK]", tick);
    const normalized: Tick = {
      symbol: tick.symbol,
      price: tick.price,
      volume: tick.volume,
      timestamp: normalizeTime(tick.time),
    };
    handleTick(normalized);
  });
  setInterval(() => {
    const tick = getLatestTick();
    if (tick) {
      const info = getDailyInfo();
      const quote: Quote = {
        symbol: tick.symbol,
        price: tick.price,
        volume: info.volume,
        time: Date.now(),
      };
      broadcast({ type: "quote", data: quote });
      const candle = updateCandlePrice(tick.price);
      if (candle) {
        broadcast({
          type: "candle",
          data: serializeCandle(candle, info.volume),
        });
      }
    }
  }, 1000);
}

export function handleTick(tick: Tick) {
  const info = getDailyInfo();
  info.volume += tick.volume;
  latestTick = tick;
  const candle = updateKline(tick);
  broadcast({
    type: "tick",
    data: tick,
  });
  broadcast({
    type: "candle",
    data: serializeCandle(candle, info.volume),
  });
}

export function getLatestTick() {
  return latestTick;
}

export function getLatestOrderBook(): OrderBook | null {
  return latestOrderBook;
}
